import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authCheck = await requireRole(['WORKER', 'ASSESSOR', 'ADMIN']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') ?? undefined;
    const city = searchParams.get('city') ?? undefined;

    const assessors = await prisma.assessorProfile.findMany({
      where: {
        isApproved: true,
        ...(state ? { state } : {}),
        ...(city
          ? {
              OR: [
                { district: { contains: city, mode: 'insensitive' } },
                { state: { contains: city, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { name: true, phone: true } },
      },
      orderBy: { itiName: 'asc' },
    });

    const data = assessors.map((a) => ({
      id: a.id,
      name: a.user.name,
      itiName: a.itiName,
      itiCode: a.itiCode,
      district: a.district,
      state: a.state,
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assessors' }, { status: 500 });
  }
}
