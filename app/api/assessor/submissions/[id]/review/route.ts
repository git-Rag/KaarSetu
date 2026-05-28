import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { assessorWorkerReviewSchema } from '@/lib/validations';
import {
  calculateAssessorScoreFromWorkerChecklist,
  normalizeWorkerChecklistData,
  resolveTradeForAssessment,
  validateWorkerReviewChecklist,
  isPassingScore,
} from '@/lib/assessment-scoring';
import type { Prisma } from '@prisma/client';

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
    const assessor = await prisma.assessorProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!assessor) {
      return NextResponse.json({ error: 'Assessor not found' }, { status: 404 });
    }

    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (assessment.assessorProfileId !== assessor.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (assessment.initiatedBy !== 'WORKER' || !assessment.submittedAt) {
      return NextResponse.json({ error: 'Not a worker submission' }, { status: 400 });
    }
    if (assessment.status === 'MINTED') {
      return NextResponse.json({ error: 'Already minted' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = assessorWorkerReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 400 });
    }

    const existing = normalizeWorkerChecklistData(assessment.checklistData, trade);
    const merged = { ...existing };
    for (const [taskId, entry] of Object.entries(parsed.data.checklistData)) {
      if (merged[taskId]) {
        merged[taskId] = {
          ...merged[taskId],
          assessorResult: entry.assessorResult ?? merged[taskId].assessorResult,
          assessorNote: entry.assessorNote ?? merged[taskId].assessorNote,
        };
      }
    }

    const score = calculateAssessorScoreFromWorkerChecklist(merged, trade.checklist);

    const updateData: Prisma.AssessmentUpdateInput = {
      checklistData: merged as unknown as Prisma.InputJsonValue,
      score,
    };

    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes;
    }

    if (parsed.data.finalize) {
      const reviewValidation = validateWorkerReviewChecklist(merged, trade);
      if (!reviewValidation.valid) {
        return NextResponse.json({ error: reviewValidation.error }, { status: 400 });
      }
      updateData.status = isPassingScore(score, trade) ? 'PASSED' : 'FAILED';
      updateData.assessedAt = new Date();
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}
