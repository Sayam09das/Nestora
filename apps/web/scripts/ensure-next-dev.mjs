import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const nextDir = path.join(appRoot, '.next');
const routesManifest = path.join(nextDir, 'routes-manifest.json');
function isBrokenNextCache() {
  if (!existsSync(nextDir)) {
    return false;
  }

  // Partial writes / interrupted dev (or build while dev runs) often leave
  // a .next folder without routes-manifest.json — the exact ENOENT users hit.
  return !existsSync(routesManifest);
}

if (isBrokenNextCache()) {
  console.warn(
    '[@nestora/web] Incomplete .next output detected (missing routes-manifest). Clearing cache before dev…',
  );
  rmSync(nextDir, { recursive: true, force: true });
}

const nextBin = path.join(appRoot, 'node_modules', '.bin', 'next');

const child = spawn(nextBin, ['dev', '--port', '3000'], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
