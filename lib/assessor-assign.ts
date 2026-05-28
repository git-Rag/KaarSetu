import { prisma } from '@/lib/prisma';

const DEFAULT_ASSESSOR_PHONE = '9876543210'; // Dr. Pradeep Mishra, ITI Bhopal

export async function assignAssessorForWorker(
  workerState: string,
  workerCity: string,
  preferredAssessorProfileId?: string
): Promise<string> {
  if (preferredAssessorProfileId) {
    const preferred = await prisma.assessorProfile.findFirst({
      where: { id: preferredAssessorProfileId, isApproved: true },
    });
    if (preferred) return preferred.id;
  }

  const local = await prisma.assessorProfile.findFirst({
    where: {
      isApproved: true,
      state: workerState,
      district: { contains: workerCity, mode: 'insensitive' },
    },
    orderBy: { user: { createdAt: 'asc' } },
  });
  if (local) return local.id;

  const sameState = await prisma.assessorProfile.findFirst({
    where: { isApproved: true, state: workerState },
    orderBy: { user: { createdAt: 'asc' } },
  });
  if (sameState) return sameState.id;

  const defaultAssessor = await prisma.assessorProfile.findFirst({
    where: {
      isApproved: true,
      user: { phone: DEFAULT_ASSESSOR_PHONE },
    },
  });
  if (defaultAssessor) return defaultAssessor.id;

  const anyApproved = await prisma.assessorProfile.findFirst({
    where: { isApproved: true },
  });
  if (!anyApproved) throw new Error('No approved assessor available');
  return anyApproved.id;
}
