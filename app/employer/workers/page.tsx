import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttestationCard } from '@/components/attestation-card';
import { EmptyState } from '@/components/empty-state';
import { Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function EmployerWorkersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!employer) {
    return (
      <Card className="text-center text-text-secondary">
        <p>Employer profile not found.</p>
      </Card>
    );
  }

  const attestations = await prisma.attestation.findMany({
    where: { employerProfileId: employer.id },
    include: {
      token: {
        include: {
          workerProfile: {
            include: {
              user: { select: { name: true, phone: true, avatarUrl: true } },
            },
          },
        },
      },
    },
    orderBy: { attestedAt: 'desc' },
  });

  const workerMap = new Map<
    string,
    {
      workerId: string;
      name: string;
      trade: string;
      city: string;
      tokenId: string;
      attestations: typeof attestations;
    }
  >();

  for (const a of attestations) {
    const wp = a.token.workerProfile;
    const key = wp.id;
    if (!workerMap.has(key)) {
      workerMap.set(key, {
        workerId: wp.id,
        name: wp.user.name,
        trade: wp.trade,
        city: wp.city,
        tokenId: a.token.tokenId,
        attestations: [],
      });
    }
    workerMap.get(key)!.attestations.push(a);
  }

  const workers = Array.from(workerMap.values());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Attested Workers</h1>
        <p className="mt-1 text-text-secondary">
          Workers you have verified and attested on KaarSetu
        </p>
      </div>

      {workers.length === 0 ? (
        <EmptyState
          title="No attested workers yet"
          description="Scan a worker's QR code and add an attestation to build your verified workforce."
          icon={<Users className="h-16 w-16" />}
          action={{ label: 'Open Scanner', href: '/employer/verify' }}
        />
      ) : (
        <div className="space-y-6">
          {workers.map((w) => (
            <Card key={w.workerId}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-cream">{w.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {w.trade} • {w.city}
                  </p>
                  <Badge variant="teal" className="mt-2">
                    {w.attestations.length} attestation{w.attestations.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Link href={`/employer/verify/${w.tokenId}`}>
                  <Button size="sm" variant="outline">
                    View Credential
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                {w.attestations.map((a, i) => (
                  <AttestationCard
                    key={a.id}
                    employerName={employer.companyName}
                    projectName={a.projectName}
                    rating={a.rating}
                    durationMonths={a.durationMonths}
                    attestedAt={a.attestedAt}
                    txHash={a.txHash}
                    index={i}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Last attested {formatDate(w.attestations[0].attestedAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
