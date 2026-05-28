'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  normalizeWorkerChecklistData,
  resolveTradeForAssessment,
  calculateAssessorScoreFromWorkerChecklist,
  isPassingScore,
  type WorkerChecklistData,
} from '@/lib/assessment-scoring';
import { AssessorReviewChecklist } from '@/components/assessor-review-checklist';
import { BlockchainLoader } from '@/components/blockchain-loader';
import { PolygonscanModal } from '@/components/polygonscan-modal';
import { CredentialCard } from '@/components/credential-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { simulateMint, type MintChainStatus } from '@/lib/mock-chain';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

import { useTranslation } from '@/lib/i18n/use-translation';

export default function AssessorReviewPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Record<string, unknown> | null>(null);
  const [checklist, setChecklist] = useState<WorkerChecklistData>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [minting, setMinting] = useState(false);
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [chainStatus, setChainStatus] = useState<MintChainStatus>('idle');
  const [scanOpen, setScanOpen] = useState(false);
  const [minted, setMinted] = useState<Record<string, unknown> | null>(null);

  const trade = assessment ? resolveTradeForAssessment(assessment.trade as string) : undefined;
  const score = trade ? calculateAssessorScoreFromWorkerChecklist(checklist, trade.checklist) : 0;
  const passEligible = trade ? isPassingScore(score, trade) : false;

  const load = useCallback(() => {
    fetch(`/api/assessments/${assessmentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) return;
        setAssessment(json.data);
        const t_obj = resolveTradeForAssessment(json.data.trade);
        if (t_obj) {
          setChecklist(normalizeWorkerChecklistData(json.data.checklistData, t_obj));
        }
        setNotes(json.data.notes ?? '');
      })
      .finally(() => setLoading(false));
  }, [assessmentId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveReview = async (finalize: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/assessor/submissions/${assessmentId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistData: checklist, notes, finalize }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (finalize) {
        toast.success(json.data.status === 'PASSED' ? 'Attempt passed' : 'Attempt failed');
        load();
      } else {
        toast.success('Review saved');
      }
      return json.data;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleMint = async () => {
    setMinting(true);
    setLoaderOpen(true);
    setChainStatus('broadcasting');
    try {
      const [apiRes] = await Promise.all([
        fetch(`/api/assessments/${assessmentId}/mint`, { method: 'POST' }),
        simulateMint(setChainStatus),
        sleep(4000),
      ]);
      const json = await apiRes.json();
      if (!apiRes.ok) throw new Error(json.error);
      setMinted(json.data);
      setLoaderOpen(false);
      toast.success(`Minted #${json.data.tokenId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Mint failed');
      setLoaderOpen(false);
    } finally {
      setMinting(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!assessment || !trade) {
    return (
      <Card>
        <p>Submission not found.</p>
        <Link href="/assessor/dashboard">
          <Button className="mt-4">{t('common.back')}</Button>
        </Link>
      </Card>
    );
  }

  const worker = assessment.workerProfile as {
    user: { name: string; phone: string; walletAddress: string };
    photoUrl?: string | null;
  };
  const status = assessment.status as string;

  if (minted) {
    const token = minted as { tokenId: string; txHash: string; blockNumber: number };
    return (
      <div className="space-y-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-teal" />
        <h1 className="font-display text-2xl font-bold text-cream">Credential minted</h1>
        <Button onClick={() => router.push('/assessor/dashboard')}>Back to dashboard</Button>
        <PolygonscanModal
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          txHash={token.txHash}
          blockNumber={token.blockNumber}
          tokenId={token.tokenId}
          workerWallet={worker.user.walletAddress}
          metadataHash={String(minted.metadataHash)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/assessor/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> {t('common.dashboard')}
        </Button>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="amber" className="mb-2">
            Worker submission
          </Badge>
          <h1 className="font-display text-2xl font-bold text-cream">{worker.user.name}</h1>
          <p className="text-text-secondary">
            {t(`trades.${trade.id}.testTitle`)} • Submitted{' '}
            {assessment.submittedAt
              ? formatDate(assessment.submittedAt as string)
              : '—'}
          </p>
        </div>
        <Badge
          variant={
            status === 'PASSED' ? 'teal' : status === 'FAILED' ? 'red' : 'amber'
          }
        >
          {status}
        </Badge>
      </div>

      {(assessment.evidenceUrls as string[])?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Worker evidence ({(assessment.evidenceUrls as string[]).length})
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(assessment.evidenceUrls as string[]).map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {url.endsWith('.mp4') ? (
                  <video src={url} className="h-28 w-full rounded-lg object-cover" controls />
                ) : (
                  <img src={url} alt="" className="h-28 w-full rounded-lg object-cover" />
                )}
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assessor scoring</CardTitle>
          <p className="text-sm text-text-secondary">
            {t('assessor.review.scoreDisclaimer')}
          </p>
        </CardHeader>
        <AssessorReviewChecklist trade={trade} value={checklist} onChange={setChecklist} />
        <textarea
          className="mt-4 w-full rounded-lg border border-border bg-surface-raised p-3 text-cream"
          rows={3}
          placeholder={t('assessor.review.assessorFeedback')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => saveReview(false)} loading={saving}>
          Save progress
        </Button>
        <Button
          onClick={() => saveReview(true)}
          loading={saving}
          disabled={!passEligible && status === 'PENDING'}
        >
          Finalize review
        </Button>
      </div>

      {status === 'PASSED' && (
        <Card className="border-saffron/40 text-center">
          <CardHeader>
            <CardTitle>Mint soulbound credential</CardTitle>
          </CardHeader>
          <p className="mb-4 text-text-secondary">
            Worker scored {Number(assessment.score ?? score)}% — eligible for SBT mint.
          </p>
          <Button size="lg" onClick={handleMint} loading={minting}>
            Confirm &amp; Mint SBT
          </Button>
        </Card>
      )}

      <BlockchainLoader
        open={loaderOpen}
        status={chainStatus}
        onComplete={() => setLoaderOpen(false)}
      />
    </div>
  );
}
