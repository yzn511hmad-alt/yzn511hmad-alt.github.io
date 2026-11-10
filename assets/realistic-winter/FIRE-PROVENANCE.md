# Real flame footage

Selected source: https://www.pexels.com/video/a-fire-is-burning-in-the-dark-with-a-black-background-27098964/
Author: Enes Beydilli. Title: Close-up video of vivid orange flames flickering against a dark background.
Original: 1920x1080, 25 fps, 6 seconds, photographed on FUJIFILM X-T30 (embedded original metadata).
Downloaded public original: https://videos.pexels.com/video-files/27098964/12071575_1920_1080_25fps.mp4

License: https://www.pexels.com/license/
Pexels permits free use, modifications and use on websites/apps. Attribution optional.
Do not redistribute as stock, sell unaltered copies, or claim endorsement.

Runtime derivative `flames-real-loop.mp4`: central 1440x1080 crop, downscaled to 768x576,
H.264 CRF19, no audio, fast-start. 5.4s seamless crossfade loop: source 0.6..6s,
with final 0.6s blended into source 0..0.6s, so start/end join source t=0.6s.
2.05 MB. `flames-real-poster.jpg` is a still sampled at derivative t=1.5s.

Use as a VideoTexture on one camera-facing quad. Additive blending removes black;
apply a soft side/bottom alpha feather to hide rectangular boundaries. Do not make
opacity from luminance and also multiply RGB by alpha under additive blending:
that double-darkens fine photographed wisps. Use custom blending One/One with
RGB exposure (e.g. 1.0..1.5) and a mild black floor subtraction (`max(rgb-.008,0.)`).
Loop muted/playsInline, no audio. Pause video offscreen/hidden/reduced motion.
For reduced motion use poster texture or seek a known still and pause.

Rejected candidates: Mixkit 3758 (beautiful flames, but fills entire frame and has
no isolated coherent center) and Mixkit 3457 (macro log close-up, clipped flame edges).
Both downloaded for local evaluation only; not recommended runtime assets.

## Optional scanned base models (not required when the pit is in the plate)

- `bark_debris_01-web.glb`: 2.32MB, four scanned weathered bark/deadwood pieces.
  Source https://polyhaven.com/a/bark_debris_01, photographed by Greg Zaal,
  modelled by Jenelle van Heerden. CC0.
- `rock_09-web.glb`: 0.48MB, one scanned weathered rock, suitable for instanced
  stone ring after scaling/neutralizing colour. Source https://polyhaven.com/a/rock_09,
  author Jenelle van Heerden. CC0.
- Poly Haven license: https://polyhaven.com/license
- Derivatives bundle original 1k PBR textures into WebP, weld/quantize geometry,
  and use EXT_meshopt_compression and EXT_texture_webp. Configure GLTFLoader with
  MeshoptDecoder. No Draco decoder required. All original sources/metadata are
  retained in sibling subdirectories. These are optional research assets and
  are not copied into Snowy or referenced by FlameVideo.ts.
