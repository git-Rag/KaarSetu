import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { workerAttemptPatchSchema } from '@/lib/validations';
import {
  normalizeWorkerChecklistData,
  resolveTradeForAssessment,
  validateWorkerChecklistData,
} from '@/lib/assessment-scoring';
import type { Prisma } from '@prisma/client';

async function getWorkerAssessment(id: string, userId: string) {
  const profile = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      assessorProfile: {
        include: { user: { select: { name: true } } },
      },
      token: true,
    },
  });

  if (!assessment || assessment.workerProfileId !== profile.id) return null;
  if (assessment.initiatedBy !== 'WORKER') return null;
  return assessment;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(['WORKER']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assessment = await getWorkerAssessment(id, authCheck.session.user.id);
    if (!assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    const checklistData = trade
      ? normalizeWorkerChecklistData(assessment.checklistData, trade)
      : assessment.checklistData;

    return NextResponse.json({ data: { ...assessment, checklistData } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(['WORKER']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assessment = await getWorkerAssessment(id, authCheck.session.user.id);
    if (!assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (assessment.submittedAt) {
      return NextResponse.json(
        { error: 'Cannot edit a submitted attempt' },
        { status: 400 }
      );
    }

    if (assessment.status === 'MINTED') {
      return NextResponse.json({ error: 'Cannot edit minted attempt' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = workerAttemptPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 400 });
    }

    const updateData: Prisma.AssessmentUpdateInput = {};

    if (parsed.data.checklistData) {
      const normalized = normalizeWorkerChecklistData(parsed.data.checklistData, trade);
      const validation = validateWorkerChecklistData(normalized, trade, {
        requireAllTasks: false,
      });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      for (const task of trade.checklist) {
        normalized[task.id].assessorResult = null;
        normalized[task.id].assessorNote = '';
      }
      updateData.checklistData = normalized as unknown as Prisma.InputJsonValue;
    }

    if (parsed.data.evidenceUrls !== undefined) {
      updateData.evidenceUrls = parsed.data.evidenceUrls;
    }
    if (parsed.data.notes !== undefined) {
      updateData.notes = parsed.data.notes;
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update attempt' }, { status: 500 });
  }
}
