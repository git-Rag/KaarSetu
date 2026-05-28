import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const authCheck = await requireRole(['ASSESSOR', 'ADMIN']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const where =
      authCheck.session.user.role === 'ADMIN'
        ? {
            initiatedBy: 'WORKER' as const,
            submittedAt: { not: null },
            status: 'PENDING' as const,
          }
        : {
            initiatedBy: 'WORKER' as const,
            submittedAt: { not: null },
            status: 'PENDING' as const,
            assessorProfile: { userId: authCheck.session.user.id },
          };

    const submissions = await prisma.assessment.findMany({
      where,
      include: {
        workerProfile: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ data: submissions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
