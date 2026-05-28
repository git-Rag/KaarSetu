import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JobCard } from '@/components/job-card';
import { JOB_LISTINGS } from '@/lib/jobs';
import { nsqfLevelToNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export default async function WorkerJobsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      tokens: { where: { status: 'ACTIVE' }, select: { nsqfLevel: true, trade: true } },
    },
  });

  const maxNsqf =
    profile?.tokens.reduce((max, t) => {
      const n = nsqfLevelToNumber(t.nsqfLevel);
      return n > max ? n : max;
    }, 0) ?? 0;

  const workerTrade = profile?.trade ?? '';

  const sorted = [...JOB_LISTINGS].sort((a, b) => {
    const aMatch = a.requiredTrade === workerTrade ? 1 : 0;
    const bMatch = b.requiredTrade === workerTrade ? 1 : 0;
    return bMatch - aMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Job Board</h1>
        <p className="mt-1 text-text-secondary">
          Verified openings from employers across Madhya Pradesh. Apply with your KaarSetu credentials.
        </p>
      </div>

      {maxNsqf === 0 && (
        <Card className="border-saffron/30 bg-saffron/5">
          <p className="text-sm text-cream">
            You need at least one NSQF credential to apply for most jobs.{' '}
            <Link href="/worker/dashboard" className="text-saffron hover:underline">
              View your dashboard
            </Link>{' '}
            or get assessed by an ITI assessor.
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            canApply={maxNsqf >= job.requiredNSQF}
          />
        ))}
      </div>
    </div>
  );
}
