# Brand images (PNG)

The app uses **raster PNGs**, not SVG in the UI. Edit the source SVGs, then re-export:

```bash
pnpm --filter @nestora/web brand:rasterize
```

| Output | Source | Size | Use |
| ------ | ------ | ---- | --- |
| `image.png` | `nestora-mark.svg` | 1024×1024 | Navbar, favicon metadata, manifest, JSON-LD logo |
| `logo.png` | `logo.svg` | 1200×… | Open Graph / Twitter |
| `src/app/icon.png` | `nestora-mark.svg` | 512×512 | Next.js favicon |
| `src/app/apple-icon.png` | `nestora-mark.svg` | 180×180 | Apple touch icon |

Palette (see `globals.css`): cream `#F5F4EC`, sage `#6D9773`, forest `#0C3B2E`, ink `#18352B`, tan `#BB8A52`.
