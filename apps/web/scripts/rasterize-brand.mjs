#!/usr/bin/env node
/**
 * Build derived raster assets from public/images/nestora-mark.png (PNG).
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicImages = join(root, 'public', 'images');
const appDir = join(root, 'src', 'app');
const markPng = join(publicImages, 'nestora-mark.png');

if (!existsSync(markPng)) {
  console.error('Missing public/images/nestora-mark.png — copy from Nestora Hostel Management Logo.png first.');
  process.exit(1);
}

function resize(inputPath, outputPath, maxSide) {
  execSync(`sips -z ${maxSide} ${maxSide} "${inputPath}" --out "${outputPath}"`, { stdio: 'inherit' });
}

resize(markPng, join(publicImages, 'image.png'), 1024);
resize(markPng, join(appDir, 'icon.png'), 512);
resize(markPng, join(appDir, 'apple-icon.png'), 180);
console.log('Brand icons updated.');