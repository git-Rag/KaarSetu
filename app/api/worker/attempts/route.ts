import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { workerAttemptCreateSchema } from '@/lib/validations';
import { TRADE_MAP } from '@/lib/trades';
import { createEmptyWorkerChecklist } from '@/lib/assessment-scoring';
import type { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const authCheck = await requireRole(['WORKER']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ data: [] });
    }

    const attempts = await prisma.assessment.findMany({
      where: {
        workerProfileId: profile.id,
        initiatedBy: 'WORKER',
      },
      include: {
        assessorProfile: {
          include: { user: { select: { name: true } } },
        },
        token: { select: { tokenId: true, id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: attempts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireRole(['WORKER']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = workerAttemptCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const trade = TRADE_MAP[parsed.data.tradeId];
    if (!trade) {
      return NextResponse.json({ error: 'Invalid trade module' }, { status: 400 });
    }

    const existingDraft = await prisma.assessment.findFirst({
      where: {
        workerProfileId: profile.id,
        trade: trade.name,
        initiatedBy: 'WORKER',
        submittedAt: null,
        status: 'PENDING',
      },
    });

    if (existingDraft) {
      return NextResponse.json({ data: existingDraft });
    }

    const defaultAssessor = await prisma.assessorProfile.findFirst({
      where: { isApproved: true, user: { phone: '9876543210' } },
    });
    if (!defaultAssessor) {
      return NextResponse.json({ error: 'No assessor available' }, { status: 503 });
    }

    const checklistData = createEmptyWorkerChecklist(trade);

    const attempt = await prisma.assessment.create({
      data: {
        workerProfileId: profile.id,
        assessorProfileId: defaultAssessor.id,
        trade: trade.name,
        nsqfLevel: parsed.data.nsqfLevel ?? 'LEVEL_2',
        status: 'PENDING',
        initiatedBy: 'WORKER',
        submittedAt: null,
        checklistData: checklistData as unknown as Prisma.InputJsonValue,
        evidenceUrls: [],
        notes: '',
      },
    });

    return NextResponse.json({ data: attempt });
  } catch {
    return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 });
  }
}
