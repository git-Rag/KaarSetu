import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { assessmentPatchSchema } from '@/lib/validations';

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

    return NextResponse.json({ data: assessment });
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
      include: { assessorProfile: true },
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

    const body = await request.json();
    const parsed = assessmentPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === 'PASSED' || parsed.data.status === 'FAILED') {
      updateData.assessedAt = new Date();
    }
    if (parsed.data.status === 'FAILED') {
      updateData.status = 'FAILED';
    } else if (parsed.data.status === 'PASSED') {
      updateData.status = 'PASSED';
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
