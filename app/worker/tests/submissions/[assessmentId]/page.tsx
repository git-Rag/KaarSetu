'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { resolveTradeForAssessment, normalizeWorkerChecklistData } from '@/lib/assessment-scoring';
import { WorkerAttemptChecklist } from '@/components/worker-attempt-checklist';
import { WorkerSubmissionTimeline } from '@/components/worker-submission-timeline';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getWorkerSubmissionLabel,
  submissionBadgeVariant,
} from '@/lib/submission-status';
import { ArrowLeft } from 'lucide-react';

export default function WorkerSubmissionDetailPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/worker/attempts/${assessmentId}`)
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (!data) {
    return (
      <Card>
        <p className="text-text-secondary">Submission not found.</p>
      </Card>
    );
  }

  const trade = resolveTradeForAssessment(data.trade as string);
  const checklist = trade
    ? normalizeWorkerChecklistData(data.checklistData, trade)
    : {};
  const label = getWorkerSubmissionLabel(
    data.status as 'PENDING' | 'PASSED' | 'FAILED' | 'MINTED',
    'WORKER',
    data.submittedAt ? new Date(data.submittedAt as string) : null
  );

  const assessor = data.assessorProfile as { user: { name: string } };
  const token = data.token as { tokenId: string } | null;

  const events = [
    { label: 'Attempt started', date: data.createdAt as string },
    ...(data.submittedAt
      ? [
          {
            label: 'Submitted for review',
            date: data.submittedAt as string,
            description: `Assigned to ${assessor.user.name}`,
          },
        ]
      : []),
    ...(data.assessedAt
      ? [
          {
            label: data.status === 'PASSED' ? 'Assessor passed' : 'Assessor failed',
            date: data.assessedAt as string,
            description: data.score != null ? `Score: ${data.score}%` : undefined,
          },
        ]
      : []),
    ...(data.status === 'MINTED' && token
      ? [{ label: 'Credential minted', description: `Token #${token.tokenId}` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Link href="/worker/tests/submissions">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> All submissions
        </Button>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">{data.trade as string}</h1>
          <p className="text-text-secondary">Assessor: {assessor.user.name}</p>
        </div>
        <Badge variant={submissionBadgeVariant(label)}>{label}</Badge>
      </div>

      <WorkerSubmissionTimeline events={events} statusLabel={label} />

      {data.status === 'PASSED' && !token && (
        <Card className="border-teal/30 bg-teal/5">
          <p className="text-sm text-teal">
            Your attempt passed review. Your assessor will mint your soulbound credential.
          </p>
        </Card>
      )}

      {token && (
        <Link href={`/worker/credentials/${token.tokenId}`}>
          <Button>View credential #{token.tokenId}</Button>
        </Link>
      )}

      {typeof data.notes === 'string' && data.notes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Assessor feedback</CardTitle>
          </CardHeader>
          <p className="text-sm text-cream">{data.notes}</p>
        </Card>
      ) : null}

      {trade && (
        <Card>
          <CardHeader>
            <CardTitle>Your self-attempt record</CardTitle>
          </CardHeader>
          <WorkerAttemptChecklist
            trade={trade}
            value={checklist}
            onChange={() => {}}
            readOnly
          />
        </Card>
      )}

      {(data.evidenceUrls as string[])?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence ({(data.evidenceUrls as string[]).length})</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-2">
            {(data.evidenceUrls as string[]).map((url) => (
              <div key={url} className="overflow-hidden rounded-lg border border-border">
                {url.endsWith('.mp4') ? (
                  <video src={url} className="h-24 w-full object-cover" controls />
                ) : (
                  <img src={url} alt="" className="h-24 w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
