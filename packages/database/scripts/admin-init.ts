import { createHash, randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const ACTIVATION_TOKEN_TTL_HOURS = 24;

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      'first-name': { type: 'string', default: 'University' },
      'last-name': { type: 'string', default: 'Administrator' },
    },
    strict: true,
  });

  const emailRaw = values.email;
  if (!emailRaw) {
    console.error(
      'Usage: pnpm --filter @nestora/database admin:init -- --email <admin_email> [--first-name Name] [--last-name Name]',
    );
    process.exit(1);
  }

  const email = normalizeEmail(emailRaw);
  const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
  const prisma = new PrismaClient();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.error('A user with this email already exists.');
      process.exit(1);
    }

    const placeholderHash = await argon2.hash(randomBytes(32).toString('hex'), {
      type: argon2.argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: placeholderHash,
        role: 'UNIVERSITY_ADMINISTRATOR',
        firstName: String(values['first-name']).trim(),
        lastName: String(values['last-name']).trim(),
        status: 'INACTIVE',
        isVerified: false,
      },
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const activationUrl = `${webUrl.replace(/\/$/, '')}/activate?token=${encodeURIComponent(rawToken)}`;

    console.log('Initial University Administrator created (INACTIVE, unverified).');
    console.log(`User id: ${user.id}`);
    console.log('');
    console.log('Open this single-use activation link within 24 hours:');
    console.log(activationUrl);
    console.log('');
    console.log('Do not commit, log in CI, or share this URL. Set a strong password on activation.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
