# Free Key — verified lossless compression

This records the compression verification completed before the subsequent Premium CTA redesign on 4 November 2026. That HTML/CSS change has its own evidence in `work/premium-cta-20261104/`; the original transfer figures and stage identity below remain historical measurements of the compression task.

Scope: `/free-key.html` and its owned resources only, following the owner's latest instruction. No other page design, HTML, game art or shared logo was changed. Shared JavaScript/CSS receives exact HTTP compression only because it is a dependency of Free Key. There is no site-wide public-file pruning.

## Implemented

- Recompressed 36 Free Key image variants without resizing, recolouring, new lossy encoding, or changing alpha/data channels. Full decoded RGBA, ICC/orientation, browser canvas output and straight-alpha/no-colour-conversion GPU readback match the originals.
- The image variants total 39,222,747 → 38,786,030 bytes: 436,717 bytes saved across alternatives, not a single visit. The original 6,000,398-byte packed wood normal/roughness map remains unchanged; its alpha channel contains roughness data.
- Losslessly repacked the existing JPEG's DCT coefficients, including the original ICC profile. The walnut colour image is 2,429,894 → 2,277,978 bytes. This preserves the already accepted JPEG pixels; it does not recover detail lost in its original JPEG encoding.
- Repacked both existing H.264 flame videos without re-encoding. Removed only encoder-information SEI and nonvisual container metadata. All 135 frames, timestamps, dimensions, 25fps and 5.4s duration match in native YUV, RGBA and actual browser decoding. Combined saving: 1,507 bytes. The videos retain faststart and byte-range playback.
- Recompressed the Sekuya WOFF2 transformed stream with all glyphs, metrics, shaping tables and hints intact: 27,976 → 27,936 bytes. Browser rendering and metrics for 736 codepoints match.
- Deduplicated only byte-identical complete vertex attribute tuples during chest construction. Triangle order, positions, normals, UV seams, groups, material parameters, sockets, lid poses and explode poses are unchanged. The original chest factory remains intact at `?chest=legacy`.
- Every build creates beneficial Brotli quality11, gzip9 and optional Zstandard22 transport variants for the Free Key resource graph. Every output is decompressed and byte-compared before deployment. Original MIME, identity fallback, q-values, `Vary: Accept-Encoding`, range requests and content-based validators are preserved. Mutable public URLs revalidate; Vite content-hashed code is immutable.

## Transfer measurements

Final cold-browser comparison is recorded in the task's network reports. These use the same restored-available state, screen size, default cache behaviour in a fresh context and native unlock interaction. They are not a universal first-paint, first-ever waiting-state or physical-phone benchmark. External Google Fonts are outside local compression ownership.

The original local preview already gzipped text; savings must compare captured network bytes against that baseline, not against raw JavaScript size. Encoded transfer, decoded memory, decode CPU and rendering time are separate costs.

| Cold restored-available flow | Before wire bytes | After wire bytes | Additional saving |
|---|---:|---:|---:|
| Laptop viewport 1528×800 | 24,758,834 | 24,394,416 | 364,418 B / 1.47% |
| Phone emulation 390×844 | 9,883,110 | 9,717,945 | 165,165 B / 1.67% |

Both flows make 27 local requests. The extra transfer reduction is modest because the accepted scene already uses strongly compressed imagery and video. The larger packed texture and flame assets dominate the bytes and cannot be arbitrarily shrunk under exact-quality constraints.

Precompressed alternatives consume extra deployment storage, alongside identity files and backups. A browser negotiates one representation per request; it does not download all sidecars. Preserving originals and compatibility variants therefore makes the workspace/build larger even while individual transfers become smaller.

## Memory and CPU costs

| Measured item | Before | After | Meaning |
|---|---:|---:|---|
| Desktop-tier chest attributes + indices | 1,450,152 B | 639,336 B | 810,816 B / 55.9% fewer geometry buffer bytes |
| Mobile-tier chest attributes + indices | 763,008 B | 350,720 B | 412,288 B / 54.0% fewer geometry buffer bytes |
| Local desktop chest construction median | 23.31ms | 65.12ms | Extra 41.81ms once; texture loading mocked |
| Local mobile-tier construction median | 9.96ms | 23.43ms | Extra 13.47ms once on the same desktop CPU |
| Local JPEG Blob decode median | 94.95ms | 264.25ms | Extra 169.30ms to maximise the lossless byte saving |

CPU observations are from the local desktop/Edge156 environment after competing encoders were closed. They exclude network and GPU upload. Mobile-tier timings are emulation on that computer, not a physical phone. No universal FPS or faster-loading promise is made. Image dimensions and decoded texture RAM/GPU allocations do not decrease. Exact indexing also creates temporary construction data; peak whole-process RAM was not measured.

## Browser compatibility correction

An initial staged Zstandard candidate decompressed correctly in Node but exceeded browsers' HTTP window limit. It was rejected before the primary production preview was rebuilt. The final encoder caps each input's window to at most 8MiB, validates the generated frame header, and uses a new compression-cache identity. This follows [RFC9659](https://www.rfc-editor.org/rfc/rfc9659.html#section-3). Independent validation checks all frame boundaries, rejects old oversized samples and fetches all 57 final Zstandard resources through actual Edge HTTP decoding with matching lengths and SHA256 hashes.

## Rejected or inapplicable techniques

- Lossless AVIF for the packed wood data was larger: 6,858,933 bytes versus the existing 6,000,398-byte WebP. Existing tested lossless WebP remains.
- Lossless VP9 for the mobile flame was 13,120,552 bytes versus the existing 2,050,268-byte H.264 source; no new player or codec was introduced.
- No texture resolution, geometry accuracy, shader detail, DPR, frame rate, accepted effects or responsive quality tiers were reduced. Lossy GPU texture formats, lossy re-encoding, geometry quantisation and simplification are outside the no-quality-loss requirement.
- Four PNG-to-WebP conversions involving the shared logo/catalog art showed browser premultiplication differences. They were never integrated, and all of those assets are outside the final Free Key scope.

## Build and review locally

Run `npm run build`, then `npm run preview -- --host 127.0.0.1`. Open `/free-key.html` on the reported preview URL. The full transport compression is demonstrated in this build preview; the Vite development page remains a development workflow. Node24 is recommended; Zstandard generation is optional when the runtime lacks it, with Brotli/gzip retained.

Run `npm run test:free-key-compression -- http://127.0.0.1:4173 dist` against that preview. Sidecar files alone do not activate compression on an arbitrary hosting provider: its server/CDN must negotiate the prepared formats with equivalent MIME, Vary, validators and identity/range behaviour. No external hosting was changed.

## Reversibility and evidence

Original sources/configuration and changed assets are preserved under `work/compression-guard/max-lossless-20261103/before/`. The complete previous build is under `baseline/dist/`. The original shared logos, catalog assets, other page sources/build HTML and legacy chest factory have byte-identity checks. New mask WebP files are separate; their original PNGs remain present.

The task folder contains `integration.json`, `scope-proof.json`, `images/recommended-free-key.json`, `images/browser-free-key-proof.json`, `perf/integrated-geometry-proof.json`, `perf/font-report.json`, `perf/video-report.json`, `perf/browser-media-proof.json`, `perf/delivery-proof.json`, `perf/browser-delivery-proof.json` and actual rendered frames under `captures/`. Global/archive experiments in that work folder are research history and are not final production modifications.

Final verification passed: production build/typecheck; native desktop mouse, phone touch, reduced-motion keyboard, tablet portrait touch, tablet landscape touch and legacy rollback flows; eight natural playback frames and the fire-loop boundary; hidden-page suspension/resume; vault boundary/state tests; production HTTP negotiation/cache/range tests; final desktop/mobile rendered output. Both independent quality and compression reviewers approved the final output. All 221 scoped production files/sidecars/manifest match the reviewed stage byte-for-byte. Final wire measurements are in `transfer-comparison.json` and `production-cold/network.json`; final independent browser decoding is in `perf/production-browser-delivery-proof.json`.

Primary technique references: [Google WebP exact/lossless options](https://developers.google.com/speed/webp/docs/cwebp), [libjpeg-turbo coefficient-domain transcoding](https://github.com/libjpeg-turbo/libjpeg-turbo/blob/main/doc/usage.txt), [Node compression APIs](https://nodejs.org/api/zlib.html), [HTTP negotiation](https://httpwg.org/specs/rfc9110.html#field.accept-encoding). Detailed source links and limits are also in the independent image/performance reports.
