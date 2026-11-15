#!/usr/bin/env node
/**
 * Smoke: MOD-05 / MOD-06 / MOD-14 / system_config slices (API, authenticated GETs).
 *
 * Usage:
 *   node --env-file=apps/api/.env scripts/smoke-mod-slices.mjs
 *
 * Optional role logins (skip checks when unset):
 *   SMOKE_STUDENT_EMAIL / SMOKE_STUDENT_PASSWORD
 *   SMOKE_WARDEN_EMAIL / SMOKE_WARDEN_PASSWORD
 *   SMOKE_ACCOUNTANT_EMAIL / SMOKE_ACCOUNTANT_PASSWORD
 *   SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD
 *
 * SMOKE_API_URL defaults to http://127.0.0.1:4000
 */

const base = (process.env.SMOKE_API_URL ?? 'http://127.0.0.1:4000').replace(/\/$/, '');

/** @type {{ name: string; pass: boolean; detail?: string }[]} */
const results = [];

function pass(name, detail) {
  results.push({ name, pass: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail) {
  results.push({ name, pass: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function checkPublic() {
  for (const path of ['/health', '/health/live', '/health/ready']) {
    const res = await fetch(`${base}${path}`);
    if (!res.ok) {
      fail(`GET ${path}`, String(res.status));
      return false;
    }
    pass(`GET ${path}`, String(res.status));
  }
  return true;
}

/**
 * @param {string} email
 * @param {string} password
 */
async function login(email, password) {
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const legacy = res.headers.get('set-cookie');
  const cookies = [...setCookie, ...(legacy ? [legacy] : [])]
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ');
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, cookies: '', error: `${res.status} ${body.slice(0, 120)}` };
  }
  return { ok: true, cookies };
}

/**
 * @param {string} label
 * @param {string} path
 * @param {string} cookie
 */
async function authedGet(label, path, cookie) {
  const res = await fetch(`${base}${path}`, { headers: { cookie } });
  if (!res.ok) {
    const body = await res.text();
    fail(label, `${res.status} ${body.slice(0, 80)}`);
    return;
  }
  pass(label, String(res.status));
}

/**
 * @param {string} role
 * @param {string | undefined} email
 * @param {string | undefined} password
 * @param {[string, string][]} checks
 */
async function roleChecks(role, email, password, checks) {
  if (!email || !password) {
    console.log(`— ${role}: skipped (set SMOKE_${role}_EMAIL/PASSWORD)`);
    return;
  }
  const session = await login(email, password);
  if (!session.ok) {
    fail(`${role} login`, session.error);
    return;
  }
  pass(`${role} login`);
  for (const [label, path] of checks) {
    await authedGet(`${role} ${label}`, path, session.cookies);
  }
}

await checkPublic();

await roleChecks('STUDENT', process.env.SMOKE_STUDENT_EMAIL, process.env.SMOKE_STUDENT_PASSWORD, [
  ['room-config-options', '/api/v1/allocations/room-config-options'],
  ['checkout desk', '/api/v1/checkin-out/student/desk'],
]);

await roleChecks('WARDEN', process.env.SMOKE_WARDEN_EMAIL, process.env.SMOKE_WARDEN_PASSWORD, [
  ['checkout queue', '/api/v1/checkin-out/warden/requests?status=PENDING'],
  ['room-changes', '/api/v1/allocations/room-changes'],
  ['settings panels', '/api/v1/settings/desk/panels'],
]);

await roleChecks('ACCOUNTANT', process.env.SMOKE_ACCOUNTANT_EMAIL, process.env.SMOKE_ACCOUNTANT_PASSWORD, [
  ['checkout clearance queue', '/api/v1/checkin-out/accountant/requests?status=PENDING'],
  ['finance summary', '/api/v1/finance/desk/summary'],
  ['finance ledgers', '/api/v1/finance/desk/ledgers?limit=1'],
]);

await roleChecks('ADMIN', process.env.SMOKE_ADMIN_EMAIL, process.env.SMOKE_ADMIN_PASSWORD, [
  ['settings summary', '/api/v1/settings/desk/summary'],
  ['finance summary', '/api/v1/finance/desk/summary'],
]);

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);