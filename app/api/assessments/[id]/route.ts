import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { assessmentPatchSchema } from '@/lib/validations';
import {
  calculatePracticalScore,
  calculateAssessorScoreFromWorkerChecklist,
  normalizeChecklistData,
  normalizeWorkerChecklistData,
  isWorkerChecklistFormat,
  resolveTradeForAssessment,
  validateChecklistData,
  isPassingScore,
  type ChecklistData,
} from '@/lib/assessment-scoring';
import type { Prisma } from '@prisma/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCheck = await requireRole(['ASSESSOR', 'WORKER', 'ADMIN']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        workerProfile: { include: { user: { select: { id: true, name: true, phone: true } } } },
        assessorProfile: { include: { user: { select: { name: true } } } },
        token: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (authCheck.session?.user.role === 'ASSESSOR') {
      const assessor = await prisma.assessorProfile.findUnique({
        where: { userId: authCheck.session.user.id },
      });
      if (assessor?.id !== assessment.assessorProfileId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (authCheck.session?.user.role === 'WORKER') {
      if (assessment.workerProfile.userId !== authCheck.session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    const workerFormat =
      assessment.initiatedBy === 'WORKER' ||
      (trade && isWorkerChecklistFormat(assessment.checklistData));

    const checklistData = trade
      ? workerFormat
        ? normalizeWorkerChecklistData(assessment.checklistData, trade)
        : normalizeChecklistData(assessment.checklistData, trade)
      : assessment.checklistData;

    const score = trade
      ? workerFormat
        ? calculateAssessorScoreFromWorkerChecklist(
            checklistData as ReturnType<typeof normalizeWorkerChecklistData>,
            trade.checklist
          )
        : calculatePracticalScore(checklistData as ChecklistData, trade.checklist)
      : assessment.score;

    return NextResponse.json({
      data: {
        ...assessment,
        checklistData,
        score,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(['ASSESSOR']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const assessor = await prisma.assessorProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (assessor?.id !== assessment.assessorProfileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (assessment.status === 'MINTED') {
      return NextResponse.json({ error: 'Cannot modify a minted assessment' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = assessmentPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    if (!trade) {
      return NextResponse.json({ error: 'Trade module not found' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.evidenceUrls !== undefined) {
      updateData.evidenceUrls = parsed.data.evidenceUrls;
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes;
    }

    let checklistData: ChecklistData | undefined;
    if (parsed.data.checklistData !== undefined) {
      const validation = validateChecklistData(parsed.data.checklistData, trade);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      checklistData = parsed.data.checklistData;
      updateData.checklistData = checklistData as unknown as Prisma.InputJsonValue;
    } else if (assessment.checklistData) {
      checklistData = normalizeChecklistData(assessment.checklistData, trade);
    }

    const score = checklistData
      ? calculatePracticalScore(checklistData, trade.checklist)
      : assessment.score ?? 0;
    updateData.score = score;

    if (parsed.data.status === 'PASSED') {
      const fullChecklist = checklistData ?? normalizeChecklistData(assessment.checklistData, trade);
      const requiredCheck = validateChecklistData(fullChecklist, trade, {
        requireAllTasks: true,
        requireRequiredMarked: true,
      });
      if (!requiredCheck.valid) {
        return NextResponse.json({ error: requiredCheck.error }, { status: 400 });
      }
      if (!isPassingScore(score, trade)) {
        return NextResponse.json(
          { error: `Score ${score}% is below passing threshold of ${trade.passingScore}%` },
          { status: 400 }
        );
      }
      updateData.status = 'PASSED';
      updateData.assessedAt = new Date();
    } else if (parsed.data.status === 'FAILED') {
      updateData.status = 'FAILED';
      updateData.assessedAt = new Date();
    } else if (parsed.data.status === 'PENDING') {
      updateData.status = 'PENDING';
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
}
