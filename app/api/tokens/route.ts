import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    let where: Record<string, unknown> = {};

    if (session.user.role === 'WORKER') {
      const profile = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile) return NextResponse.json({ data: [] });
      where = { workerProfileId: profile.id };
    } else if (ownerId && session.user.role === 'ADMIN') {
      where = { ownerId };
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tokens = await prisma.sBToken.findMany({
      where,
      include: {
        workerProfile: {
          include: { user: { select: { name: true, walletAddress: true, avatarUrl: true } } },
        },
        assessment: {
          include: {
            assessorProfile: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        attestations: {
          include: {
            employerProfile: true,
            givenByUser: { select: { name: true } },
          },
        },
      },
      orderBy: { mintedAt: 'desc' },
    });

    return NextResponse.json({ data: tokens });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}
