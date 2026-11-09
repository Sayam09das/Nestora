/**
 * Local / staging helper: create an active University Administrator for UI login tests.
 * Disabled when NODE_ENV=production. Prefer `admin:init` for real deployments.
 */
import { parseArgs } from 'node:util';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const MIN_PASSWORD_LEN = 12;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.error('register-dev-admin is disabled in production.');
    process.exit(1);
  }

  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      'first-name': { type: 'string', default: 'Sayam' },
      'last-name': { type: 'string', default: 'Administrator' },
      password: { type: 'string' },
    },
    strict: true,
  });

  const emailRaw = values.email;
  const password = values.password?.trim();
  if (!emailRaw || !password) {
    console.error(
      'Usage: pnpm --filter @nestora/database admin:register-dev -- --email <email> --password <min-12-chars> [--first-name Sayam] [--last-name Das]',
    );
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD_LEN) {
    console.error(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
    process.exit(1);
  }

  const email = normalizeEmail(emailRaw);
  const prisma = new PrismaClient();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.error('A user with this email already exists. Use another email or remove the row in dev.');
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'UNIVERSITY_ADMINISTRATOR',
        firstName: String(values['first-name']).trim(),
        lastName: String(values['last-name']).trim(),
        status: 'ACTIVE',
        isVerified: true,
        mustChangePassword: false,
      },
    });

    console.log('Dev University Administrator created (ACTIVE, can sign in immediately).');
    console.log(`User id: ${user.id}`);
    console.log(`Email: ${email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log('Sign in at your web app /login (Staff tab is fine).');
    console.log('Do not commit or share the password you passed on the command line.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
