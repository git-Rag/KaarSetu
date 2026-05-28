import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatsCounter } from '@/components/stats-counter';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ClipboardCheck, ChevronRight } from 'lucide-react';

export default async function AssessorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const assessor = await prisma.assessorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          workerProfile: {
            include: { user: { select: { name: true } } },
          },
          token: { select: { tokenId: true } },
        },
      },
    },
  });

  if (!assessor) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Assessor Dashboard</h1>
        <Card className="mt-4">
          <p className="text-text-secondary">Assessor profile not found.</p>
        </Card>
      </div>
    );
  }

  const total = assessor.assessments.length;
  const minted = assessor.assessments.filter((a) => a.status === 'MINTED').length;
  const pending = assessor.assessments.filter((a) => a.status === 'PENDING').length;
  const passed = assessor.assessments.filter((a) => a.status === 'PASSED').length;
  const recent = assessor.assessments.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">
          Welcome, {assessor.user.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-text-secondary">
          {assessor.itiName} • {assessor.district}, {assessor.state}
        </p>
        {!assessor.isApproved && (
          <Badge variant="amber" className="mt-2">
            Pending admin approval
          </Badge>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-4">
        <Card className="text-center">
          <StatsCounter value={total} label="Total assessments" />
        </Card>
        <Card className="text-center">
          <StatsCounter value={minted} label="Credentials minted" />
        </Card>
        <Card className="text-center">
          <StatsCounter value={pending} label="In progress" />
        </Card>
        <Card className="text-center">
          <StatsCounter value={passed} label="Ready to mint" />
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/assessor/assess">
          <Button>
            <ClipboardCheck className="h-4 w-4" />
            Assess a worker
          </Button>
        </Link>
        <Link href="/assessor/history">
          <Button variant="outline">
            View history <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-cream">Recent assessments</h2>
        {recent.length === 0 ? (
          <Card className="text-center text-text-secondary">
            <p>No assessments yet. Search for a worker to begin.</p>
            <Link href="/assessor/assess" className="mt-4 inline-block">
              <Button size="sm">Start assessment</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-cream">{a.workerProfile.user.name}</p>
                  <p className="text-sm text-text-secondary">
                    {a.trade} • {formatDate(a.createdAt)}
                    {a.token && ` • Token #${a.token.tokenId}`}
                  </p>
                </div>
                <Badge
                  variant={
                    a.status === 'MINTED'
                      ? 'teal'
                      : a.status === 'PASSED'
                        ? 'amber'
                        : a.status === 'FAILED'
                          ? 'red'
                          : 'default'
                  }
                >
                  {a.status}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
