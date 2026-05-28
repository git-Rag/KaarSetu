import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatsCounter } from '@/components/stats-counter';
import { CredentialCard } from '@/components/credential-card';
import { AttestationCard } from '@/components/attestation-card';
import { JobCard } from '@/components/job-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JOB_LISTINGS } from '@/lib/jobs';
import { nsqfLevelToNumber } from '@/lib/utils';
import { Award, ChevronRight } from 'lucide-react';

export default async function WorkerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      tokens: {
        where: { status: 'ACTIVE' },
        orderBy: { mintedAt: 'desc' },
        include: {
          assessment: {
            include: {
              assessorProfile: {
                include: { user: { select: { name: true } } },
              },
            },
          },
          attestations: {
            include: { employerProfile: true },
            orderBy: { attestedAt: 'desc' },
          },
        },
      },
      assessments: {
        where: { status: { in: ['PENDING', 'PASSED'] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          assessorProfile: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!profile) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-cream">Welcome, {session.user.name}</h1>
        <Card>
          <p className="text-text-secondary">Complete your worker profile to get started.</p>
        </Card>
      </div>
    );
  }

  const credentialCount = profile.tokens.length;
  const attestationCount = profile.tokens.reduce((n, t) => n + t.attestations.length, 0);
  const maxNsqf = profile.tokens.reduce((max, t) => {
    const level = nsqfLevelToNumber(t.nsqfLevel);
    return level > max ? level : max;
  }, 0);
  const recentCredentials = profile.tokens.slice(0, 3);
  const allAttestations = profile.tokens.flatMap((t) =>
    t.attestations.map((a) => ({
      ...a,
      employerName: a.employerProfile.companyName,
    }))
  );
  const workerNsqf = maxNsqf || 0;
  const matchingJobs = JOB_LISTINGS.filter(
    (j) =>
      j.requiredTrade === profile.trade ||
      profile.trade.toLowerCase().includes(j.requiredTrade.toLowerCase().split(' ')[0] ?? '')
  ).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">
          Namaste, {profile.user.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-text-secondary">
          {profile.trade} • {profile.city}, {profile.state}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="text-center">
          <StatsCounter value={credentialCount} label="Credentials" />
        </Card>
        <Card className="text-center">
          <StatsCounter value={attestationCount} label="Attestations" />
        </Card>
        <Card className="text-center">
          <StatsCounter
            value={maxNsqf > 0 ? `Level ${maxNsqf}` : '—'}
            label="Highest NSQF"
            numeric={false}
          />
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-cream">Your Credentials</h2>
          <Link href="/worker/credentials">
            <Button variant="ghost" size="sm">
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {recentCredentials.length === 0 ? (
          <Card className="text-center text-text-secondary">
            <Award className="mx-auto mb-2 h-8 w-8 text-text-muted" />
            <p>No credentials yet. Complete an assessment with an ITI assessor.</p>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-6">
            {recentCredentials.map((token) => (
              <Link key={token.id} href={`/worker/credentials/${token.tokenId}`}>
                <CredentialCard
                  token={{
                    tokenId: token.tokenId,
                    txHash: token.txHash,
                    blockNumber: token.blockNumber,
                    trade: token.trade,
                    nsqfLevel: token.nsqfLevel,
                    mintedAt: token.mintedAt,
                    status: token.status,
                    metadataHash: token.metadataHash,
                  }}
                  worker={{
                    name: profile.user.name,
                    walletAddress: profile.user.walletAddress,
                    photoUrl: profile.photoUrl ?? profile.user.avatarUrl,
                  }}
                  assessor={{
                    name: token.assessment.assessorProfile.user.name,
                    itiName: token.assessment.assessorProfile.itiName,
                  }}
                  size="sm"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {profile.assessments.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-cream">Pending Assessments</h2>
          <div className="space-y-3">
            {profile.assessments.map((a) => (
              <Card key={a.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-cream">{a.trade}</p>
                  <p className="text-sm text-text-secondary">
                    Assessor: {a.assessorProfile.user.name} • {a.assessorProfile.itiName}
                  </p>
                </div>
                <Badge variant={a.status === 'PENDING' ? 'amber' : 'teal'}>{a.status}</Badge>
              </Card>
            ))}
          </div>
        </section>
      )}

      {allAttestations.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-cream">Work Attestations</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {allAttestations.map((a, i) => (
              <AttestationCard
                key={a.id}
                employerName={a.employerName}
                projectName={a.projectName}
                rating={a.rating}
                durationMonths={a.durationMonths}
                attestedAt={a.attestedAt}
                txHash={a.txHash}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-cream">Recommended Jobs</h2>
          <Link href="/worker/jobs">
            <Button variant="ghost" size="sm">
              Browse all <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matchingJobs.length > 0 ? (
            matchingJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canApply={workerNsqf >= job.requiredNSQF}
              />
            ))
          ) : (
            JOB_LISTINGS.slice(0, 3).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canApply={workerNsqf >= job.requiredNSQF}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
