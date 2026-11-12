# IKEA Indonesia local replica

React + Vite replica of five IKEA Indonesia pages: `/in`, `/in/penawaran/produk-terlaris#all`, `/in/lokasi-kami`, `/in/layanan-pelanggan/faq`, and `/in/tentang/perusahaan-ikea`.

Run `npm install` and `npm run dev -- --host 127.0.0.1` for development. Run `npm run build` followed by `npm run preview -- --host 127.0.0.1 --port 4173` to inspect the production build.

Original rendered HTML, desktop/mobile screenshots, source layout measurements, and localized-media provenance are under `.pwc/cloudflare-source/` and `.pwc/asset-cache/`. The reference is the live **11 November 2026** 11.11 campaign capture; later live IKEA content can differ. The app uses localized IKEA fonts, campaign GIFs, product photos, and seven videos from `public/assets/`. FAQ content contains the captured 67 questions and answers; location selection covers the captured 14 cities.

Raw capture HTML, screenshots, and duplicate media caches remain local and are excluded from Git. Verification reports, JSON measurements, and asset provenance are tracked; all runtime media are included in `public/assets/`.

The Perfect-Web-Clone native capture failed before browser launch because Windows denied its async subprocess pipe. Cloudflare Browser Rendering was used separately to capture the reference and replay local interactions. `.pwc/run.json` records gate results, measured visual scores, and remaining differences. The local cart, filters, search feedback, and menu are frontend interactions; IKEA account, catalog, and checkout services are outside this replica.

Verification commands: `pwc fingerprints src`, `pwc fingerprints dist`, `pwc weight dist`, `node --check .pwc/interaction-probe.js`, and `$env:IKEA_AUDIT_BASE='http://127.0.0.1:4173'; python .pwc/audit_runtime.py`. The last check HEAD-tests all five routes, seven videos, fifteen Best product images, and two fonts. Current visual and interaction replay evidence is indexed in `.pwc/run.json`.

The [verification handoff](.pwc/final-report.md) lists the route previews, measured scores, interaction checks, and known limits.
