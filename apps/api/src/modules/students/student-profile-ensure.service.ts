import type { PrismaClient, Student } from '@nestora/database';

/**
 * Some STUDENT logins exist without a linked `students` row (generic provision / manual dev accounts).
 * Dashboard and allocation flows require that row; this creates a minimal profile when safe to do so.
 */
export async function ensureStudentProfileForUser(
  prisma: PrismaClient,
  userId: string,
): Promise<Student | null> {
  const existing = await prisma.student.findUnique({ where: { userId } });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
    },
  });

  if (!user || user.role !== 'STUDENT') {
    return null;
  }

  const year = new Date().getUTCFullYear();
  const academicYear = `${year}-${String(year + 1).slice(-2)}`;
  const guardianName = `${user.firstName} ${user.lastName}`.trim() || 'Guardian pending';
  const guardianPhone = (user.phoneNumber?.trim() || '0000000000').slice(0, 20);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? user.id.replace(/-/g, '').slice(0, 8).toUpperCase() : `${Date.now()}${attempt}`;
    const registrationNumber = `STU-${year}-${suffix}`.slice(0, 50);

    const taken = await prisma.student.findUnique({
      where: { registrationNumber },
      select: { id: true },
    });
    if (taken) continue;

    try {
      return await prisma.student.create({
        data: {
          userId: user.id,
          registrationNumber,
          course: 'Pending update',
          department: 'Pending update',
          academicYear,
          currentSemester: '1',
          gender: 'MALE',
          dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
          guardianName,
          guardianPhone,
          guardianRelation: 'Parent',
          permanentAddress: 'Address pending — contact hostel office to complete your profile.',
        },
      });
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: string }).code)
          : '';
      if (code === 'P2002') {
        const retry = await prisma.student.findUnique({ where: { userId } });
        if (retry) return retry;
        continue;
      }
      throw error;
    }
  }

  return prisma.student.findUnique({ where: { userId } });
}