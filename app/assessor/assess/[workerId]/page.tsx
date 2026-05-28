'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AssessmentChecklist } from '@/components/assessment-checklist';
import { BlockchainLoader } from '@/components/blockchain-loader';
import { PolygonscanModal } from '@/components/polygonscan-modal';
import { CredentialCard } from '@/components/credential-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NSQF_LEVELS } from '@/lib/constants';
import { getTradeByName, getTradeIdFromName } from '@/lib/trades';
import {
  simulateMint,
  type MintChainStatus,
} from '@/lib/mock-chain';
import { calculateChecklistScore } from '@/lib/utils';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { NSQFLevel } from '@prisma/client';

type Step = 'setup' | 'checklist' | 'evidence' | 'review' | 'mint' | 'success';

interface WorkerData {
  id: string;
  trade: string;
  city: string;
  state: string;
  photoUrl?: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
    walletAddress: string;
    avatarUrl?: string | null;
  };
  assessments: { id: string; status: string }[];
}

interface MintedToken {
  tokenId: string;
  txHash: string;
  blockNumber: number;
  metadataHash: string;
  trade: string;
  nsqfLevel: NSQFLevel;
  mintedAt: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function AssessWorkerPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.workerId as string;

  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('setup');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [nsqfLevel, setNsqfLevel] = useState<NSQFLevel>('LEVEL_2');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [minting, setMinting] = useState(false);
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [chainStatus, setChainStatus] = useState<MintChainStatus>('idle');
  const [mintedToken, setMintedToken] = useState<MintedToken | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const trade = useMemo(
    () => (worker ? getTradeByName(worker.trade) : undefined),
    [worker]
  );

  const score = useMemo(() => {
    if (!trade) return 0;
    return calculateChecklistScore(checklist, trade.checklist);
  }, [checklist, trade]);

  const nsqfOptions = useMemo(() => {
    if (!trade) return NSQF_LEVELS.map((l) => ({ value: l.value, label: l.label }));
    return NSQF_LEVELS.filter((l) => trade.nsqfLevels.includes(l.number)).map((l) => ({
      value: l.value,
      label: l.label,
    }));
  }, [trade]);

  useEffect(() => {
    fetch(`/api/workers/${workerId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setWorker(json.data);
          const pending = json.data.assessments?.find(
            (a: { status: string }) =>
              a.status === 'PENDING' || a.status === 'PASSED'
          );
          if (pending) setAssessmentId(pending.id);
        }
      })
      .catch(() => toast.error('Failed to load worker'))
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(() => {
    if (!assessmentId) return;
    fetch(`/api/assessments/${assessmentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) return;
        const a = json.data;
        setNsqfLevel(a.nsqfLevel);
        setChecklist((a.checklistData as Record<string, boolean>) ?? {});
        setEvidenceUrls(a.evidenceUrls ?? []);
        setNotes(a.notes ?? '');
        if (a.status === 'PASSED') setStep('mint');
        else if (a.status === 'PENDING' && Object.keys(a.checklistData ?? {}).some(Boolean)) {
          setStep('checklist');
        }
      })
      .catch(() => {});
  }, [assessmentId]);

  useEffect(() => {
    if (trade && Object.keys(checklist).length === 0) {
      const initial: Record<string, boolean> = {};
      trade.checklist.forEach((item) => {
        initial[item.id] = false;
      });
      setChecklist(initial);
    }
  }, [trade, checklist]);

  const createAssessment = useCallback(async () => {
    if (!worker || !trade) return;
    setSubmitting(true);
    try {
      const tradeKey = getTradeIdFromName(worker.trade) ?? trade.id;
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerProfileId: worker.id,
          trade: tradeKey,
          nsqfLevel,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create assessment');
      setAssessmentId(json.data.id);
      const checklistData = json.data.checklistData as Record<string, boolean>;
      setChecklist(checklistData);
      setStep('checklist');
      toast.success('Assessment started');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start assessment');
    } finally {
      setSubmitting(false);
    }
  }, [worker, trade, nsqfLevel]);

  const saveProgress = useCallback(
    async (status?: 'PENDING' | 'PASSED' | 'FAILED') => {
      if (!assessmentId) return false;
      const res = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistData: checklist,
          evidenceUrls,
          notes,
          score,
          ...(status ? { status } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to save');
        return false;
      }
      return true;
    },
    [assessmentId, checklist, evidenceUrls, notes, score]
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !assessmentId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('assessmentId', assessmentId);
      Array.from(files).forEach((f) => formData.append('evidence', f));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      setEvidenceUrls((prev) => [...prev, ...(json.data as string[])]);
      toast.success(`${json.data.length} file(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePass = async () => {
    if (score < 60) {
      toast.error('Score must be at least 60% to pass');
      return;
    }
    setSubmitting(true);
    const ok = await saveProgress('PASSED');
    setSubmitting(false);
    if (ok) {
      setStep('mint');
      toast.success('Assessment passed — ready to mint');
    }
  };

  const handleMint = async () => {
    if (!assessmentId || !worker) return;
    setMinting(true);
    setLoaderOpen(true);
    setChainStatus('broadcasting');

    const minWait = sleep(4000);
    const mintApi = fetch(`/api/assessments/${assessmentId}/mint`, { method: 'POST' });
    const simMint = simulateMint(setChainStatus);

    try {
      const [apiRes] = await Promise.all([mintApi, simMint, minWait]);
      const json = await apiRes.json();

      if (!apiRes.ok) {
        throw new Error(json.error ?? 'Mint failed');
      }

      const token = json.data as MintedToken & { mintedAt: string };
      setMintedToken({
        tokenId: token.tokenId,
        txHash: token.txHash,
        blockNumber: token.blockNumber,
        metadataHash: token.metadataHash,
        trade: token.trade,
        nsqfLevel: token.nsqfLevel,
        mintedAt: token.mintedAt,
        gasUsed: token.gasUsed,
        effectiveGasPrice: token.effectiveGasPrice,
      });
      setStep('success');
      setLoaderOpen(false);
      toast.success(`Credential #${token.tokenId} minted on Polygon`);
    } catch (e) {
      setChainStatus('failed');
      toast.error(e instanceof Error ? e.message : 'Mint failed');
      setTimeout(() => setLoaderOpen(false), 1500);
    } finally {
      setMinting(false);
    }
  };

  const handleLoaderComplete = () => {
    setLoaderOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!worker || !trade) {
    return (
      <Card>
        <p className="text-text-secondary">Worker not found or trade not supported.</p>
        <Link href="/assessor/assess" className="mt-4 inline-block">
          <Button variant="outline">Back to search</Button>
        </Link>
      </Card>
    );
  }

  if (step === 'success' && mintedToken) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-teal" />
          <h1 className="mt-4 font-display text-2xl font-bold text-cream">
            Credential minted successfully
          </h1>
          <p className="mt-2 text-text-secondary">
            {worker.user.name} now holds NSQF credential #{mintedToken.tokenId} on Polygon.
          </p>
        </div>

        <div className="flex justify-center">
          <CredentialCard
            token={{
              ...mintedToken,
              status: 'ACTIVE',
            }}
            worker={{
              name: worker.user.name,
              walletAddress: worker.user.walletAddress,
              photoUrl: worker.photoUrl ?? worker.user.avatarUrl,
            }}
            assessor={{ name: 'You', itiName: 'Your ITI' }}
            size="lg"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => setScanOpen(true)}>View on PolygonScan</Button>
          <Button variant="outline" onClick={() => router.push('/assessor/history')}>
            View history
          </Button>
          <Link href="/assessor/assess">
            <Button variant="ghost">Assess another worker</Button>
          </Link>
        </div>

        <PolygonscanModal
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          txHash={mintedToken.txHash}
          blockNumber={mintedToken.blockNumber}
          tokenId={mintedToken.tokenId}
          workerWallet={worker.user.walletAddress}
          metadataHash={mintedToken.metadataHash}
          gasUsed={mintedToken.gasUsed}
          gasPrice={mintedToken.effectiveGasPrice}
          timestamp={mintedToken.mintedAt}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/assessor/assess">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream">{worker.user.name}</h1>
          <p className="text-text-secondary">
            {worker.trade} • {worker.city}, {worker.state} • {worker.user.phone}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['setup', 'checklist', 'evidence', 'review', 'mint'] as Step[]).map((s, i) => (
          <Badge
            key={s}
            variant={step === s ? 'teal' : 'default'}
            className={step === s ? '' : 'opacity-50'}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        ))}
      </div>

      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Start assessment</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Trade: <strong className="text-cream">{trade.name}</strong> ({trade.sector})
            </p>
            <Select
              label="NSQF level to assess"
              value={nsqfLevel}
              onChange={(e) => setNsqfLevel(e.target.value as NSQFLevel)}
              options={nsqfOptions}
            />
            {assessmentId ? (
              <Button onClick={() => setStep('checklist')}>Continue existing assessment</Button>
            ) : (
              <Button onClick={createAssessment} loading={submitting}>
                Begin checklist
              </Button>
            )}
          </div>
        </Card>
      )}

      {step === 'checklist' && trade && (
        <Card>
          <CardHeader>
            <CardTitle>Skill checklist — {trade.name}</CardTitle>
          </CardHeader>
          <AssessmentChecklist trade={trade} value={checklist} onChange={setChecklist} />
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                await saveProgress();
                setStep('setup');
              }}
            >
              Back
            </Button>
            <Button
              onClick={async () => {
                await saveProgress();
                setStep('evidence');
              }}
            >
              Next: Evidence
            </Button>
          </div>
        </Card>
      )}

      {step === 'evidence' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload evidence</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-text-secondary">
            Photos or short videos of practical demonstration (max 5 files, 10MB each).
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 hover:border-saffron/40">
            <Upload className="mb-2 h-8 w-8 text-text-muted" />
            <span className="text-sm text-cream">Click to upload evidence</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              multiple
              disabled={uploading || !assessmentId}
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
          {evidenceUrls.length > 0 && (
            <ul className="mt-4 space-y-2">
              {evidenceUrls.map((url) => (
                <li key={url} className="text-sm text-teal">
                  ✓ {url}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-cream">Assessor notes</label>
            <textarea
              className="w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-cream"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Overall observations..."
            />
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep('checklist')}>
              Back
            </Button>
            <Button
              onClick={async () => {
                await saveProgress();
                setStep('review');
              }}
            >
              Review & submit
            </Button>
          </div>
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review assessment</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Worker</dt>
              <dd className="text-cream">{worker.user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Trade / NSQF</dt>
              <dd className="text-cream">
                {trade.name} • {nsqfLevel.replace('LEVEL_', 'Level ')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Checklist score</dt>
              <dd className="font-bold text-saffron">{score}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Evidence files</dt>
              <dd className="text-cream">{evidenceUrls.length}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep('evidence')}>
              Back
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              onClick={async () => {
                setSubmitting(true);
                await saveProgress('FAILED');
                setSubmitting(false);
                toast.info('Assessment marked as failed');
                router.push('/assessor/history');
              }}
            >
              Fail
            </Button>
            <Button loading={submitting} onClick={handlePass} disabled={score < 60}>
              Pass assessment
            </Button>
          </div>
        </Card>
      )}

      {step === 'mint' && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Mint soulbound credential</CardTitle>
          </CardHeader>
          <p className="mb-2 text-text-secondary">
            Assessment passed with {score}%. Mint an ERC-5192 token on Polygon Amoy for{' '}
            <strong className="text-cream">{worker.user.name}</strong>.
          </p>
          <p className="mb-6 text-xs text-text-muted">
            This will broadcast a transaction to the KaarSetu registry contract (~4 seconds).
          </p>
          <Button size="lg" onClick={handleMint} loading={minting} disabled={minting}>
            Confirm &amp; Mint
          </Button>
        </Card>
      )}

      <BlockchainLoader
        open={loaderOpen}
        status={chainStatus}
        onComplete={handleLoaderComplete}
      />
    </div>
  );
}
