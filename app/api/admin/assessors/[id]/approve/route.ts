import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(['ADMIN']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(_request.url);
    const action = searchParams.get('action') ?? 'approve';

    await prisma.assessorProfile.update({
      where: { id },
      data: { isApproved: action === 'approve' },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: 'Failed to update assessor' }, { status: 500 });
  }
}
