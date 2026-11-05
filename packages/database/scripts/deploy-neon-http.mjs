#!/usr/bin/env node
/**
 * Applies Prisma migration and seed data directly to Neon via HTTPS (/sql).
 * This operates over port 443, ensuring migrations succeed even on networks,
 * ISPs, or campus Wi-Fi where outbound PostgreSQL port 5432 is blocked.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(packageRoot, '.env');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(envPath);

let connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL or DIRECT_DATABASE_URL not found in .env');
  process.exit(1);
}

// Clean connection string: ensure non-pooler host and remove channel_binding
connectionString = connectionString.replace('-pooler.', '.');
connectionString = connectionString
  .replace(/([?&])channel_binding=require&/g, '$1')
  .replace(/([?&])channel_binding=require$/g, '')
  .replace(/\?&/, '?')
  .replace(/\?$/, '');

const urlObj = new URL(connectionString);
const host = urlObj.host;
const httpEndpoint = `https://${host}/sql`;

console.log(`Connecting to Neon HTTP endpoint: ${httpEndpoint}`);

async function queryNeon(sql) {
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    try {
      const res = await fetch(httpEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Neon-Connection-String': connectionString,
        },
        body: JSON.stringify({ query: sql }),
      });

      const body = await res.json();
      if (!res.ok) {
        if (body?.['neon:retryable'] && attempts < 5) {
          console.log(`Neon compute waking up, retrying in 2s (attempt ${attempts})...`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        throw new Error(body?.message || `HTTP ${res.status}: ${JSON.stringify(body)}`);
      }
      return body;
    } catch (err) {
      if (attempts < 5 && err.message?.includes('fetch failed')) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) continue;

    if (line.includes('$$')) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }
  if (current.trim()) {
    statements.push(current.trim());
  }
  return statements;
}

async function run() {
  console.log('Testing Neon connection...');
  const testRes = await queryNeon('SELECT current_database(), current_user, version();');
  console.log('Connected successfully:', testRes.rows?.[0]);

  // 1. Ensure _prisma_migrations exists
  console.log('Checking _prisma_migrations table...');
  await queryNeon(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum"            VARCHAR(64) NOT NULL,
      "finished_at"         TIMESTAMPTZ,
      "migration_name"      VARCHAR(255) NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      TIMESTAMPTZ,
      "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const migrationName = '20251105143000_initial_schema';
  const existing = await queryNeon(
    `SELECT migration_name, finished_at FROM "_prisma_migrations" WHERE migration_name = '${migrationName}';`
  );

  if (existing.rows?.length > 0 && existing.rows[0].finished_at) {
    console.log(`Migration ${migrationName} is already applied at ${existing.rows[0].finished_at}.`);
  } else {
    console.log(`Applying migration: ${migrationName}...`);
    const migrationSqlPath = join(
      packageRoot,
      'prisma',
      'migrations',
      migrationName,
      'migration.sql'
    );
    const migrationSql = readFileSync(migrationSqlPath, 'utf8');
    const checksum = createHash('sha256').update(migrationSql).digest('hex');
    const migrationId = crypto.randomUUID();

    await queryNeon(`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at")
      VALUES ('${migrationId}', '${checksum}', '${migrationName}', now())
      ON CONFLICT ("id") DO NOTHING;
    `);

    const statements = splitSqlStatements(migrationSql);
    console.log(`Executing ${statements.length} migration statements...`);

    let count = 0;
    for (const stmt of statements) {
      count++;
      try {
        await queryNeon(stmt);
        if (count % 25 === 0 || count === statements.length) {
          console.log(`Progress: ${count}/${statements.length} statements executed.`);
        }
      } catch (err) {
        console.error(`Error on statement #${count}:`, stmt);
        throw err;
      }
    }

    await queryNeon(`
      UPDATE "_prisma_migrations"
      SET "finished_at" = now(), "applied_steps_count" = ${statements.length}
      WHERE "id" = '${migrationId}';
    `);

    console.log(`Migration ${migrationName} completed and recorded successfully.`);
  }

  // 2. Seed room configurations
  console.log('Seeding standard room configurations...');
  const roomConfigs = [
    { code: 'SINGLE_NON_AC', capacity: 1, hasAc: false, description: 'Single Non-AC' },
    { code: 'SINGLE_AC', capacity: 1, hasAc: true, description: 'Single AC' },
    { code: 'DOUBLE_NON_AC', capacity: 2, hasAc: false, description: 'Double Non-AC' },
    { code: 'DOUBLE_AC', capacity: 2, hasAc: true, description: 'Double AC' },
    { code: 'TRIPLE_NON_AC', capacity: 3, hasAc: false, description: 'Triple Non-AC' },
    { code: 'TRIPLE_AC', capacity: 3, hasAc: true, description: 'Triple AC' },
  ];

  for (const config of roomConfigs) {
    await queryNeon(`
      INSERT INTO "room_configurations" ("id", "code", "capacity", "has_ac", "description")
      VALUES (gen_random_uuid(), '${config.code}', ${config.capacity}, ${config.hasAc}, '${config.description}')
      ON CONFLICT ("code") DO UPDATE SET
        "capacity" = EXCLUDED."capacity",
        "has_ac" = EXCLUDED."has_ac",
        "description" = EXCLUDED."description";
    `);
  }
  console.log('Room configurations seeded successfully.');

  // 3. Verification & table summary
  const tables = await queryNeon(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log('\n======================================================');
  console.log(`VERIFICATION: ${tables.rows.length} tables found in Neon public schema:`);
  console.log('======================================================');
  for (const row of tables.rows) {
    console.log(` - ${row.table_name}`);
  }

  const seededConfigs = await queryNeon(`SELECT code, capacity, has_ac, description FROM "room_configurations" ORDER BY code;`);
  console.log('\nSeeded Room Configurations in Neon:');
  console.table(seededConfigs.rows);

  console.log('\nAll tables, enums, triggers, and seed data are now live in your Neon database!');
}

run().catch((err) => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
