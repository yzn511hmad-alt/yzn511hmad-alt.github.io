# Fire, aurora and ground-lighting optimization — 5 November 2026

This pass uses the current project as its baseline, after the source changes
between tools. It does not reuse the previous box/environment optimization's
measurements. Before-source is preserved in `work/effects-20261105/before/`;
accepted source and SHA256 hashes are in `accepted/` and `accepted-manifest.json`
inside that work folder. `node scripts/verify-effects-version.mjs` detects a
different/missing implementation after future edits or tool handoffs.

## Implemented

**KTX2 masks:** the two sky masks are grayscale and fully opaque, and the shader
reads only their red channel. Store that channel exactly as R8 KTX2 with Zstd;
decode in a short-lived worker using the installed official parser/decoder.
Preserve dimensions, red values, linear filtering, no mipmaps and orientation.
Keep the original WebP path on worker/file/format failure. No Basis/ETC1S/UASTC
or lossy GPU block encoding is involved.

**Dynamic lighting bake:** reuse the original 48-sample diffuse irradiance in a
1×1 RGBA32F target each draw, then fetch its exact float32 result in the sky and
snow vertices. The producer uses the original sky vertex shader shape and both
varyings; four vertices evaluate 192 original sample lookups instead of repeating
the integral across the ground/rim vertices and scene passes. Receiver vertices
also perform one shared lookup. The animated radiance, all 48 integration samples,
reflection lobes and original precision remain. The reflection is not frozen into
a still image. Unsupported float rendering or failed preparation retains the
original vertex calculation. Target/viewport/scissor/tone/XR state is restored.

**Fire:** intersect the ember draw with a conservative scissor around its exact
elliptical support, retaining the original geometry, UVs and fragment shader.
Pixels outside this box were already discarded. Restore the preceding scissor.
Keep the original MP4, resolution,25fps and native VideoTexture frame callbacks.
Avoid repeated motion setters; distinguish an intentionally aborted pending
`play()` from an autoplay-policy failure so visibility/reduced-motion changes
can resume without a new click. Use only a decoded poster, retain a valid decoded
video frame if the poster is unavailable, and mark the initial loaded frame for
upload once. No second video/animation loop was added.

The current appearance, including the strong existing ground reflection bands,
is preserved. This is an efficiency pass, not a new realism/lighting design.
The current HTML poster buffering, box model, ice optics, quality tiers, DPR/frame
caps, and existing shared scene loop were preserved.

## Bytes and memory

| Mask | Existing WebP | New KTX2 | Original GPU RGBA8 | New GPU R8 |
| --- | ---: | ---: | ---: | ---: |
| Landscape1672×941 | 83,380B | 84,845B | 6,293,408B | 1,573,352B |
| Portrait941×1672 | 18,520B | 19,766B | 6,293,408B | 1,573,352B |

Actual GL allocation tracing verifies **4,720,056 bytes (~4.5MiB),75% less logical
GPU mask storage per loaded orientation**. The additional RGBA32F target contains
16 logical color bytes, without depth/mipmaps. Driver padding/metadata and actual
device RAM were not measured. The R8 CPU array remains with its texture for
reupload compatibility; worker peak memory and total browser RAM are unmeasured.

The GPU saving comes from exact redundant-channel packing, not Zstd itself.
Zstd is reversible file/transport compression. Mask downloads increase slightly;
the45,237B worker is16,675B with negotiated Brotli. First-load transfer therefore
adds roughly18KB rather than claiming a smaller overall page. Worker termination
and WebP fallback were observed. No Basis/worker-pool files were downloaded.

Converting the aurora color artwork was rejected:4,251,542B WebP became
10,295,752B KTX2; its smaller fallback1,167,228B became2,447,607B, with no GPU
storage benefit. Those rejected files stay only in research staging. The original
fire video was already remuxed/stripped; converting its frames to KTX2 would expand
the sequence. No new lossy video/image encode was introduced.

## Before / after: final warm paired repeat

Local Windows/Edge156, ANGLE Intel UHD D3D11, Three r186. Controlled desktop
viewport1517×693, DPR1.25, enhanced tier, transmission scale1. These are declared
test settings near the recording's physical dimensions; the user's original
browser DPR is unknown. No physical-phone performance claim.

Identical isolated probes surround the **whole stage draw**, including the new
bake pass, model updates, main rendering and hit projection. CPU is wall-clock
submission/traversal/driver-wait duration; GPU uses asynchronous disjoint timer
queries. CDP task duration measures page-main-thread work. Neither is OS CPU/GPU
utilization, and the page metric excludes worker CPU. No `gl.finish`, screenshots
or recording during timed windows. Align only the melt-state test input, leaving
Date.now/GSAP untouched; restart the logical test run after cold readiness where
necessary. Warm for2.5s, then sample three2.4s windows per phase.

| Phase | GPU ms/draw before → after | CPU ms/draw before → after | Scene submissions/s before → after |
| --- | ---: | ---: | ---: |
| Melting | 19.36 → 17.80 (~8% less) | 10.90 → 12.10 (~11% more) | 42.15 → 45.19 |
| Key available | 17.44 → 15.04 (~14% less) | 11.19 → 9.04 (~19% less) | 44.79 → 46.71 |

Page-main-thread task work/second: melting645.9→753.2ms (**increased16.6%**),
key-available687.7→592.6ms (**decreased13.8%**). Do not advertise a universal
CPU reduction. The earlier first pair showed GPU savings near49%, but its much
slower baseline did not persist in the repeat; that is not the approved headline.
All raw trials remain available. These small local samples establish observations,
not statistical significance or performance guarantees on every device.

Final paired12windows: no page errors, disjoint events or dropped queries; roughly
97.5–99.1% GPU sample coverage, with pending tail counts reported. App cadence is
separate from browser RAF cadence. Same production caps throughout. Issued draw
commands increase98→99 and94→95 because the cache adds one two-triangle,1-pixel
pass; main geometry is unchanged. Reduced shader work, not fewer draw calls,
accounts for the useful GPU result.

Reports: `work/effects-20261105/{before,after,before-repeat,after-repeat}/report.json`.
The independent final numbers and limitations are in
`work/compression-guard/effects-20261105/FINAL-REVIEW.md`.

## Quality and integration evidence

- Complete mask decompression/reconstruction matches source bytes. Twelve
  filtered/cropped RGBA sampling comparisons match exactly.
- The final Mesh bake matches14 complete Float32 comparisons across seven times
  and desktop/portrait crops. An earlier rejected POINTS variant had tiny float
  differences and is retained separately as `point-proof.json`.
- **14 actual full-scene RGBA framebuffer comparisons** at seven aurora times on
  desktop and portrait match with zero changed pixels/alpha/GL errors. These are
  local-driver proofs, not a promise of bit identity on every GPU.
- Twelve ember-scissor RGBA tests, including transparent alpha, partial existing
  scissor and DPR1/1.25/1.75, are exact with state restored.
- Actual playback without recording completed two native fire loops; the final
  native counter reported379frames/0dropped. This is not app FPS. Reduced motion,
  offscreen pause and both resumes passed. Two representative loop-boundary
  images were inspected. A heavy recording attempt overloaded the test setup;
  it was stopped and is not timing or motion-approval evidence.
- `npm run build` passed strict TypeScript and production Vite.
- `node scripts/test-free-key-effects.cjs URL` passed desktop collection, reduced
  phone, KTX2 HTTP503→WebP fallback, and poster HTTP503+autoplay NotAllowedError.
  The latter still uploads one valid paused1440×1080 video frame. All four cases
  have no JS/GL/unexpected console errors; each worker terminates.
- `node scripts/test-delivery.mjs URL` passed exact HTTP encodings, negotiation,
  HEAD/revalidation, fonts/ranges and unrelated-resource scoping. Worker template
  URLs are included in the delivery graph; KTX2 uses `image/ktx2`. The independent
  production HTTP proof verifies every delivered byte.
- Independent actual-production screenshots and final source guards were
  reviewed in `work/effects-20261105/motion/PRODUCTION-REVIEW.md`.

Artifacts: `work/compression-guard/effects-20261105/` and
`work/effects-20261105/{baking,motion,production-checks}/`.
Only the parent integrated and built production. Profiling globals/hooks are
isolated in `vite.profile.mts`, not shipped in source components.

Primary references: [KTX2](https://github.khronos.org/KTX-Specification/ktxspec.v2.html),
[DataTexture](https://threejs.org/docs/pages/DataTexture.html),
[KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html),
[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html),
[float targets](https://registry.khronos.org/webgl/extensions/EXT_color_buffer_float/),
[WebGL2](https://registry.khronos.org/webgl/specs/latest/2.0/),
[video callbacks](https://wicg.github.io/video-rvfc/),
[HTML media](https://html.spec.whatwg.org/multipage/media.html#dom-media-play).
