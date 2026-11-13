/** Audit actual React-rendered navigation without requiring a native browser. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { rolldown } from 'rolldown';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const project = path.resolve(import.meta.dirname, '..');
const entry = path.join(project, 'src/main.jsx');
const temporary = path.join(project, '.pwc/.navigation-render.mjs');
const paths = ['/in', '/in/penawaran/produk-terlaris', '/in/lokasi-kami', '/in/layanan-pelanggan/faq', '/in/tentang/perusahaan-ikea'];
const allowed = new Set(paths);
const pageClasses = ['home', 'best-page', 'stores-page', 'faq-page', 'about-page'];
const findings = [];
const source = await fs.readFile(entry, 'utf8');
const menuStatePattern = /(\[\s*menu\s*,\s*setMenu\s*\]\s*=\s*useState\()\s*false(\))/;
const canRenderOpenMenu = menuStatePattern.test(source);

const bundle = await rolldown({
  input: entry,
  external: ['react', 'react-dom/client', 'react/jsx-runtime', 'lucide-react'],
  plugins: [{
    name: 'navigation-audit-export',
    load(id) {
      if (path.resolve(id) !== entry) return null;
      return source.replace(menuStatePattern, '$1globalThis.__navigationAuditMenuOpen || false$2')
        .replace(/^import ['"]\.\/styles\.css['"];?\r?\n/m, '')
        .replace(/createRoot\(document\.getElementById\(['"]root['"]\)\)\.render\(<App\/>\);?/, 'export { App };');
    },
  }],
});

try {
  const generated = await bundle.generate({ format: 'esm' });
  await fs.writeFile(temporary, generated.output.find(item => item.type === 'chunk').code);
  const { App } = await import(pathToFileURL(temporary).href + '?audit=' + Date.now());
  globalThis.localStorage = { getItem: () => null };
  const cases = [...paths, ...paths.map(value => value + '/'), '/', '/in/makanan-ikea', '/not-created/faq', '/in/penawaran/produk-terlaris-extra'].map(value => ({ path: value, menuOpen: false }));
  if (canRenderOpenMenu) cases.push(...paths.map(value => ({ path: value, menuOpen: true })));
  const pages = [];
  const rendered = [];
  const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'");
  for (const scenario of cases) {
    const current = scenario.path;
    globalThis.__navigationAuditMenuOpen = scenario.menuOpen;
    globalThis.window = { location: { pathname: current, hash: '', href: 'http://clone.test' + current } };
    const html = renderToStaticMarkup(React.createElement(App));
    const anchors = Array.from(html.matchAll(/<a\b[^>]*>/g)).map(match => {
      const value = match[0].match(/\bhref="([^"]*)"/);
      return value ? decode(value[1]) : null;
    }).filter(value => value !== null);
    const ids = new Set(Array.from(html.matchAll(/\bid="([^"]*)"/g)).map(match => decode(match[1])));
    const normalized = current === '/' ? '/in' : current.replace(/\/$/, '');
    const isKnown = allowed.has(normalized);
    const isNotFound = /<h1\b[^>]*>[^<]*(?:Halaman tidak ditemukan|404)/i.test(html);
    const mainClasses = (html.match(/<main\b[^>]*class="([^"]*)"/)?.[1] || '').split(/\s+/);
    const countClass = name => Array.from(html.matchAll(/\bclass="([^"]*)"/g)).filter(value => value[1].split(/\s+/).includes(name)).length;
    const expectedClass = pageClasses[paths.indexOf(normalized)];
    if (isKnown && !mainClasses.includes(expectedClass)) findings.push({ current, issue: 'Route renders the wrong cloned page', expected_class: expectedClass, actual_classes: mainClasses });
    const contentExpectations = { '/in': ['product', 16], '/in/penawaran/produk-terlaris': ['best-product', 15], '/in/lokasi-kami': ['store-card', 7], '/in/layanan-pelanggan/faq': ['question', 67] };
    const expectedContent = contentExpectations[normalized];
    if (expectedContent && countClass(expectedContent[0]) !== expectedContent[1]) findings.push({ current, issue: 'Cloned page content unexpectedly removed', expected: expectedContent, actual_count: countClass(expectedContent[0]) });
    if (isKnown && isNotFound) findings.push({ current, issue: 'Known route displays NotFound' });
    if (!isKnown && !isNotFound) findings.push({ current, issue: 'Unknown route silently displays an existing page' });
    const destinations = new Set();
    for (const href of anchors) {
      const url = new URL(href, 'http://clone.test' + current);
      if (url.origin === 'http://clone.test') {
        const target = url.pathname.replace(/\/$/, '') || '/';
        if (!allowed.has(target)) findings.push({ current, href, issue: 'Destination has no cloned page' });
        destinations.add(target);
        if (url.hash && target === normalized && !(target === paths[1] && url.hash === '#all') && !ids.has(decodeURIComponent(url.hash.slice(1)))) {
          findings.push({ current, href, issue: 'Fragment target does not exist' });
        }
      } else if (/\.?ikea\.co\.id$/i.test(url.hostname)) {
        findings.push({ current, href, issue: 'Site navigation escapes to the original IKEA website' });
      } else if (!['https:', 'http:', 'tel:', 'mailto:'].includes(url.protocol)) {
        findings.push({ current, href, issue: 'Unsupported URL scheme' });
      }
    }
    const missing = paths.filter(value => !destinations.has(value));
    if (missing.length) findings.push({ current, issue: 'Cloned page absent from navigation', missing });
    pages.push({ path: current, menu_open: scenario.menuOpen, anchor_count: anchors.length, destinations: [...destinations], not_found: isNotFound });
    rendered.push({ path: current, normalized, anchors, ids });
  }
  for (const current of rendered) {
    for (const href of current.anchors) {
      const url = new URL(href, 'http://clone.test' + current.path);
      const target = url.pathname.replace(/\/$/, '');
      if (url.origin !== 'http://clone.test' || !url.hash || target === current.normalized || (target === paths[1] && url.hash === '#all')) continue;
      const targetPage = rendered.find(value => value.path === target);
      if (targetPage && !targetPage.ids.has(decodeURIComponent(url.hash.slice(1)))) findings.push({ current: current.path, href, issue: 'Cross-page fragment target does not exist' });
    }
  }
  const report = {
    checked_at: new Date().toISOString(),
    method: 'Actual React server rendering from source through installed Rolldown. Open drawer branch rendered by injecting its initial React state only in the audit bundle; no browser clicks or visual layout claims.',
    open_menu_audit_available: canRenderOpenMenu,
    source_sha256: crypto.createHash('sha256').update(source).digest('hex'),
    allowed_paths: paths,
    pages,
    findings,
    pass: findings.length === 0,
    browser_limitation: 'Native Playwright still fails before launch with Windows async subprocess pipe WinError 5; dynamic menu/FAQ/pickup links require separate source review.',
  };
  await fs.writeFile(path.join(project, '.pwc/checks/navigation-render.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ pass: report.pass, cases: pages.length, findings: findings.length, first_findings: findings.slice(0, 12), report: '.pwc/checks/navigation-render.json' }, null, 2));
  if (!report.pass) process.exitCode = 1;
} finally {
  await bundle.close();
  await fs.rm(temporary, { force: true });
}
