import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { assessmentCreateSchema } from '@/lib/validations';
import { TRADE_MAP } from '@/lib/trades';
import { createEmptyChecklist } from '@/lib/assessment-scoring';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const authCheck = await requireRole(['ASSESSOR']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const assessor = await prisma.assessorProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!assessor?.isApproved) {
      return NextResponse.json({ error: 'Assessor not approved' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = assessmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const trade = TRADE_MAP[parsed.data.trade];
    if (!trade) {
      return NextResponse.json({ error: 'Trade module not available' }, { status: 400 });
    }

    const checklistData = createEmptyChecklist(trade);

    const assessment = await prisma.assessment.create({
      data: {
        workerProfileId: parsed.data.workerProfileId,
        assessorProfileId: assessor.id,
        trade: trade.name,
        nsqfLevel: parsed.data.nsqfLevel,
        checklistData: checklistData as unknown as Prisma.InputJsonValue,
        evidenceUrls: [],
        initiatedBy: 'ASSESSOR',
      },
    });

    return NextResponse.json({ data: assessment });
  } catch {
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
