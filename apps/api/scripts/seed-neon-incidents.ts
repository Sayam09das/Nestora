/**
 * Seed sample emergency_incidents for warden desk testing.
 *
 * Usage:
 *   pnpm --filter @nestora/api exec node --env-file=.env --import tsx/esm scripts/seed-neon-incidents.ts
 *   pnpm --filter @nestora/api exec node --env-file=.env --import tsx/esm scripts/seed-neon-incidents.ts "Boys Hostel A" 6
 */
import { prisma } from '@nestora/database';

const hostelNameArg = process.argv[2]?.trim() || 'Boys Hostel A';
const countArg = Number(process.argv[3] ?? 6);
const targetCount = Number.isFinite(countArg) ? Math.min(Math.max(countArg, 1), 12) : 6;

const SAMPLES = [
  {
    incidentType: 'SECURITY',
    title: 'Unauthorized guest in Block B corridor',
    description: 'Security reported an unknown male lingering near Block B stairwell after curfew.',
    location: 'Block B · 2nd floor corridor',
    initialSeverity: 'HIGH',
    status: 'ACKNOWLEDGED',
    isEscalated: false,
  },
  {
    incidentType: 'FIRE',
    title: 'Minor fire alarm test — west wing',
    description: 'Scheduled alarm test triggered partial evacuation drill; no smoke detected.',
    location: 'West wing common area',
    initialSeverity: 'MEDIUM',
    status: 'IN_PROGRESS',
    isEscalated: false,
  },
  {
    incidentType: 'MEDICAL',
    title: 'Student fainted during morning assembly',
    description: 'First-year student lost consciousness briefly; vitals stable after water and rest.',
    location: 'Assembly ground',
    initialSeverity: 'HIGH',
    status: 'REPORTED',
    isEscalated: true,
  },
  {
    incidentType: 'MISSING_STUDENT',
    title: 'Student not returned after approved outing',
    description: 'Resident missed gate return window by 45 minutes; phone unreachable.',
    location: 'Main gate',
    initialSeverity: 'CRITICAL',
    status: 'REPORTED',
    isEscalated: true,
  },
  {
    incidentType: 'INFRASTRUCTURE',
    title: 'Elevator stuck between floors',
    description: 'Two residents trapped for ~8 minutes; maintenance team dispatched.',
    location: 'Block A elevator',
    initialSeverity: 'HIGH',
    status: 'IN_PROGRESS',
    isEscalated: false,
  },
  {
    incidentType: 'OTHER',
    title: 'Waterlogging near mess entrance',
    description: 'Heavy rain caused pooling; slip hazard taped off pending cleanup.',
    location: 'Mess block entrance',
    initialSeverity: 'LOW',
    status: 'ACKNOWLEDGED',
    isEscalated: false,
  },
] as const;

const hostel = await prisma.hostel.findFirst({
  where: { name: { contains: hostelNameArg, mode: 'insensitive' }, isActive: true },
  select: { id: true, name: true },
});

if (!hostel) {
  console.error(`Hostel not found: ${hostelNameArg}`);
  process.exit(1);
}

const reporter =
  (await prisma.user.findFirst({
    where: { email: 'suman.chatterjee@nestora.test', status: 'ACTIVE' },
    select: { id: true, email: true },
  })) ??
  (await prisma.user.findFirst({
    where: { role: 'HOSTEL_STAFF', status: 'ACTIVE' },
    select: { id: true, email: true },
  }));

if (!reporter) {
  console.error('No reporter user found.');
  process.exit(1);
}

const warden = await prisma.user.findFirst({
  where: { role: 'HOSTEL_WARDEN', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
  select: { id: true, email: true },
});

let created = 0;
for (let i = 0; i < targetCount; i += 1) {
  const sample = SAMPLES[i % SAMPLES.length]!;
  const existing = await prisma.emergencyIncident.findFirst({
    where: { hostelId: hostel.id, title: sample.title },
    select: { id: true },
  });
  if (existing) {
    continue;
  }
  const incident = await prisma.emergencyIncident.create({
    data: {
      hostelId: hostel.id,
      reportedBy: reporter.id,
      incidentType: sample.incidentType,
      title: sample.title,
      description: sample.description,
      location: sample.location,
      initialSeverity: sample.initialSeverity,
      officialSeverity: sample.status === 'REPORTED' ? null : sample.initialSeverity,
      status: sample.status,
      isEscalated: sample.isEscalated,
    },
  });
  if (sample.status !== 'REPORTED' && warden) {
    await prisma.incidentActionLog.create({
      data: {
        incidentId: incident.id,
        actionBy: warden.id,
        actionTaken:
          sample.status === 'ACKNOWLEDGED'
            ? 'Warden acknowledged the incident on-site.'
            : 'Warden team coordinating response with facilities and security.',
      },
    });
  }
  created += 1;
}

console.log(`Seeded ${created} incident(s) for ${hostel.name} (reporter: ${reporter.email}).`);
