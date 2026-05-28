'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AssessmentChecklist } from '@/components/assessment-checklist';
import { BlockchainLoader } from '@/components/blockchain-loader';
import { PolygonscanModal } from '@/components/polygonscan-modal';
import { CredentialCard } from '@/components/credential-card';
import { PracticalModuleCard } from '@/components/practical-module-card';
import { EvidenceSuggestionsPanel } from '@/components/evidence-suggestions-panel';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NSQF_LEVELS } from '@/lib/constants';
import { TRADES, getTradeById, getTradeIdFromName, type Trade } from '@/lib/trades';
import { simulateMint, type MintChainStatus } from '@/lib/mock-chain';
import {
  calculatePracticalScore,
  createEmptyChecklist,
  normalizeChecklistData,
  isPassingScore,
  type ChecklistData,
} from '@/lib/assessment-scoring';
import { ArrowLeft, Upload, CheckCircle, Save } from 'lucide-react';
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
  assessments: { id: string; status: string; trade: string }[];
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
  const [selectedTradeId, setSelectedTradeId] = useState<string>('electrician');
  const [nsqfLevel, setNsqfLevel] = useState<NSQFLevel>('LEVEL_2');
  const [checklist, setChecklist] = useState<ChecklistData>({});
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [minting, setMinting] = useState(false);
  const [loaderOpen, setLoaderOpen] = useState(false);
  const [chainStatus, setChainStatus] = useState<MintChainStatus>('idle');
  const [mintedToken, setMintedToken] = useState<MintedToken | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const trade: Trade | undefined = useMemo(
    () => getTradeById(selectedTradeId),
    [selectedTradeId]
  );

  const score = useMemo(() => {
    if (!trade) return 0;
    return calculatePracticalScore(checklist, trade.checklist);
  }, [checklist, trade]);

  const passEligible = trade ? isPassingScore(score, trade) : false;

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
          const workerTradeId = getTradeIdFromName(json.data.trade);
          if (workerTradeId && TRADES.some((t) => t.id === workerTradeId)) {
            setSelectedTradeId(workerTradeId);
          }
          const pending = json.data.assessments?.find(
            (a: { status: string }) => a.status === 'PENDING' || a.status === 'PASSED'
          );
          if (pending) setAssessmentId(pending.id);
        }
      })
      .catch(() => toast.error('Failed to load worker'))
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(() => {
    if (!assessmentId || !trade) return;
    fetch(`/api/assessments/${assessmentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) return;
        const a = json.data;
        setNsqfLevel(a.nsqfLevel);
        const tradeId = getTradeIdFromName(a.trade);
        if (tradeId) setSelectedTradeId(tradeId);
        setChecklist(normalizeChecklistData(a.checklistData, trade));
        setEvidenceUrls(a.evidenceUrls ?? []);
        setNotes(a.notes ?? '');
        if (a.status === 'PASSED') setStep('mint');
        else if (a.status === 'PENDING') {
          const hasMarks = Object.values(
            normalizeChecklistData(a.checklistData, trade)
          ).some((e) => e.result === 'PASS' || e.result === 'PARTIAL');
          if (hasMarks) setStep('checklist');
        }
      })
      .catch(() => {});
  }, [assessmentId, trade]);

  useEffect(() => {
    if (trade && Object.keys(checklist).length === 0) {
      setChecklist(createEmptyChecklist(trade));
    }
  }, [trade, checklist]);

  const createAssessment = useCallback(async () => {
    if (!worker || !trade) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerProfileId: worker.id,
          trade: trade.id,
          nsqfLevel,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create assessment');
      setAssessmentId(json.data.id);
      setChecklist(normalizeChecklistData(json.data.checklistData, trade));
      setStep('checklist');
      toast.success(`${trade.testTitle} started`);
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
          ...(status ? { status } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to save');
        return false;
      }
      if (json.data?.score != null && status !== 'PASSED') {
        toast.success('Draft saved');
      }
      return true;
    },
    [assessmentId, checklist, evidenceUrls, notes]
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !assessmentId) return;
    if (evidenceUrls.length + files.length > 5) {
      toast.error('Maximum 5 evidence files');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('assessmentId', assessmentId);
      Array.from(files).forEach((f) => formData.append('evidence', f));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      setEvidenceUrls((prev) => [...prev, ...(json.data as string[])]);
      toast.success(`${(json.data as string[]).length} file(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePass = async () => {
    if (!trade) return;
    if (!passEligible) {
      toast.error(`Score must be at least ${trade.passingScore}% to pass`);
      return;
    }
    setSubmitting(true);
    const ok = await saveProgress('PASSED');
    setSubmitting(false);
    if (ok) {
      setStep('mint');
      toast.success('Practical test passed — ready to mint SBT');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!worker) {
    return (
      <Card>
        <p className="text-text-secondary">Worker not found.</p>
        <Link href="/assessor/assess" className="mt-4 inline-block">
          <Button variant="outline">Back to search</Button>
        </Link>
      </Card>
    );
  }

  if (step === 'success' && mintedToken && trade) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-teal" />
          <h1 className="mt-4 font-display text-2xl font-bold text-cream">
            Credential minted successfully
          </h1>
          <p className="mt-2 text-text-secondary">
            {worker.user.name} — {trade.testTitle} • #{mintedToken.tokenId}
          </p>
        </div>
        <div className="flex justify-center">
          <CredentialCard
            token={{ ...mintedToken, status: 'ACTIVE' }}
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
            {worker.trade} • {worker.city} • {worker.user.phone}
          </p>
        </div>
        {trade && (
          <Badge variant={passEligible ? 'teal' : 'amber'} className="ml-auto">
            {passEligible ? 'Pass eligible' : 'Needs improvement'} — {score}%
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['setup', 'checklist', 'evidence', 'review', 'mint'] as Step[]).map((s, i) => (
          <Badge key={s} variant={step === s ? 'teal' : 'default'} className={step === s ? '' : 'opacity-50'}>
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        ))}
      </div>

      {step === 'setup' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-cream">Select practical module</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {TRADES.map((t) => (
                <PracticalModuleCard
                  key={t.id}
                  trade={t}
                  selected={selectedTradeId === t.id}
                  onSelect={() => {
                    setSelectedTradeId(t.id);
                    setChecklist(createEmptyChecklist(t));
                  }}
                />
              ))}
            </div>
          </div>

          {trade && (
            <Card>
              <CardHeader>
                <CardTitle>{trade.testTitle}</CardTitle>
              </CardHeader>
              <p className="mb-4 text-sm text-text-secondary">{trade.moduleInstructions}</p>
              <Select
                label="NSQF level"
                value={nsqfLevel}
                onChange={(e) => setNsqfLevel(e.target.value as NSQFLevel)}
                options={nsqfOptions}
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {assessmentId ? (
                  <Button onClick={() => setStep('checklist')}>Continue assessment</Button>
                ) : (
                  <Button onClick={createAssessment} loading={submitting}>
                    Begin practical test
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {step === 'checklist' && trade && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{trade.testTitle}</CardTitle>
              <p className="text-sm text-text-secondary">Mark each observed task result</p>
            </CardHeader>
            <AssessmentChecklist trade={trade} value={checklist} onChange={setChecklist} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  await saveProgress();
                  setStep('setup');
                }}
              >
                <Save className="h-4 w-4" /> Save draft
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
          <EvidenceSuggestionsPanel suggestions={trade.evidenceSuggestions} />
        </div>
      )}

      {step === 'evidence' && trade && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload assessment evidence</CardTitle>
            </CardHeader>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-all duration-200 hover:border-saffron/40">
              <Upload className="mb-2 h-8 w-8 text-text-muted" />
              <span className="text-sm text-cream">JPG, PNG, WebP, or MP4 (max 5 files, 10MB each)</span>
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
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {evidenceUrls.map((url) => (
                  <div key={url} className="overflow-hidden rounded-lg border border-border">
                    {url.endsWith('.mp4') ? (
                      <video src={url} className="h-24 w-full object-cover" controls />
                    ) : (
                      <img src={url} alt="" className="h-24 w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-cream">Final assessor notes</label>
              <textarea
                className="w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-cream"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Overall practical test observations..."
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep('checklist')}>
                Back
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await saveProgress();
                }}
              >
                Save draft
              </Button>
              <Button
                onClick={async () => {
                  await saveProgress();
                  setStep('review');
                }}
              >
                Review &amp; submit
              </Button>
            </div>
          </Card>
          <EvidenceSuggestionsPanel suggestions={trade.evidenceSuggestions} />
        </div>
      )}

      {step === 'review' && trade && (
        <Card>
          <CardHeader>
            <CardTitle>Submit practical test</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Module</dt>
              <dd className="text-cream">{trade.testTitle}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">NSQF</dt>
              <dd className="text-cream">{nsqfLevel.replace('LEVEL_', 'Level ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Weighted score</dt>
              <dd className={passEligible ? 'font-bold text-teal' : 'font-bold text-amber'}>
                {score}% (pass ≥ {trade.passingScore}%)
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Evidence</dt>
              <dd className="text-cream">{evidenceUrls.length} file(s)</dd>
            </div>
          </dl>
          {passEligible ? (
            <p className="mt-4 rounded-lg border border-teal/30 bg-teal/10 p-3 text-sm text-teal">
              Worker meets passing criteria. Submit to enable SBT minting.
            </p>
          ) : (
            <p className="mt-4 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm text-amber">
              Score below {trade.passingScore}%. Mark more tasks as Pass or Partial, or fail the
              assessment.
            </p>
          )}
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
                toast.error('Assessment marked as failed');
                router.push('/assessor/history');
              }}
            >
              Fail assessment
            </Button>
            <Button loading={submitting} onClick={handlePass} disabled={!passEligible}>
              Submit passed test
            </Button>
          </div>
        </Card>
      )}

      {step === 'mint' && trade && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Mint soulbound credential</CardTitle>
          </CardHeader>
          <Badge variant="teal" className="mb-4">
            Passed {score}% — {trade.testTitle}
          </Badge>
          <p className="mb-6 text-text-secondary">
            Mint ERC-5192 SBT for <strong className="text-cream">{worker.user.name}</strong> on
            Polygon Amoy.
          </p>
          <Button size="lg" onClick={handleMint} loading={minting} disabled={minting}>
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
