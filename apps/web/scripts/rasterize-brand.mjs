import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicImages = join(root, 'public', 'images');
const appDir = join(root, 'src', 'app');

function rasterize(svgPath, outPath, width) {
  const svg = readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  // eslint-disable-next-line no-console
  console.log(`wrote ${outPath} (${width}px wide)`);
}

rasterize(join(publicImages, 'nestora-mark.svg'), join(publicImages, 'image.png'), 1024);
rasterize(join(publicImages, 'logo.svg'), join(publicImages, 'logo.png'), 1200);
rasterize(join(publicImages, 'nestora-mark.svg'), join(appDir, 'icon.png'), 512);
rasterize(join(publicImages, 'nestora-mark.svg'), join(appDir, 'apple-icon.png'), 180);
