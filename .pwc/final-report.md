# IKEA Indonesia replica: verification handoff

The production preview is `http://127.0.0.1:4173`. The reference is the live IKEA Indonesia **11 November 2026** 11.11 campaign capture; later source content can differ.

| Requested page | Local preview |
|---|---|
| Home | [Open Home](http://127.0.0.1:4173/in) |
| Spesial 11.11 / best sellers | [Open Best](http://127.0.0.1:4173/in/penawaran/produk-terlaris#all) |
| Store locations | [Open Stores](http://127.0.0.1:4173/in/lokasi-kami) |
| FAQ | [Open FAQ](http://127.0.0.1:4173/in/layanan-pelanggan/faq) |
| IKEA company | [Open About](http://127.0.0.1:4173/in/tentang/perusahaan-ikea) |

The app follows the captured page structure and uses localized original campaign media, IKEA fonts, product photos, and seven videos. It implements the menu, search feedback, banner/category controls, FAQ accordions, pickup-city selection, carousel, and local cart states. Account, full catalog, and checkout backends are outside this static replica.

## Evidence and checks

- Original desktop/mobile rendered HTML and full-page screenshots: `cloudflare-source/`.
- Candidate captures, viewport crops, and replay reports: `candidate/`; revision and gate ledger: `run.json`.
- V15 production build, `pwc fingerprints src` and `pwc fingerprints dist` (zero), `pwc weight dist` (authored code **106.727 KB** of 120 KB), probe syntax, and 29/29 production preview HEAD checks all passed. Machine-readable results: `checks/`.
- V13 remote interaction replay passed Home desktop/mobile 8/8 applicable checks and Best desktop/mobile 7/7, including requested direct `#all` entry, BILLY carousel, menu, search, and cart. Source Home product cards have no favorite button, so that check is recorded N/A. V15 changes only Best carousel image geometry; **its final replay is unverified** after Browser Rendering failed and the unresponsive retry was cancelled.

## Visual comparison

`pwc score` compared equally sized first-viewport crops with no masks (1440×1000 desktop; 390×844 mobile). These are measured candidate scores, **not** a claim of 1:1 parity. The acceptance threshold is 0.97.

| Page | Desktop score / checkpoint | Mobile score / checkpoint |
|---|---:|---:|
| Home | 0.8899 / V11 | 0.8903 / V11 |
| Best sellers | 0.7095 / V11 | 0.5591 / V11 |
| Stores | 0.8602 / V10 | 0.7591 / V11 |
| FAQ | 0.7401 / V10 | 0.7682 / V11 |
| About | 0.7692 / V10 | 0.4294 / V11 |

The source About mobile page itself overflows to 1080px, which limits direct 390px visual comparison. The 480×1000 open-menu crop improved from 0.7795 (V10) to 0.8309 (V13). V15 uncrops the original Best composite media and restores source slide widths, but its desktop/mobile screenshots and replay **could not be completed**: the first Browser Rendering call returned a non-JSON tool-call error and a retry was cancelled after about five minutes without response. See `candidate/v15-rendering-residual.json`. Earlier Best scores above are the last measured evidence.

Perfect-Web-Clone's native extractor failed before browser launch because Windows denied its async subprocess pipe; a later native host recheck also failed. Cloudflare Browser Rendering independently supplied source captures and candidate replay, but does not turn the native capture integrity gate green. See `capture-error.txt` and `native-host-recheck.json`.

## Navigation cleanup, 13 November 2026

The local site now exposes only the five cloned pages listed above. `/` opens Home, and an unknown path displays a dedicated page linking to the five available routes. The header, drawer, and footer use those routes. Cards whose original destination is outside the replica remain visible without a misleading link or click prompt; product cards retain local cart toggles. FAQ answer links to unsupported IKEA pages are unwrapped while preserving their text. Valid local page links, the captured customer-service email, and Google Maps directions remain.

This cleanup changes the UI after the V13/V15 replay above. Those replay results are historical evidence and **do not verify the revised controls**. The Nov 13 source passed independent static route/CSS review. The final production build passed, and `node .pwc/verify_navigation.mjs` rendered 19 route/menu cases with zero invalid links, including the five exact routes, aliases, unknown paths, and open-menu navigation. Results are in `checks/navigation-build.json` and `checks/navigation-render.json`; the final source SHA-256 is `b06b86c874132de3f1c8c2cbb916b95ae3898ed683ce8fe6e54f1ad7d3260640`. Native browser automation remained unavailable, so click behavior in the revised build is unverified. The original visual scores also predate this cleanup; they remain the last measured comparison rather than scores for the latest build.
