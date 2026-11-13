# IKEA Indonesia local replica

React + Vite replica of five IKEA Indonesia pages: `/in`, `/in/penawaran/produk-terlaris#all`, `/in/lokasi-kami`, `/in/layanan-pelanggan/faq`, and `/in/tentang/perusahaan-ikea`.

Run `npm install` and `npm run dev -- --host 127.0.0.1` for development. Run `npm run build` followed by `npm run preview -- --host 127.0.0.1 --port 4173` to inspect the production build.

Original rendered HTML, desktop/mobile screenshots, source layout measurements, and localized-media provenance are under `.pwc/cloudflare-source/` and `.pwc/asset-cache/`. The reference is the live **11 November 2026** 11.11 campaign capture; later live IKEA content can differ. The app uses localized IKEA fonts, campaign GIFs, product photos, and seven videos from `public/assets/`. FAQ content contains the captured 67 questions and answers; location selection covers the captured 14 cities.

Raw capture HTML, screenshots, and duplicate media caches remain local and are excluded from Git. Verification reports, JSON measurements, and asset provenance are tracked; all runtime media are included in `public/assets/`.

Navigation is limited to the five cloned routes. The root path `/` opens Home; unknown paths show a page with links to those routes. Product and campaign cards without a cloned destination remain visible as non-clickable content. Search, filters, cart toggles, FAQ accordions, location selection, and carousels operate on local data. Google Maps directions and the captured customer-service email remain available. IKEA account, full catalog, and checkout services are outside this replica.

The Perfect-Web-Clone native capture failed before browser launch because Windows denied its async subprocess pipe. Cloudflare Browser Rendering was used separately to capture the reference and replay earlier local interactions. `.pwc/run.json` records the original gate results, measured visual scores, and remaining differences. The 13 November navigation cleanup was verified separately by build and rendered-link audit; the older interaction replay does not verify the revised UI.

Verification commands for the original replica: `pwc fingerprints src`, `pwc fingerprints dist`, `pwc weight dist`, `node --check .pwc/interaction-probe.js`, and `$env:IKEA_AUDIT_BASE='http://127.0.0.1:4173'; python .pwc/audit_runtime.py`. The last check HEAD-tests all five routes, seven videos, fifteen Best product images, and two fonts. For the 13 November navigation cleanup, `node .pwc/verify_navigation.mjs` rendered 19 route/menu cases with zero invalid links; the production build passed. Results are in `.pwc/checks/navigation-render.json` and `.pwc/checks/navigation-build.json`.

The [verification handoff](.pwc/final-report.md) lists the route previews, measured scores, navigation cleanup checks, and known limits.
