/**
 * Idempotent notices seed for the announcement studio.
 *
 *   pnpm neon:seed-announcements
 */
import { prisma } from '@nestora/database';

const TEMPLATES = [
  {
    category: 'General',
    title: 'Mess winter menu rotation',
    body: 'Weekly menu shifts to winter specials from Monday. Allergen labels posted at serving counters. Contact warden desk for special dietary requests.',
    requiresAck: false,
    daysOffset: 0,
    expireDays: 30,
    hostelScoped: false,
  },
  {
    category: 'Hostel Rules',
    title: 'Quiet hours reminder',
    body: 'Quiet hours 10:00 PM – 6:00 AM remain in effect. Group study only in designated common rooms.',
    requiresAck: true,
    daysOffset: -2,
    expireDays: 45,
    hostelScoped: false,
  },
  {
    category: 'Fees',
    title: 'Semester fee deadline',
    body: 'Outstanding hostel fee balances must be cleared by the 20th. Finance desk open 9 AM – 5 PM on weekdays.',
    requiresAck: true,
    daysOffset: -5,
    expireDays: 20,
    hostelScoped: false,
  },
  {
    category: 'Maintenance',
    title: 'Block A water supply pause',
    body: 'Planned maintenance Sunday 6 AM – 12 PM. Store drinking water the night before.',
    requiresAck: false,
    daysOffset: -1,
    expireDays: 7,
    hostelScoped: true,
  },
  {
    category: 'Emergency',
    title: 'Storm advisory — secure balconies',
    body: 'Heavy winds expected tonight. Remove loose items from balconies and close windows before leaving rooms.',
    requiresAck: true,
    daysOffset: -1,
    expireDays: 3,
    hostelScoped: false,
  },
  {
    category: 'Events',
    title: 'Hostel cultural night',
    body: 'Auditorium sign-ups open for performances and emcee roles. Register with cultural secretary by Friday.',
    requiresAck: false,
    daysOffset: 2,
    expireDays: 14,
    hostelScoped: false,
  },
  {
    category: 'General',
    title: 'Wi-Fi maintenance window',
    body: 'Campus network upgrade scheduled next Wednesday 1–3 AM. Brief outages possible.',
    requiresAck: false,
    daysOffset: 5,
    expireDays: 10,
    hostelScoped: false,
  },
] as const;

function atUtcDay(offset: number): Date {
  const d = new Date();
  d.setUTCHours(10, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
}

async function resolveAdminId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
    select: { id: true },
  });
  if (!admin) throw new Error('No active administrator user found.');
  return admin.id;
}

async function main(): Promise<void> {
  const existing = await prisma.notice.count();
  if (existing >= 7) {
    console.log(`Announcements seed skipped (${existing} notices already present).`);
    return;
  }

  const adminId = await resolveAdminId();
  const firstHostel = await prisma.hostel.findFirst({ select: { id: true } });
  const students = await prisma.student.findMany({
    take: 40,
    select: { id: true },
  });

  let created = 0;

  for (const template of TEMPLATES) {
    const publishedAt = atUtcDay(template.daysOffset);
    const expiresAt = atUtcDay(template.expireDays + template.daysOffset);

    const notice = await prisma.notice.create({
      data: {
        hostelId: template.hostelScoped && firstHostel ? firstHostel.id : null,
        title: template.title,
        description: template.body,
        category: template.category,
        requiresAcknowledgement: template.requiresAck,
        publishedBy: adminId,
        publishedAt,
        expiresAt,
      },
    });

    if (template.requiresAck && students.length) {
      const ackCount = Math.min(students.length, 5 + created * 2);
      for (const student of students.slice(0, ackCount)) {
        await prisma.noticeAcknowledgement.create({
          data: { noticeId: notice.id, studentId: student.id },
        });
      }
    }

    if (created % 3 === 0) {
      await prisma.noticeAttachment.create({
        data: {
          noticeId: notice.id,
          filePath: `notices/sample-${notice.id}.pdf`,
          fileName: 'circular.pdf',
          fileSize: 48_000,
        },
      });
    }

    created += 1;
  }

  console.log(`Announcements desk seed complete (${created} notices).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
