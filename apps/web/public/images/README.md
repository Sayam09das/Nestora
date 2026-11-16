# Social & marketing images

Assets are served from the `public/images/` folder (`/images/...` in URLs).

| File | Size | Use |
| ---- | ---- | --- |
| `Nestora Hostel Management Logo.png` | source | **Master file** — drop replacements here, then re-run crop steps below |
| `logo.png` | copy of master | Wordmark URL used by the app (`/images/logo.png`) |
| `nestora-mark.png` | 420×420 crop | Sidebar / favicon mark (cropped from wordmark) |
| `nestora-mark.svg` | legacy | Superseded by PNG; safe to remove when no longer referenced |
| `image.png` | — | Legacy raster alias (same as mark PNG) |

**Favicon / PWA:** `src/app/icon.png` and `apple-icon.png` are generated from `nestora-mark.png`.

**Refresh derived files** after replacing `Nestora Hostel Management Logo.png`:

```bash
cd apps/web/public/images
cp "Nestora Hostel Management Logo.png" logo.png
sips --cropToHeightWidth 420 420 --cropOffset 0 302 "Nestora Hostel Management Logo.png" --out nestora-mark.png
pnpm --filter @nestora/web exec node scripts/rasterize-brand.mjs
```

There is no `public/img` folder — Next.js serves static files from `public/` at the site root (`/images/...`).

`hero-dashboard.jpg` — marketing hero product preview (16:9, 1280×720). Replace with a **3840×2160** export for retina; update `HeroDashboardImage` if you change the filename.