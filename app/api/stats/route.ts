import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { subDays, format } from 'date-fns';

export async function GET() {
  try {
    const authCheck = await requireRole(['ADMIN']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const [
      totalWorkers,
      totalAssessors,
      pendingAssessors,
      totalEmployers,
      totalTokens,
      tokensByTrade,
      tokensByStatus,
      recentTokens,
      pendingAssessorList,
    ] = await Promise.all([
      prisma.workerProfile.count(),
      prisma.assessorProfile.count(),
      prisma.assessorProfile.count({ where: { isApproved: false } }),
      prisma.employerProfile.count(),
      prisma.sBToken.count(),
      prisma.sBToken.groupBy({ by: ['trade'], _count: true }),
      prisma.sBToken.groupBy({ by: ['status'], _count: true }),
      prisma.sBToken.findMany({
        where: { mintedAt: { gte: subDays(new Date(), 30) } },
        select: { mintedAt: true },
      }),
      prisma.assessorProfile.findMany({
        where: { isApproved: false },
        include: { user: { select: { name: true, phone: true, createdAt: true } } },
        orderBy: { user: { createdAt: 'desc' } },
      }),
    ]);

    const mintsPerDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      mintsPerDay[d] = 0;
    }
    recentTokens.forEach((t) => {
      const d = format(t.mintedAt, 'yyyy-MM-dd');
      if (mintsPerDay[d] !== undefined) mintsPerDay[d]++;
    });

    const mintsChart = Object.entries(mintsPerDay).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      data: {
        kpis: {
          totalWorkers,
          totalAssessors,
          pendingAssessors,
          approvedAssessors: totalAssessors - pendingAssessors,
          totalEmployers,
          totalTokens,
        },
        mintsChart,
        tokensByTrade: tokensByTrade.map((t) => ({
          trade: t.trade,
          count: t._count,
        })),
        tokensByStatus: tokensByStatus.map((t) => ({
          status: t.status,
          count: t._count,
        })),
        pendingAssessors: pendingAssessorList.map((a) => ({
          id: a.id,
          name: a.user.name,
          itiName: a.itiName,
          itiCode: a.itiCode,
          district: a.district,
          state: a.state,
          createdAt: a.user.createdAt,
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
