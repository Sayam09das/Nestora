/**
 * Seed Events-category notices for warden events desk.
 *
 * Usage:
 *   pnpm --filter @nestora/api seed:neon-events
 */
import { prisma } from '@nestora/database';

const hostelNameArg = process.argv[2]?.trim() || 'Boys Hostel A';

const EVENTS = [
  {
    title: 'Inter-hostel sports meet — central ground',
    description:
      'Annual sports meet on 22 Mar. Register teams by 18 Mar. Captains meeting Fri 5 PM at mess lawn. Events: cricket, volleyball, relay.',
    scope: 'University-wide' as const,
    daysAhead: 12,
    requiresAck: false,
  },
  {
    title: 'Cultural night — Block A amphitheatre',
    description:
      'Hostel cultural program 8 PM Saturday. Rehearsals in common room Thu–Fri. Quiet hours lifted until 10:30 PM for event zone only.',
    scope: 'hostel' as const,
    daysAhead: 4,
    requiresAck: true,
  },
  {
    title: 'Yoga & wellness week',
    description: 'Morning sessions 6:30–7:15 AM at terrace. Mats provided. Sign-up sheet on notice board.',
    scope: 'hostel' as const,
    daysAhead: -1,
    requiresAck: false,
  },
  {
    title: 'Blood donation camp — university OPD',
    description: 'Partner drive 10 AM–4 PM. Carry college ID. Refreshments sponsored by NSS.',
    scope: 'University-wide' as const,
    daysAhead: 20,
    requiresAck: false,
  },
];

const hostel = await prisma.hostel.findFirst({
  where: { name: { contains: hostelNameArg, mode: 'insensitive' }, isActive: true },
  select: { id: true, name: true },
});

if (!hostel) {
  console.error(`Hostel not found: ${hostelNameArg}`);
  process.exit(1);
}

const publisher =
  (await prisma.user.findFirst({
    where: { email: 'suman.chatterjee@nestora.test', status: 'ACTIVE' },
    select: { id: true },
  })) ??
  (await prisma.user.findFirst({
    where: { role: 'HOSTEL_WARDEN', status: 'ACTIVE' },
    select: { id: true },
  }));

if (!publisher) {
  console.error('No warden publisher user found.');
  process.exit(1);
}

let created = 0;
const now = new Date();

for (const event of EVENTS) {
  const exists = await prisma.notice.findFirst({
    where: { title: event.title },
    select: { id: true },
  });
  if (exists) continue;

  const publishedAt = new Date(now);
  publishedAt.setDate(publishedAt.getDate() + event.daysAhead);
  const expiresAt = new Date(publishedAt);
  expiresAt.setDate(expiresAt.getDate() + 14);

  await prisma.notice.create({
    data: {
      hostelId: event.scope === 'hostel' ? hostel.id : null,
      title: event.title,
      description: event.description,
      category: 'Events and Activities',
      requiresAcknowledgement: event.requiresAck,
      publishedBy: publisher.id,
      publishedAt,
      expiresAt,
    },
  });
  created += 1;
}

console.log(`Seeded ${created} event notice(s) (${hostel.name} + university-wide).`);
