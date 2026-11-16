#!/usr/bin/env node
/**
 * Verify Nestora API liveness and readiness (e.g. after Render deploy).
 *
 * Usage:
 *   API_URL=https://nestora-ptgf.onrender.com node scripts/verify-api-health.mjs
 */
const base = (process.env.API_URL ?? process.argv[2] ?? '').replace(/\/$/, '');
if (!base) {
  console.error('Set API_URL or pass the API origin as the first argument.');
  process.exit(1);
}

const paths = [
  { name: 'live', path: '/health/live', expectStatus: 200 },
  { name: 'ready', path: '/health/ready', expectStatus: 200 },
];

let failed = false;
for (const check of paths) {
  const url = `${base}${check.path}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const body = await res.json().catch(() => ({}));
    const ok = res.status === check.expectStatus;
    console.log(`${ok ? 'OK' : 'FAIL'} ${check.path} → ${res.status}`);
    if (!ok) {
      failed = true;
      console.log(JSON.stringify(body, null, 2));
      continue;
    }
    if (check.name === 'ready') {
      const connected = body?.data?.database?.connected;
      console.log(`  database.connected: ${connected}`);
      if (connected !== true) {
        failed = true;
      }
    }
  } catch (err) {
    failed = true;
    console.error(`FAIL ${check.path}:`, err instanceof Error ? err.message : err);
  }
}

process.exit(failed ? 1 : 0);