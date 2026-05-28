import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { workerAttemptSubmitSchema } from '@/lib/validations';
import {
  normalizeWorkerChecklistData,
  resolveTradeForAssessment,
  validateWorkerChecklistData,
} from '@/lib/assessment-scoring';
import { assignAssessorForWorker } from '@/lib/assessor-assign';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(['WORKER']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment || assessment.workerProfileId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (assessment.initiatedBy !== 'WORKER') {
      return NextResponse.json({ error: 'Invalid attempt type' }, { status: 400 });
    }
    if (assessment.submittedAt) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 400 });
    }

    const checklist = normalizeWorkerChecklistData(assessment.checklistData, trade);
    const validation = validateWorkerChecklistData(checklist, trade, {
      requireAllTasks: true,
    });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = workerAttemptSubmitSchema.safeParse(body);

    let assessorProfileId = assessment.assessorProfileId;
    if (parsed.success && (parsed.data.assessorProfileId || parsed.data.autoAssign !== false)) {
      assessorProfileId = await assignAssessorForWorker(
        profile.state,
        profile.city,
        parsed.data.assessorProfileId
      );
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        submittedAt: new Date(),
        status: 'PENDING',
        assessorProfileId,
        score: null,
      },
      include: {
        assessorProfile: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Submit failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
