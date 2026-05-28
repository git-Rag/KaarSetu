import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, nsqfLevelLabel } from '@/lib/utils';

export default async function AssessorHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const assessor = await prisma.assessorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        include: {
          workerProfile: {
            include: { user: { select: { name: true, phone: true } } },
          },
          token: { select: { tokenId: true, txHash: true } },
        },
      },
    },
  });

  if (!assessor) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Assessment History</h1>
        <Card className="mt-4">
          <p className="text-text-secondary">Assessor profile not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">Assessment History</h1>
          <p className="mt-1 text-text-secondary">
            {assessor.assessments.length} assessment{assessor.assessments.length !== 1 ? 's' : ''}{' '}
            recorded
          </p>
        </div>
        <Link href="/assessor/assess">
          <Button>New assessment</Button>
        </Link>
      </div>

      {assessor.assessments.length === 0 ? (
        <Card className="text-center text-text-secondary">
          <p>No assessments in your history yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {assessor.assessments.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-cream">{a.workerProfile.user.name}</p>
                <p className="text-sm text-text-secondary">
                  {a.trade} • {nsqfLevelLabel(a.nsqfLevel)}
                  {a.score != null && ` • Score ${a.score}%`}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatDate(a.assessedAt ?? a.createdAt)}
                  {a.token && ` • Token #${a.token.tokenId}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
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
                {a.status === 'PENDING' && (
                  <Link href={`/assessor/assess/${a.workerProfileId}`}>
                    <Button size="sm" variant="outline">
                      Continue
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
