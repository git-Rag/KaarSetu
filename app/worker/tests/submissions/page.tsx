'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getWorkerSubmissionLabel,
  submissionBadgeVariant,
} from '@/lib/submission-status';
import { formatDate } from '@/lib/utils';
import type { AssessmentInitiator, AssessmentStatus } from '@prisma/client';

interface AttemptRow {
  id: string;
  trade: string;
  status: AssessmentStatus;
  initiatedBy: AssessmentInitiator;
  submittedAt: string | null;
  score: number | null;
  evidenceUrls: string[];
  notes: string | null;
  assessorProfile: { user: { name: string } };
  token: { tokenId: string } | null;
}

export default function WorkerSubmissionsPage() {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/worker/attempts')
      .then((r) => r.json())
      .then((json) => setAttempts(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">My Submissions</h1>
          <p className="text-text-secondary">Track practical test attempts and assessor reviews</p>
        </div>
        <Link href="/worker/tests">
          <Button variant="outline">New skill test</Button>
        </Link>
      </div>

      {attempts.length === 0 ? (
        <Card className="text-center text-text-secondary">
          <p>No submissions yet.</p>
          <Link href="/worker/tests" className="mt-4 inline-block">
            <Button>Start a skill test</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => {
            const label = getWorkerSubmissionLabel(
              a.status,
              a.initiatedBy,
              a.submittedAt ? new Date(a.submittedAt) : null
            );
            return (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-cream">{a.trade}</p>
                  <p className="text-sm text-text-secondary">
                    Assessor: {a.assessorProfile.user.name}
                    {a.submittedAt && ` • Submitted ${formatDate(a.submittedAt)}`}
                  </p>
                  {a.score != null && (
                    <p className="text-sm text-saffron">Assessor score: {a.score}%</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={submissionBadgeVariant(label)}>{label}</Badge>
                  <Link href={`/worker/tests/submissions/${a.id}`}>
                    <Button size="sm" variant="outline">
                      View details
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
