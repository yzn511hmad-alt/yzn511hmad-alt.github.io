# Snowy — implemented technology stack

Updated 25 October 2026. This describes the implementation and measured checks, rather than treating installed packages as proof of use.

| Area | Implementation |
| --- | --- |
| Core | Vite, strict TypeScript, semantic HTML5, custom CSS and design tokens. No Tailwind or React. |
| Motion | Official `gsap`, `gsap/ScrollTrigger`, `gsap/ScrollToPlugin`, and `gsap/SplitText`. The former local SplitText implementation is a compatibility re-export of the official plugin. |
| Scrolling | Official `lenis` with its CSS, `smoothWheel: true` unless reduced motion is requested, and `autoRaf: false`. Every page's ScrollManager subscribes to GSAP's shared clock. |
| Coordination | `src/core/FrameLoop.ts` subscribes once to GSAP's ticker. Lenis updates first, then the visual coordinator and model. No independent continuous application RAF loop is used by the active Three.js systems. Rive manages its official runtime loop, coordinated through visibility and motion preferences. |
| WebGL | Official Three.js and custom GLSL topographic background, dynamically loaded near its section. Signed scroll velocity and position feed the shader. The current home page mounts SnowyHub2D for its interactive panel; the GLB viewer and compressed assets remain available in source. |
| Shared renderer | `SharedRenderer.ts` owns one Three.js context. A lone view renders directly into its DOM WebGL canvas with no frame copies. Concurrent views share a stable drawing buffer with scissored retained copies. Buffer sizing changes only when view dimensions change. Rive retains its own internal context. |
| GLB compression | Draco and Meshopt assets and official decoder integrations remain available for SakuraModelViewer. The current home page uses the DOM panel and does not request GLB files. |
| GPU textures | Both delivery GLBs embed a genuine Basis UASTC KTX2 normal texture applied to the graphite housing. KTX2Loader detects GPU capabilities on the shared renderer and transcodes it. Interactive screen/sidebar textures intentionally remain CanvasTextures because they change with UI state. |
| Rive | Official `@rive-app/canvas`, self-hosted WASM and fallback WASM. The existing asset's `bumpy` state machine and `bump` trigger respond to hover, click, focus and keyboard activation of the preview button. Rendering suspends when hidden/off-screen. This asset uses supported legacy state-machine inputs; a future Rive major release may require re-authoring it with data binding. |
| Raster/vector assets | AVIF/WebP are used through picture elements and lazy-loaded gallery images; SVG supplies scalable graphics/icons. |
| Quality | DPR capped at 1.25 on low-power devices, 1.75 otherwise; background DPR at 1/1.25. Model update target is 30/60 fps. Mobile dynamic UI textures use half the linear resolution. Settings are evaluated on resize/update. Codec is selected at initial model load. |
| Visibility/motion | IntersectionObserver skips off-screen views; the shared clock skips updates while document.hidden. Rive's own loop follows the same visibility state. Reduced-motion mode disables smooth wheel scrolling and entrance splitting, freezes decorative model/shader motion, and retains functional UI. |
| Layout/accessibility | Meaningful content stays in DOM/CSS. The Snowy Hub interface is rendered by default as a native, ultra-crisp 2D DOM component (`SnowyHub2D.ts`) with real toggles, sliders, and tab routing, The 3D viewer implementation is retained in source. WebGL output is decorative and aria-hidden. The preview is a native button and official SplitText supplies its ARIA treatment. These changes are not a full WCAG audit. |

## Asset pipeline

`npm run assets:build` generates the compressed variants from `public/assets/snowy_hub.glb`, extracts the four-mesh WEB scene, drops unused authoring scenes/animations, embeds the housing's KTX2 normal texture, and copies the matching official Draco/Basis decoders and Rive WASM files.

Tools: glTF Transform, Draco, Meshoptimizer and the Basis Universal encoder distributed through `@gpu-tex-enc/basis`. The runtime uses the official Three.js loader implementations. Required packages are declared in package.json and locked in package-lock.json.

| Asset | Bytes |
| --- | ---: |
| Original authoring GLB | 3,063,132 |
| Draco + KTX2 web scene | 68,636 |
| Meshopt + KTX2 web scene | 51,616 |

Savings include removal of unused authoring data as well as compression. See `public/assets/models/manifest.json` for the generated metadata.

## Verification

```sh
npm run assets:build
npm run test:stack
npm run build
npm run preview -- --host 127.0.0.1 --port 5178
# In another terminal:
npm run test:browser
```

`test:stack` actually decodes both geometry codecs, verifies the original scene's names/bounds, checks required compression extensions and the embedded KTX2 header. `test:browser` uses installed Microsoft Edge through Playwright and accepts an optional base URL argument. It checks desktop/mobile/reduced-motion rendering, real GPU textures, real Rive trigger activation, shared Three.js context, off-screen suspension, local asset responses, layout overflow and the four secondary pages. Screenshots and measured results are saved in `work/stack-checks`.

Backups of existing application source files are stored in `work/stack-backup-20261025`. The browser tests cover the local production build; this does not claim testing every browser, real device, or deployed hosting environment.

## Official references

- [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)
- [Lenis integration](https://github.com/darkroomengineering/lenis)
- [Three.js multiple views](https://threejs.org/docs/)
- [Rive runtime parameters](https://rive.app/docs/runtimes/web/rive-parameters)

## Scroll performance correction — 25 October 2026

The ambient snow/dot effect has been removed from all five pages at the user’s request, including its markup, CSS and JavaScript. Background rendering is direct WebGL in the current single-view page, eliminating repeated setSize calls and GPU-to-2D copies. Quality media queries are reused and shader frame cadence retains its fractional remainder. GSAP lag smoothing is disabled for consistent Lenis timing.

A local Edge/Playwright wheel-scroll profile across four warmed sections measured p95 frame intervals of 27.8–27.9 ms before and 14.3–20.9 ms after. Intervals over 25 ms were 167/1191 before and 6/1680 after. Steady-scroll WebGL buffer resets and copies dropped from up to 266/133 to zero. These historical measurements were taken before complete removal of the dots. They are local diagnostics, not a universal FPS guarantee.

Raw profiles: work/scroll-checks/scroll-baseline.json and scroll-final.json. Browser regressions cover direct rendering, zero resize/copy while scrolling, absence of background particles, DOM tab interaction, mobile and reduced motion. A two-surface renderer pixel test verifies distinct sizes, clipping, resize and a shared context.

Reproduce with npm run profile:scroll while the production preview runs on port 5178. For npm run test:renderer, start the Vite dev server on port 5179.

## Free Key — The Frozen Vault

The Free Key page is rebuilt around a procedural Three.js ice cube, upright gold key, meltwater and a hollow arched treasure chest. The ice changes geometry during a real 30-second wall-clock countdown. After the timer, pointer capture supports mouse/touch dragging to the projected lock; a native-button keyboard path completes the same interaction. GSAP animates key insertion, the hinged lid and a reward card.

The scene uses the shared native WebGL surface with antialiasing enabled only for this view, generated studio environment/textures, capped DPR and 30 fps while active. Frozen/unlocked scenes render only on change. IntersectionObserver and document visibility suspend GPU work; the wall-clock timer catches up on return. Reduced-motion and a non-WebGL fallback remain functional. No global snow particles were reintroduced.

Pass generation remains local, explicitly requested by the user. crypto.getRandomValues generates the display string; session state and a 24-hour local expiry are maintained. No backend issuance, HWID binding or access authentication is implemented or claimed by this feature. The scene/controller separation leaves an issuer integration point at completion. This is not a secure server-enforced waiting period.

Files: src/components/FrozenVault.ts, VaultState.ts, src/webgl/FrozenVaultScene.ts, src/styles/frozen-vault.css and src/pages/free-key.ts. Original page/source: work/frozen-vault-backup-20261025.

Checks: npm run test:vault; npm run test:vault:browser with the production preview on port 5178; npm run test:vault:duration waits a real 30 seconds and checks off-screen/hidden suspension and stable buffer dimensions. The measured threshold in the real-time run was 30020 ms. Desktop, touch emulation, reduced motion, keyboard completion, invalid drops, copy, refresh, reset and disabled WebGL passed in local Edge.


## Frozen Vault — cinematic revision, 25 October 2026

The Free Key chapter now uses a scoped midnight palette, editorial headline and a generated arctic cave background plate. The page deliberately does not change the saved global theme. The ice, key, detailed enamel/brass chest, opening lid and reward remain live Three.js geometry. The photographic cave is a 2D background texture; no claim of a fully modeled cave is made.

Background and grayscale ice fissure source images were generated with the built-in image generation tool, then optimized with Sharp into public/assets/vault/glacial-sanctum.webp, ice-fissures.webp and ice-fissure-mask.webp. The fissure mask is derived from the grayscale source. Textures are project-local; no image service or CDN is needed at runtime. Generated source images and prompts are retained in the Codex workspace, while runtime assets are in this project.

Physical materials use more restrained refraction, surface fissures, brushed-metal detail and warm/cold lighting. The organic thaw continuously contracts the rounded ice geometry and exposes the key. The inline countdown remains in the scene while thawing. The non-WebGL fallback now contracts its ice shell as well. GPU drawing still suspends off screen and on hidden tabs; shared animation loop, capped DPR, reduced motion and keyboard controls are preserved. No global snow particles were added.

Validation: production build, exact-boundary/state tests, desktop mouse, touch emulation, native keyboard, reduced motion, disabled WebGL, invalid drop, copy, refresh and reset all passed. A real timer run measured 30019 ms with zero buffer resizes; hidden/off-screen rendering suspension passed. These are local Edge/Playwright results, not physical device or all-browser certification. Pass issuance is still local as requested.

Source before this revision: work/vault-before-cinematic-20261025. No additional package dependencies were introduced.


## Contact — brushable snow welcome, 27 October 2026

The Contact hero is a local, interactive powder field around semantic DOM text. Mouse or horizontal touch movement pushes snow aside and leaves persistent tracks; a native Clear / Reset button provides keyboard access. A short one-time mobile breeze introduces the interaction. Vertical touch scrolling is preserved. The form remains outside the canvas and supports its existing local draft / copy / download flow; no outbound messaging service was added.

ContactSnow.ts loads dynamically and renders one instanced quad batch through the existing SharedSurface, using a ten-sprite texture atlas and the coordinated FrameLoop. A project-local generated powder photograph is sampled into irregular sprite cutouts. DPR is capped at 1.5 on desktop and 1.25 on mobile. Simulation / GPU work sleeps after motion settles and suspends off screen or while hidden. Reduced motion disables cursor physics; missing WebGL or JavaScript leaves the welcome and form available. Context loss uses the static welcome, then resumes on recovery.

The texture is public/assets/contact/snow-powder.webp (242884 bytes), generated with the built-in image tool and optimized with Sharp. No new package dependencies. New files: src/components/ContactSnow.ts, src/styles/contact-snow.css, scripts/test-contact-snow.cjs. Original contact source: work/contact-before-snow-20261027.

Checks: npm run build and npm run test:contact-snow passed in local Edge/Playwright. Tests cover actual pixel clearing on mouse/touch, stable idle / hidden / offscreen drawing, capped buffers with zero interaction resizes, clear/reset by keyboard, reduced motion, disabled WebGL, no-JS content, form draft, copy, download and no horizontal overflow. An independent touch gesture scrolled the page 193 px through the hero.

An initial Canvas 2D prototype was replaced after a local pointer-stroke profile measured p95 frame intervals of 97.2 ms. The instanced WebGL version measured p95 7.1 ms in the same local scenario, with zero sampled intervals over 33 ms. These are local headless diagnostics, not a physical-device or all-browser FPS guarantee. No global ambient snow effect was restored.


## Current site: Polar Night and camera parallax — 27 October 2026

All five public pages start dark/polar-night in HTML. ThemeManager replaces legacy light storage. polar-night.css coordinates navy #07111d, slate #102335/#152b3a, text #dfeaf1/#9bafbf, cyan #8ed8ef, sea-glass #83aea9 and restrained brass #c9b58a. Light styles remain dormant for the later design phase.

Contact snow and Free Key ice/key/chest source, styles, textures and old browser tests were removed and archived in work/dark-parallax-backup-20261027. Contact retains its local draft/copy/download flow. Free Key uses semantic DOM, native progress and a 30-second local generator with session restoration/copy/reset/24-hour expiry. No backend authentication is claimed.

GlacialAtmosphere.ts coordinates a CSS-composited 2.5D world: generated aurora sky/distant mountains, haze, middle atmospheric plane and alpha foreground snow ridge. Different depth factors .16/.34/.65/1.25 follow mouse/scroll with damping. This is a layered camera illusion, not a fully modeled 3D landscape. No falling snow or global particle system is active. The old home topographic shader is unmounted so it cannot cover the shared world.

The camera subscribes to the shared GSAP FrameLoop only while converging, then sleeps. Hidden tabs suspend updates. Reduced motion/slow update use static layers; coarse pointers use reduced scroll-only movement. Background updates use transforms without per-frame layout reads, canvas resizing or GPU readback. The background adds no WebGL renderer. All image assets are local optimized WebP, including a smaller mobile sky.

Validation: npm run build and npm run test:polar-night passed. The browser check covers 15 page/device/motion combinations, legacy light storage, pointer/scroll depth differences, idle/hidden/reduced motion, no removed downloads or Contact/Free canvases, no overflow/JS errors/local 404, contact draft/copy and catalog search/modal. A real Free Key run measured 30064 ms with partial reload, no early result, copy/reset and zero WebGL calls; npm run test:free-key reproduces it.

Local parallax profiling reported desktop p95 7.3 ms across 746 rAF intervals (2 over 33 ms), mobile-emulation p95 7.1 ms across 129 intervals (0 over 33 ms), with stable idle transforms. These are local headless Edge diagnostics, not physical-device/all-browser certification. Reproduce with npm run profile:parallax. Raw results: work/polar-night-checks.


## Background scope update — 27 October 2026
The aurora landscape and PolarCamera now mount only on Contact and Free Key. Home, Scripts and Pricing retain Polar Night colors with a quiet static backdrop and no landscape requests or camera module. Every snowy-signoff footer is opaque #07111d. The camera additionally suspends when main content leaves the viewport. The current browser check verifies this page scope and the opaque footer as well as existing motion, theme and functional checks.


## Arctic Horizon — horizontal aurora, stars and crescent

Contact and Free Key now use a coordinated Arctic night composition: a static star/moon/mountain sky and one independent horizontal aurora light sheet. The near snow ridge and existing camera parallax remain. No falling particles, twinkling star loop, WebGL scene or runtime video were added. The other three pages and opaque footer remain outside the scene.

The aurora uses the existing FrameLoop, with at most 20 updates/second on desktop and 15 on coarse/mobile pointers. It sleeps when hidden or when main content leaves the viewport. Reduced-motion, slow-update, saveData and <=2-core modes retain the light as a static image. NetworkInformation change events update saveData behavior live. pagehide cleanup survives bfcache returns.

New generated, local WebP assets: polar-horizon-sky.webp (39440 bytes), polar-horizon-sky-mobile.webp (12004), aurora-horizon.webp (191816), aurora-horizon-mobile.webp (57052), plus existing polar-night-ridge.webp (147364). Whole desktop background is approximately 379 KB; mobile approximately 216 KB before HTTP headers. Earlier image variants are archived in work/before-arctic-horizon-20261027.

Independent Edge/Playwright QA passed all 10 page/motion/quality cases, including dynamic saveData toggles, hidden/resume, stable sky/foreground while the light moves, no overflow/errors/404/canvas, opaque footer and no landscape downloads on the other three pages. npm run test:aurora reproduces the core checks.

Four-second local static-vs-moving diagnostics: desktop p95 7.1/7.2 ms, task time .162/.311 s; mobile emulation p95 7.1/7.1 ms, task time .153/.243 s. No sampled frame exceeded 33 ms and LayoutCount delta was zero in all four cases. These are local browser diagnostics, not real-device or all-browser guarantees. Independent QA/performance artifacts are retained in the Codex workspace work/arctic-horizon.


## Clear Aurora — static sky, input-only parallax — 27 October 2026

This revision supersedes the autonomous light-sheet motion described above. The aurora has no time-driven animation, CSS keyframes, or continuous background update loop. It remains still without input. Mouse and scroll camera input moves all seven depth planes: sky .16, aurora .85, haze .34, range .65, near ridge 1.25, stars .28 and moon .48. The camera unsubscribes from FrameLoop after damping settles; hidden/offscreen/reduced-motion/slow-update suspension remains. Mobile uses reduced scroll-only parallax.

Aurora opacity and saturation are stronger and the veil is lighter. A moonless sky plate replaces the baked crescent, with an independent detailed 88px desktop / 70px mobile moon below the aurora. Static SVG stars and moon render above the veil. Mobile intro spacing reserves room for the moon. No falling snow, star twinkle or autonomous aurora motion runs. Contact and Free Key remain the only landscape pages; every footer remains opaque.

Current local assets: polar-clear-sky.webp (44274 bytes), mobile sky (13260), polar-moon.webp (21758, alpha), polar-stars.svg (4220), retained aurora-horizon desktop/mobile (191816/57052) and polar-night-ridge.webp (147364). Generated sources/prompts are retained in the Codex workspace.

Validation: npm run build; npm run test:sky-parallax (also test:aurora); npm run profile:parallax. Browser checks cover desktop, touch emulation, reduced motion, input-only camera movement on the aurora, stable idle/hidden layers, moon placement, opaque footer, no local 404/JS errors/canvas/overflow, and absent landscape requests on Home/Scripts/Pricing. Raw current checks are in work/clear-sky-checks. Local headless timing measurements are diagnostic and do not certify every physical device or browser.


## Current Moonlit Aurora — coherent moonlight and clouds — 27 October 2026

This revision replaces the separate moon cutout and supersedes the preceding sky compositions. Generated landscape and art-directed portrait plates combine the original curved teal aurora with a full moon, receiving cirrus/cloud illumination, mist and distant silver-blue snow peaks in one coherent exposure. Moon and clouds share the same camera plane (.58) so their lighting cannot drift. Existing alpha foreground ridge remains separate (1.25), with a subtle alpha-masked right-side moonlight wash; haze/range/star planes preserve depth. This is a layered 2.5D environment, not a fully modeled landscape.

Camera is still input-driven only: mouse and scroll transforms, sleep at convergence, suspension hidden/main-offscreen, static reduced/slow mode, reduced scroll-only touch motion. No autonomous aurora/star animation, snowfall, runtime video, canvas, WebGL context or extra clock was added. Only Contact and Free Key load the scene; all footers remain opaque.

Local WebP plates: moonlit-aurora.webp (1672x941,112204 bytes), moonlit-aurora-portrait.webp (941x1672,129654). Orientation-based CSS and preloads select one plate so portrait phones/tablets retain moon and aurora. The retained alpha ridge is147364 bytes and static star SVG4220. No external image runtime service is required. Generated originals and full prompts are retained in the Codex workspace work/moonlit-sky and outputs/moonlit-sky-art-prompts.md.

Free Key intro now places copy beneath the left headline in the dark sky. Decorative Contact symbol is hidden so it cannot obscure the moon. Topic cards, guidance and FAQs have local dark surfaces to protect contrast against moonlit clouds. Contact draft and Free Key local generator behavior are unchanged.

Validation: npm run build; npm run test:moonlit-sky (also test:sky-parallax/test:aurora) passes8 cases covering both pages on desktop/mobile/reduced plus short desktop and portrait tablet. It decodes the selected image, verifies absence of detached moon, different camera depth motion, stable idle/hidden/reduced state, opaque footer, no overflow/errors/local404/canvas and no landscape downloads on the other3 pages. Reproduce with preview5178. Results: work/moonlit-sky-checks. npm run profile:parallax measures local timing; these diagnostics do not certify every real device/browser.


## Current Layered Aurora — animated transparent light — 27 October 2026

This revision supersedes the preceding static combined plate. The environment is now separated into a far sky/moon/cloud exposure (.16), a genuinely transparent aurora (.58), a transparent distant mountain range (.65), and the retained near snow ridge (1.25), plus subtle haze/stars. Moonlit cloud coverage is reduced. Landscape and portrait variants retain the original scene composition. The sky and receiving clouds remain coherent while the separate ranges create camera depth. All layers are decorative; semantic DOM content remains accessible.

AuroraFlow.ts lazily mounts one transparent quad through the existing SharedSurface/Three.js renderer and shared GSAP FrameLoop. Independent slow shader deformation fields bend the light filaments and vary their emission; there is no short video/GIF loop and no animated whole-scene brightness or blur. The CSS alpha image is shown as the fallback, and hidden only after the matching GPU texture draws. Premultiplied alpha keeps soft edges clean; a clear aperture protects the moon. This is an artistic2.5D effect, not a physical plasma simulation.

The sole WebGL surface renders directly without GPU-to-2D copies, capped at20fps desktop/12fps low power. Physical buffers are bounded by1100x760 or900x640, with DPR no greater than1/.75 respectively. Buffer sizing occurs only on layout/viewport changes. Drawing pauses when the tab is hidden or main content is off screen; phases resume without a time jump. Reduced motion, slow update, saveData and <=2-core initial quality use the static image without loading Three.js. Live quality changes pause/resume; context loss falls back to CSS and restores drawing on recovery. No global snowfall was added. Only Contact/Free Key mount the environment; all footers stay opaque.

New project-local assets: moonlit-sky-layer.webp(61076 bytes), its portrait(53656), moonlit-aurora-ribbon.webp(279732 alpha), portrait(241440 alpha), moonlit-far-range.webp(65500 alpha), portrait(56350 alpha). Original near ridge and star SVG remain. Generated originals/full prompts are retained in Codex workspace work/natural-aurora and outputs/natural-aurora-layer-prompts.md.

Validation: npm run build; npm run test:natural-aurora (also test:aurora/test:sky-parallax/test:moonlit-sky) passes11 desktop/mobile/tablet/short-screen/reduced/quality/fallback/lifecycle cases. Test-only readbacks verify changing light pixels and transparent moon/mountain regions; runtime does not read back GPU data. Tests also verify cadence caps, zero steady buffer reallocations/copies, hidden/offscreen pause, dynamic preferences, orientation, context recovery, page lifecycle and scope on the other3 pages. npm run test:browser passed15 page/motion cases plus contact draft/copy and catalog search/modal. npm run test:free-key passed a real30-second wait, reload/copy/reset with exactly the decorative aurora context allowed.

Local static-vs-flow profiling (work/natural-aurora/performance.json in Codex workspace) reports zero buffer reallocations during pointer/scroll motion. These headless measurements are local diagnostics, not certification for every real device/browser. The MP4 in workspace outputs is a demonstration recording, never a runtime background dependency.


## Current Top Aurora — approved horizontal composition —27 October2026

The approved aurora-top-concept.png is applied to Contact/Free Key. The aurora is a full-width horizontal curtain at the top; the moon and star field remain below it, with the independent far/near mountains retained at the bottom. The desktop sky is derived from the approved concept. The portrait sky remains art-directed so its moon stays visible. Footers and the other3 pages remain outside the environment.

New local assets are moonlit-aurora-ribbon-top.webp(232706 bytes,alpha) and moonlit-sky-top.webp(56816). The aurora is mapped across its64vh layer with explicit stretch UVs on all sizes rather than cropping a landscape curtain to its middle on phones. A persistent CSS fit property keeps fallback/GPU alignment consistent even while the fallback background is hidden. The shader projects the moon aperture from its independent sky plane. Its quad is cropped to the upper56% of the surface, including the maximum wave displacement, avoiding shading blank lower sky. Wave amplitudes are slightly more visible while preserving the shared clock, renderer, buffer/frame caps and motion/quality suspension.

Validation: npm run build and npm run test:top-aurora pass11 layout/motion/quality/lifecycle cases. Test-only pixel samples prove light changes at rest, remains in the upper part of the viewport, stays above/clear of the moon, and retains native direct drawing with zero steady resizes/copies. Scope on the other3 pages is checked. Raw results: work/top-aurora-checks. Performance and actual local recording are retained in Codex workspace work/top-aurora and outputs/aurora-top-live.mp4. Sources/prompts are in outputs/aurora-top-applied-prompts.md. Backup: work/before-top-aurora-20261027. Local measurements do not certify every physical device/browser.


## Current Living Aurora — visible independent light flow — 27 October 2026

Supersedes the preceding top-aurora motion parameters and automatic <=2-core disabling. The same alpha image and separate sky/range/foreground composition are retained. Independent larger folds, fine ray advection, and spatially traveling emission now make motion visible below the header, with no mouse input and no global brightness/blur animation. The existing direct shared GL surface and GSAP clock remain; desktop/low-power cadence caps are30/20fps. Resolution limits remain unchanged. No video dependency or new bitmap asset was added.

An accessible Play/Pause aurora button stays above page content. Explicit choice persists under snowy:aurora-motion in localStorage, with blocked-storage fallback and cross-tab updates. Pause freezes the current frame. OS reduced motion, slow updates and saveData default to still; explicit Play overrides those for aurora only, while camera parallax continues to honor reduced motion. Few CPU cores now select the existing low-power tier rather than silently disabling light motion. Hidden/offscreen drawing still pauses, and context recovery/static fallback remain intact.

Validation: npm run build and npm run test:top-aurora pass11 cases +3 scope cases. Test-only GPU comparisons measure visible changed area and mean RGBA delta below the header over2.2seconds, with idle camera invariance, real-time FPS, zero steady surface resizes/copies, controls/persistence, preferences, lowCPU, context recovery and mobile/orientation. Raw results: work/living-aurora-checks. Current artifacts and static-camera recording are in Codex workspace outputs/aurora-living-*. Local headless profiling is diagnostic, not a promise for all hardware. Backup: work/before-living-aurora-20261027.


## Current Aurora Position — no motion button — 27 October 2026

The user-requested refinement supersedes the previous Play/Pause control. The button, CSS, event handlers, observer and stored preference handling were removed. Old snowy:aurora-motion values are ignored, so an earlier Pause cannot leave the scene disabled after removing its control. Aurora runs automatically when the normal motion/data/visibility quality conditions allow it. The light plane is lowered by clamp(18px,3.2vh,32px), preserving the existing shader, moon aperture projection, mountain parallax and cadence/resolution caps.

Validation: npm run build and npm run test:top-aurora pass11 cases +3 page-scope checks. Tests seed an obsolete off preference and verify no control exists, light pixels still flow, moon is clear, sizes remain responsive and preferences/lifecycle still work. Current results: work/aurora-position-checks. Backup: work/before-aurora-position-20261027.


## Current Ice-Blue Aurora Palette —27 October2026

The aurora now shares the ground's ice/steel-blue and silver color family. One static CSS filter on .aurora-flow (hue-rotate30deg, saturation.55, brightness.9) color-grades both its existing alpha image and animated canvas, keeping the fallback consistent. Existing bitmap sources, shader motion, position, moon/cloud lighting and mountain parallax are unchanged; no runtime video, new texture, clock or WebGL surface was added. The motion button remains removed.

Validation: npm run build and four local page/viewport/motion visual checks pass (desktop Free Key/Contact, mobile Contact and reduced-motion static Free Key). Local pointer/scroll profiles retain zero buffer reallocations, with artifacts in Codex workspace outputs/aurora-ice-blue-*. Measurements are local diagnostics. Backup: work/before-ice-blue-aurora-20261027.


## Current Detailed Aurora —27 October2026

Supersedes the earlier1100px desktop surface cap. AuroraFlow uses desktop1800x1000/DPR<=1 and low-power900x700/DPR<=.9, while retaining30/20fps caps, shared direct rendering, hidden/offscreen pause and the existing ice-blue CSS grade. Coherent irregular multiscale strand density is evaluated in flowingUV, with darker inter-strand gaps and sparse brighter cores, filtered by physical surface width and revealed over1.2s. The source alpha image, soft edges, moon aperture, scene composition and parallax remain intact. No new bitmap/video runtime asset, renderer or clock is introduced. The button stays removed.

Validation: npm run build; npm run test:top-aurora passes12 cases including1920x1080/DPR1.5 laptop +3 scope checks. Lifecycle media tests await native MQL event delivery and a rendered frame, without dispatching application events. Raw results: work/aurora-detail-checks. FullHD CRF17 demonstration, screenshots and local performance measurements are in Codex workspace outputs/aurora-detailed-*. Measurements do not certify all devices. Backup: work/before-detailed-aurora-20261027.


## Current Adaptive Aurora Resolution

User selected automatic resolution based on screen and performance. AuroraQuality bounds native DPR (desktop1.5/low1.25), dimensions3840x1440/1440x1000 and full-surface pixels3.2M/.9M (rounded buffer tolerance). Start at the earlier conservative resolution; measured calm windows slowly earn upgrades, and sustained CPU/GPU/frame pressure reduces scale with hysteresis/cooldowns. Upgrades wait for an idle camera. Existing shared ticker detects DPR changes; no extra loop, renderer or product control. Strand frequency is stable in CSS/world coordinates, with physical-pixel attenuation avoiding pattern jumps while quality adapts. This is not a claim that the existing1672x941 image is native8K.

Optional bounded asynchronous EXT_disjoint_timer_query_webgl2 samples measure GPU work; wall-clock frame gaps and CPU submission guard compositor/main-thread pressure. Unsupported timers retain conservative CPU/frame adaptation. Warm-up/resume/resize windows are excluded, old revisions/disjoint samples discarded, pending queries bounded and cleaned on pause/resize/dispose; restored contexts reacquire extension. Reduced/saveData/slow-update static defaults and scene scope are unchanged.

Validation: build;20 policy/timer cases via test:aurora-quality;12 browser cases +3 scope checks, final lifecycle recheck; controlled adaptation and unsupported-timer CPU downshift; live DPR-change check. Current screenshots/reports/profiles: Codex workspace outputs/aurora-auto-*. Backup: work/before-auto-aurora-20261028. Local measurements do not certify all hardware.


## Current Short-Laptop Composition and SDR Recording —28 October2026

Free Key has height-aware desktop composition for widths>=961px and heights<=900px, with an additional <=640px tier. Content width, heading size and card spacing now let the title and primary action fit short laptop screens.1920x1080 and phone layout remain as before. Scroll restoration is not forcibly reset: the missing headline in the reported screenshot was reproduced at scrollY400. Existing scene, ice-blue palette and adaptive aurora quality remain unchanged.

The reference recording screenshot has expanded whites compared with both the website and independently decoded source video. Player/range interpretation is inferred, not directly inspected. New scripts/record-aurora.cjs and npm run record:aurora explicitly convert captured JPEG-full to SDR BT709 limited, set frame/encoder primaries/transfer/matrix/range and retain CRF17. Four page-layout reviews pass and production build passes. Artifacts and exact geometry/color evidence: Codex workspace outputs/scene-consistency-report.md. Stronger palette is preview-only pending user preference. Backup: work/before-laptop-composition-20261028.


## Current Approved Reference Colors —28 October2026

User approved the stronger reference palette for Contact/Free Key. reference-colors.css authors direct scoped UI colors (primary#f1feff, accent#94e9ff, deep navy#000412/#03192d), including navigation, forms, selected/disabled/focus states. Explicit polar-night+has-polar-world selectors override grouped legacy theme rules. No filter is applied to body/html/app/main/header; static logo image is graded separately. Only the decorative fixed world receives contrast1.12/brightness1.03. Footer remains opaque with original colors; other3 pages remain outside the palette. Scene animation/adaptive quality and short-laptop geometry are unchanged. Both HTML critical links and page TS imports load the palette.

Validation: build and6 palette/layout/motion cases +3 scope checks passed, including1px geometry comparisons and fixed-header behavior at scroll400. Local static/flowing pointer-scroll profiling is recorded in Codex workspace outputs/reference-colors-*. New actual-page recording uses explicit SDR BT709 limited export. These results supersede earlier notes saying stronger colors were preview-only. Backup: work/before-reference-palette-20261028.


## Current Natural Single-Curtain Aurora — 29 October 2026

The user rejected the layered-curtain experiment. The exact pre-experiment PolarCamera, single-sheet AuroraFlow and critical scene CSS were restored from work/before-layered-aurora-20261029 before a new morphology was applied. The trial-only baked assets and generator were archived under work/rejected-layered-aurora-20261029, outside public and scripts. No layered shader, per-sheet view offsets or layer metadata remains.

The new aurora-natural-fold-v1.webp(1672x941, alpha,255212bytes) is a built-in ImageGen edit of the previous aurora source, preserving its cyan/turquoise/silver source palette for the existing unchanged ice-blue CSS grade. A single asymmetric folded curtain has irregular lower light edges, fine upward-fading rays and natural dark gaps. The original sky/moon/clouds/stars/mountains, page layouts and approved stronger colors are retained. CSS background height80% and matching persistent --aurora-height/.8 UV mapping keep the static and animated image aligned. Lateral ray-warp amplitudes are reduced from.016/.005 to.006/.0015 to keep rays mostly vertical; rolling folds, local emission, shared renderer/ticker,30/20fps caps and adaptive quality remain.

Validation: production build; independent9 browser cases +3 scope checks; targeted official lifecycle check (native reduced-motion, saveData, orientation, offscreen pause, context loss/restoration and page lifecycle); local static-vs-flow pointer/scroll profile. Test-side pixels show moving light while moon alpha remains0. Motion/data/WebGL fallbacks, fixed header, opaque footer and no scene on the other3 pages are checked. Local measurements do not certify every physical device. Artifacts, source prompt and actual-page recording: Codex workspace outputs/natural-aurora-shape-*.

The moon aperture now derives its radii from the projected full disc plus24CSSpx to cover relative sky/aurora parallax. A focused whole-disc readback found faint edge overlap missed by the former centre-only probe; the corrected official checks sample the whole disc rather than imposing a global glow-height constraint on the entire sky.


## Current4K Composite Aurora and Mountain Depth —29 October2026

The approved single-curtain shape/ice-blue grade remains. A3840x2160 transparent master combines the1672x941 approved photographic guide,10% of a regenerated fine-detail guide within the original silhouette, and native4K procedural vertical bundle detail. The built-in ImageGen request returned1672x941 despite requesting3840x2160. Therefore this output is explicitly a mixed-resolution4K composite, not native4K photography. The alpha silhouette is driven by the approved source. Offline scripts/build-aurora-master.cjs (npm run assets:aurora) renders native fine-density fields, exports the4K master PNG to work/aurora-4k-master and WebP3840/1920/960 variants to public/assets/atmosphere. The generated input remains work/aurora-4k-master/detail-guide.png outside public. Source guides remain available for reproducibility.

Runtime AuroraArt selects960px for phones/data-saving,1920 for ordinary screens,3840 for wide/high-DPI screens with normal power tier; GL MAX_TEXTURE_SIZE further caps choice. DPR changes on the existing ticker update the source. Static/GPU paths share the selected URL. Trilinear mipmaps improve minification; old textures are disposed on replacement. Drawing resolution still adapts independently under the existing3.2M/.9M budgets and30/20fps caps. Loading a4K source does not force a full4K back buffer or bypass reduced-motion/data preferences.

A broken low-opacity valley-mist plane at depth.90 sits between far range.65 and foreground1.25. It moves only with the existing camera, with a quieter phone tier. Luminance-masked icy gradients gently illuminate the actual bright snow details. No new celestial objects, snowfall, renderer, frame clock, runtime video or movement control. Scope remains Contact/Free Key; footer stays opaque.

Validation: build;10 responsive browser cases +3 scope checks;12 official motion/quality/lifecycle cases +3 scope checks; real DPR2/data-saving/orientation source transitions with one GL context. A4K motion comparison was retried when automatic buffer scaling changed between samples; equal-size samples pass. Normal and static-vs-flow pointer/scroll profiles record no steady buffer reallocations. Local diagnostics are not certification for every physical device. Reports/screens/video: Codex workspace outputs/aurora-4k-*. Backup: work/before-4k-refinement-20261029.


## Current Free Key Ice Vault — 29 October 2026

Supersedes earlier Free Key aurora/countdown-only layouts. Contact keeps its approved aurora; Free Key now uses its own photographic slate room with an independent key inside an ice cube. Built-in ImageGen supplied the new cube/key/room assets; WebP desktop/mobile variants retain actual source dimensions (1254px cube, 1024×1536 key, 1672×941 room), without a native4K claim. Canvas2D masks, branched cracks and finite photo shards provide interaction via the existing shared onFrame clock. No Free Key WebGL, aurora texture or continuously running stage loop. DPR caps1.75/1.5,60/30fps while changing, hidden/offscreen suspension and reduced-motion support.

IceKeyState/controller enforce an automatic30s wait, five accepted strikes with260ms cooldown,800ms settling and extraction-only local pass generation. Session restoration includes legacy v1 migration; ready passes last24h. Native buttons cover pointer/touch/keyboard; announcements, manual copy fallback, blocked-storage operation and image-failure button preserve completion. Local generation remains a client-side demonstration, with no new backend validation.

Validation: production build and pure state boundaries pass;8 independent browser cases including a real30,016ms unlock, native mouse/touch/keyboard, copy/reset/reload/migration/expiry pass. Additional320px image-failure and final keyboard checks pass. Settled stage measured0draws/0resizes; Contact's six source hashes unchanged. Local Edge checks do not certify all physical devices. Permanent scripts/test-free-key.cjs now tests the ice flow, scripts/test-ice-key-state.cjs tests boundaries, and aurora tests/recorder target Contact. Backups: work/before-ice-vault-20261029. Actual-page screenshots, recording, exact generation prompts and detailed evidence: Codex workspace outputs/ice-vault-*.


## Current Physically Grounded Ice Scene — 29 October 2026

Free Key's cube has no pointer-driven position/camera/scale movement. Only the DOM hammer tracks pointer input; pointer movement no longer subscribes to or redraws the stage clock. Five supplied photographic references were combined by built-in ImageGen into one1254×1254 ice/wet-slate lighting environment, with contact/cast shadows, refraction, droplets and broken reflection baked coherently. A source-aligned empty plate removes cube-specific shadows/reflection after shattering. New grounded-scene-v2 and grounded-plate-v2 WebPs use1254px desktop/800px mobile sources. Current scene+plate+existingkey total842174/433130bytes desktop/mobile, excluding code/fonts. Old sources remain for rollback but are not requested.

The empty environment is an infrequently drawn Canvas2D layer below semantic reward DOM; independent key, photo-derived fractures and transient effects remain on the object Canvas2D above it. Matched framing preserves ground beneath the block on short laptop/mobile screens. Shared clock, cappedDPR, reduced-motion, hidden/offscreen pause and finite effects remain. Production build and 5-case independent QA pass, including real30s wait, full scene/canvas pointer invariance and zero pointer-triggered draws/resizes, mobile320/390/tablet820, touch/keyboard/copy/reset/reload. These are local Edge checks. Backup: work/before-grounded-ice-20261029. Exact prompts, asset provenance, source dimensions, screenshots/video and QA: Codex workspace outputs/ice-grounded-*. npm run test:ice-scene preserves pointer stability coverage.


## Current Restored Quiet Room —29 October2026

User preferred the original expansive room and quieter floor to the combined square ice/floor photograph. Free Key restores original room.webp/room-mobile.webp as full-panel CSS backgrounds. The blue cube is retained as an alpha sprite extracted via built-in ImageGen (cube-room-v3,1254px / mobile800px). New combined ground photo/clean plate are not requested; retained outside current runtime path for rollback. Top captions sit above imagery atz6 with the original insets and a clearer8px desktop font; bottom instruction again has the quiet dark slate behind it. Cube size/foot position return toward the earlier composition; a cached contour-attached seam and restrained cast shadow fade on break. No pointer parallax or pointer-triggered stage redraw is restored. Controller workflow remains30s→5hits→settle→extract→local pass.

Build passes. Actual page captures, exact extraction prompt/source dimensions and targeted QA: Codex workspace outputs/ice-room-restored-*. Backup: work/before-room-restore-20261029.

Validation for the restored room:5 existing scene cases pass,8 caption layouts pass, fallback passes; real unlock30,010ms. Pointer sweeps add0draws/0resizes and0final scene pixel differences. Measured no-input screenshot quantization control informs a tiny4-channel/max1 test allowance, unused by final pointer reruns.


## Pickup transition timer repair —29 October2026

A one-shot settle timeout could run before the800ms wall-clock deadline, call updateUI while canAct was still false, then leave the native pickup button disabled indefinitely because no later refresh was scheduled. Refreshing the page restored an already-settled run and enabled it. Deterministic pre-fix browser reproduction delivered the first settle callback120ms early: opened phase remained disabled1627ms after breaking. The controller now rechecks the remaining deadline and rearms a bounded timeout until it is reached, with run/disposal guards and keyboard-focus restoration. No extra permanent frame loop or visual change.

Validation: production build; scripts/test-ice-pickup.cjs forces an early callback, preserves the early lock, then verifies native extraction without reload; existing keyboard/reduced-motion and phone-touch extraction cases pass. Backup: work/before-pickup-fix-20261029.


## Current Alpha-Masked Fractures —29 October2026

Free Key no longer clips persistent impact marks to an approximate polygon. A tight alpha matte is built once from the actual cube sprite (alpha>=220,2source-pixel interior margin); cached fractures and the transient surface flash use this matte. This preserves curved/melting edges and stops lines on transparent background pixels. Separate flying chips remain transient debris. Procedural unequal branched cracks follow the projected struck front/right/top face, with jagged paths, tapering ends, finer offshoots and a small crushed-frost core. Visibility was increased after user review through brighter/wider main fissures and a darker seam, while branches stay fine. No new raster/video asset or continuous rendering loop.

Validation: build; eight native edge strikes across desktop/DPR1 and phone/DPR3 emulation, plus four front/side strikes, produce0changed pixels outside the actual sprite alpha (maxoutside difference0), while visible changes occur inside. Native five-hit extraction succeeds in allthree cases; pointer movement adds0draws. The early-timeout pickup regression also passes. Permanent check: node scripts/test-ice-fractures.cjs. Backup: work/before-fracture-fix-20261029. Actual four-hit screenshot and measurements: Codex workspace outputs/ice-fractures-visible.png and ice-fractures-qa.json.


## Lower-edge artifact removed —29 October2026

Flying ice fragments now fade using their rotated bounding extent before reaching the scene bottom, with18px clearance, preventing a lit shard from appearing as a clipped horizontal strip. Removed the decorative border above .ice-about as requested. Build passes. Desktop and phone animation-frame checks sampled the bottom8canvas rows across the shatter transition:0visible pixels, computed divider0px; native extraction still passes. Backup: work/before-shard-edge-fix-20261029.


## Free Key — continuous ice studio, 29 October 2026

The Free Key background now extends the approved original studio room and slate floor across the main page, instead of keeping the room inside a rectangular canvas panel. Static CSS gradients give the copy a dark reading area, introduce a restrained cool bounce around the ice, and blend into the opaque footer palette. The lower information row shares the same environment. Mobile uses the existing smaller room exposure with a portrait composition.

Implementation: page-scoped src/styles/ice-studio.css, loaded by free-key.html and the TypeScript entry. Local CSS variables define the studio palette. Existing optimized WebP assets are reused; no new asset download, dependency, WebGL context or animation loop is introduced. IceVaultStage, IceFractures, the 30-second state machine, native actions and shared GSAP clock are unchanged. The previously removed scene-bottom divider remains absent.

Production build passed. Validation uses the existing test:ice-scene regression suite and actual desktop/mobile/wide browser captures. Source before this change is retained in work/before-ice-studio-20261029. Browser QA is local Edge with device emulation, not physical-device certification.


## Free Key — retained reward and phase guidance, 29 October 2026

The page now treats waiting, striking, lifting and receiving as distinct visual states. The status display shows seconds during the real 30-second wait, strikes remaining after unlock, one key during pickup, and the 24-hour pass duration after collection. A single phase-aware renderClock function preserves the correct display on boot, tab return, pageshow and reset without rewriting text on every frame. Existing version-2 session state, 260 ms strike guard, 800 ms pickup guard and expiry semantics are retained; pass generation remains local as explicitly requested.

The gold key stays visible after collection and on ready-state reload. GSAP moves it once from the exposed-ice pose to a stable display pose, using the existing shared rendering clock; idle drawing then stops. The photo-derived cube and key remain Canvas 2D, not a 3D model. A new transparent photographic ice plinth sits beneath the retained key, with the code/copy/reset card below. Meaningful content and actions remain semantic DOM. Instructions are larger and sit near the cube; a finite light-only cue announces hammer readiness without moving the cube. Reduced motion suppresses the cue and key repositioning tween; changing the preference live settles the display immediately.

The plinth was generated with the built-in image-generation tool, not a remote runtime service. Its transparent source and exact prompt are retained in the Codex workspace work/ice-reward/reward-plinth-source.png and plinth-prompt.txt. Project runtime asset: public/assets/ice-vault/reward-plinth-v1.webp, 800 x 262, 120142 bytes. The existing room, cube and key assets are reused. No new animation library, WebGL context or permanent particle loop is introduced.

Implementation: free-key.html, src/pages/free-key.ts, src/components/IceVaultStage.ts, src/styles/ice-experience.css. Source before this revision: work/before-reward-redesign-20261029. The resting-image regression now waits for the finite phase choreography to finish before comparing images; its original strict canvas/geometry/no-draw checks remain.

Reward revision validation: production build and all 5 test:ice-scene cases passed; 6 independent retained-reward viewport/lifecycle/live-transition checks passed; prior pickup-timer and image-fallback-phone regressions passed. Resting canvas readback hashes and canvas/scene geometry are checked directly, with zero pointer-driven application draws/resizes. Local Edge/device-emulation scope only.


## Free Key typography refinement — 29 October 2026
Page-local CSS type tokens now distinguish labels, body text and headings. Hero tracking is relaxed to -.042em with 1.065 line height; instructions, expiry, buttons and lower information are larger and brighter. The code output uses a system monospace family without an extra font download. Pretty wrapping improves helper text; responsive card height accommodates larger type. Build and six independent reward viewport/live-transition checks passed. Original CSS is in work/before-typography-20261029. Changes are confined to src/styles/ice-experience.css.


## Free Key laptop viewport fit — 29 October 2026
For desktop widths above 960px and viewport heights up to 900px, page spacing, heading size and scene height now adapt to the viewport rather than a fixed 550px scene. The full reward card, copy/reset controls, step labels and pass note fit above the fold on the tested 1517x697, 1380x634, 1366x620, 1280x600, 1517x820 and 1920x1080 viewports in waiting, breakable and ready states. Geometry and initial scroll position were checked in local Edge. Mobile layout is outside this desktop rule. Backup: work/before-viewport-fit-20261029/ice-experience.css.

