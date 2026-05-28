import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { assessmentCreateSchema } from '@/lib/validations';
import { TRADE_MAP } from '@/lib/trades';

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
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const trade = TRADE_MAP[parsed.data.trade] ?? Object.values(TRADE_MAP).find((t) => t.name === parsed.data.trade);
    const checklistData: Record<string, boolean> = {};
    trade?.checklist.forEach((item) => {
      checklistData[item.id] = false;
    });

    const assessment = await prisma.assessment.create({
      data: {
        workerProfileId: parsed.data.workerProfileId,
        assessorProfileId: assessor.id,
        trade: trade?.name ?? parsed.data.trade,
        nsqfLevel: parsed.data.nsqfLevel,
        checklistData,
        evidenceUrls: [],
      },
    });

    return NextResponse.json({ data: assessment });
  } catch {
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
