import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { workerPatchSchema } from '@/lib/validations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const worker = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            walletAddress: true,
            avatarUrl: true,
            aadhaarVerified: true,
          },
        },
        tokens: { where: { status: 'ACTIVE' }, orderBy: { mintedAt: 'desc' } },
        assessments: {
          orderBy: { createdAt: 'desc' },
          include: {
            assessorProfile: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    if (session?.user.role === 'WORKER' && worker.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isOwner = session?.user.id === worker.userId;
    const data = {
      ...worker,
      user: isOwner || session?.user.role !== 'WORKER'
        ? worker.user
        : { ...worker.user, phone: undefined },
    };

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch worker' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const worker = await prisma.workerProfile.findUnique({ where: { id } });
    if (!worker || worker.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = workerPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.workerProfile.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
