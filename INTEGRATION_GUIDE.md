# Snowy Studios — Free Key & Contact Pages Full Integration Guide

This guide details the complete production architecture, asset inventory, and step-by-step instructions for integrating the **Free Key Page** and the **Contact Page**.

---

## 1. Directory & File Architecture

```
Snowy/
├── dist/                              # Standalone pre-built production files (Zero build step needed!)
│   ├── free-key.html                  # Free Key Page (Interactive 3D WebGL scene)
│   ├── contact.html                   # Contact Page (Polar atmosphere with drifting clouds & sparkling stars)
│   ├── assets/                        # Minified & hashed JS, CSS, and compressed WebP/SVG textures
│   │   ├── MeltKeyStage-*.js          # Free Key WebGL 3D runtime
│   │   ├── contact-*.js               # Contact page runtime & cloud controllers
│   │   ├── vendor-three-*.js          # Three.js 3D engine bundle
│   │   ├── vendor-gsap-*.js           # GSAP animation engine
│   │   └── realistic-winter/          # Winter environment plates (v5 seamless plate)
│   ├── fonts/                         # Custom web fonts (IBM Plex Sans, Sekuya)
│   └── snowy-logo.webp                # Brand assets
│
├── public/                            # Static asset source directory
│   ├── assets/
│   │   ├── realistic-winter/
│   │   │   ├── winter-camp-portrait-v5.webp   # Refined 177 KB seamless portrait plate
│   │   │   ├── winter-camp-landscape-v3.webp  # Desktop landscape plate
│   │   │   └── aurora-sky-portrait-mask.webp  # Photographed polar sky mask
│   │   ├── walnut-chest/                      # Walnut chest 3D mobile textures
│   │   ├── quality-v3/                        # Campfire detail textures (camp-detail.webp)
│   │   └── atmosphere/                        # Lunar cloud tiles & polar stars SVG
│   └── fonts/                                 # Web fonts
│
├── src/                               # TypeScript & CSS Source Code
│   ├── pages/
│   │   ├── free-key.ts                # Free Key entry point & timer state machine
│   │   └── contact.ts                 # Contact page entry point
│   ├── components/
│   │   ├── MeltKeyStage.ts            # Three.js 3D scene (ice cube, key, chest, campfire)
│   │   ├── CampPlate.ts               # Background plate compositing & ground shader
│   │   ├── CloudDrift.ts              # GSAP cloud drift controller (+5% speed tuning)
│   │   └── FlameVideo.ts              # Campfire flame animation
│   └── styles/
│       ├── contact-support.css        # Contact page layout & enhanced star twinkle keyframes
│       ├── glacial-atmosphere.css     # Atmospheric parallax layers
│       └── melt-key.css               # Free key UI styling
│
├── free-key.html                      # Development source HTML
├── contact.html                       # Development source HTML
└── package.json                       # Dependency declarations (Three.js, GSAP, Vite)
```

---

## 2. Key Enhancements Included in this Version

### Free Key Page
1. **Silky Smooth Snow Plate (`winter-camp-portrait-v5.webp`):**
   - Replaced old cauliflower / egg-carton mounds under the chest and ice cube with pristine, velvety smooth snow drifts.
   - Reduced plate file size to **177 KB** for instantaneous sub-second loading.
2. **Accurate Props Orientation & Lighting:**
   - Walnut chest face tilted naturally towards the fire (`-0.18 rad`).
   - Authentic rounded river rocks campfire with glowing coals and 3D dynamic floor illumination.
3. **Background Fire Glow Eradication:**
   - Cleared the old fire glow wings from the background snow, leaving a 100% natural, pristine winter landscape behind the text cards.

### Contact Page
1. **Cloud Drift Speed Tuning (+5%):**
   - Updated `CLOUD_SPEED` in [`CloudDrift.ts`](file:///C:/Users/CR/Snowy/src/components/CloudDrift.ts) to `1.1025` (+5% faster motion for a lively arctic atmosphere).
2. **Zero Spatial Motion — Pure Realistic Shimmer:**
   - Completely eliminated parallax movement (`data-depth` removed from star layers) and CSS scale/translate animations.
   - Enforced `transform: none !important;` on `.polar-layer--stars` and `.contact-star-field`.
   - Stars remain perfectly stationary in the night sky, exhibiting purely luminous twinkle and scintillation (`opacity` oscillation).
   - Added brilliant navigational polar stars with 4-point diffraction cross flares and soft radiant coronas around the header and moon.

---

## 3. Integration Options

### Option A: Direct Static Deployment (No Node / Build Tools Needed)
The `dist/` directory already contains the compiled, self-contained production build.
1. Copy the contents of `C:\Users\CR\Snowy\dist\` to your web root (Nginx, Apache, Caddy, Vercel, Netlify, or Cloudflare Pages).
2. Access:
   - `/free-key.html`
   - `/contact.html`
3. All relative paths (`/assets/...`, `/fonts/...`) resolve automatically.

### Option B: Embedding Into an Existing Web Application
1. **Free Key 3D Stage Container:**
   ```html
   <div id="key-stage" class="ice-vault" data-scene-presented="false">
     <!-- MeltKeyStage mounts the WebGL canvas here -->
   </div>
   ```
   Import and initialize:
   ```typescript
   import { createMeltKeyStage } from './src/components/MeltKeyStage';
   const stage = createMeltKeyStage(document.getElementById('key-stage')!);
   ```
2. **Contact Atmosphere Container:**
   ```html
   <div class="polar-atmosphere">
     <div class="polar-layer polar-layer--sky"></div>
     <div class="polar-layer polar-layer--stars"></div>
     <div class="polar-layer contact-star-field">
       <!-- SVG star field -->
     </div>
   </div>
   ```
   Initialize cloud drift:
   ```typescript
   import { initCloudDrift } from './src/components/CloudDrift';
   const destroyClouds = initCloudDrift();
   ```

### Option C: Rebuilding From Source (If Modifying Code)
If you ever need to rebuild from source:
1. Reinstall dependencies:
   ```bash
   npm install
   ```
2. Build production assets:
   ```bash
   npm run build
   ```
3. Preview locally:
   ```bash
   npx vite preview --host 0.0.0.0 --port 4173
   ```

---

## 4. Node Modules Status
> [!NOTE]
> `node_modules` has been **completely removed** from `C:\Users\CR\Snowy\` as requested. All build artifacts are preserved in `dist/` and all clean source code is preserved in `src/`, `free-key.html`, and `contact.html`.
