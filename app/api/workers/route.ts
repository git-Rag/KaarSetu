import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const authCheck = await requireRole(['ASSESSOR', 'ADMIN']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const workers = await prisma.workerProfile.findMany({
      where: {
        OR: [
          { user: { phone: { contains: q } } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      },
      take: 20,
    });

    const data = workers.map((w) => ({
      id: w.id,
      userId: w.userId,
      name: w.user.name,
      phone: w.user.phone,
      trade: w.trade,
      city: w.city,
      state: w.state,
      photoUrl: w.photoUrl ?? w.user.avatarUrl,
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to search workers' }, { status: 500 });
  }
}
