'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Star } from 'lucide-react';
import { CredentialCard } from '@/components/credential-card';
import { AttestationCard } from '@/components/attestation-card';
import { PolygonscanModal } from '@/components/polygonscan-modal';
import { Modal } from '@/components/ui/modal';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { getTradeByName } from '@/lib/trades';
import { normalizeChecklistData } from '@/lib/assessment-scoring';
import { saveRecentVerification, markVerificationAttested } from '@/lib/recent-verifications';
import { toast } from 'sonner';
import type { NSQFLevel } from '@prisma/client';

interface TokenResponse {
  token: {
    id: string;
    tokenId: string;
    txHash: string;
    blockNumber: number;
    trade: string;
    nsqfLevel: NSQFLevel;
    mintedAt: string;
    status: 'ACTIVE' | 'REVOKED';
    metadataHash: string;
    evidenceUrls: string[];
    checklistData: Record<string, { result: string; note?: string } | boolean>;
    score: number | null;
  };
  worker: {
    name: string;
    walletAddress: string;
    photoUrl?: string | null;
    city?: string;
    state?: string;
  };
  assessor: { name: string; itiName: string };
  attestations: {
    id: string;
    projectName: string;
    projectDetails: string;
    durationMonths: number;
    rating: number;
    attestedAt: string;
    txHash: string;
    employerName: string;
  }[];
}

export default function EmployerVerifyTokenPage() {
  const params = useParams();
  const tokenId = String(params.tokenId);
  const [data, setData] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanOpen, setScanOpen] = useState(false);
  const [attestOpen, setAttestOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [durationMonths, setDurationMonths] = useState(6);
  const [rating, setRating] = useState(5);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/${tokenId}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Credential not found');
        setData(null);
        return;
      }
      setData(json.data);
      saveRecentVerification({
        tokenId: json.data.token.tokenId,
        workerName: json.data.worker.name,
        trade: json.data.token.trade,
        attested: json.data.attestations.length > 0,
      });
    } catch {
      toast.error('Failed to load credential');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitAttestation = async () => {
    if (!data) return;
    if (projectName.length < 2 || projectDetails.length < 10) {
      toast.error('Fill all attestation fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: data.token.id,
          projectName,
          projectDetails,
          durationMonths,
          rating,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Attestation failed');
        return;
      }
      toast.success('Attestation recorded on-chain');
      markVerificationAttested(data.token.tokenId);
      setAttestOpen(false);
      setProjectName('');
      setProjectDetails('');
      load();
    } catch {
      toast.error('Attestation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="text-center">
        <p className="text-text-secondary">Credential not found for token #{tokenId}</p>
        <Link href="/employer/verify" className="mt-4 inline-block">
          <Button variant="outline">Back to Scanner</Button>
        </Link>
      </Card>
    );
  }

  const trade = getTradeByName(data.token.trade);
  const checklist = trade?.checklist ?? [];
  const normalized = trade
    ? normalizeChecklistData(data.token.checklistData, trade)
    : {};
  const passedCount = checklist.filter(
    (item) =>
      normalized[item.id]?.result === 'PASS' || normalized[item.id]?.result === 'PARTIAL'
  ).length;
  const totalCount = checklist.length || 8;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/employer/verify" className="text-sm text-text-secondary hover:text-saffron">
            ← Back to scanner
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-cream">
            {data.worker.name}
          </h1>
          <p className="text-text-secondary">{data.token.trade}</p>
        </div>
        {data.token.status === 'ACTIVE' ? (
          <Badge variant="teal">ACTIVE</Badge>
        ) : (
          <Badge variant="red">REVOKED</Badge>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        <CredentialCard
          token={data.token}
          worker={data.worker}
          assessor={data.assessor}
          size="lg"
        />

        <Card className="w-full max-w-sm border-teal/40 bg-teal/5 lg:flex-1">
          <div className="flex items-center gap-2 text-teal">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-display font-bold uppercase tracking-wide">
              Verified on Polygon
            </span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Block</dt>
              <dd className="font-mono text-cream">#{data.token.blockNumber.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Verified in</dt>
              <dd className="text-cream">0.3 seconds</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Token type</dt>
              <dd className="text-cream">Non-transferable (SBT)</dd>
            </div>
            {data.token.score != null && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Assessment score</dt>
                <dd className="text-saffron">{data.token.score}%</dd>
              </div>
            )}
          </dl>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => setScanOpen(true)}
          >
            View on Polygonscan
          </Button>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Assessment Checklist — {passedCount}/{totalCount} passed
          </CardTitle>
        </CardHeader>
        <ul className="space-y-2">
          {checklist.map((item) => {
            const result = normalized[item.id]?.result;
            const passed = result === 'PASS';
            const partial = result === 'PARTIAL';
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
              >
                <span
                  className={
                    passed ? 'text-teal' : partial ? 'text-amber' : 'text-red-err'
                  }
                >
                  {passed ? '✓' : partial ? '◐' : '✗'}
                </span>
                <div>
                  <p className="font-medium text-cream">{item.label}</p>
                  {item.isRequired && (
                    <span className="text-xs text-red-err">Required</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {data.token.evidenceUrls?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Evidence</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.token.evidenceUrls.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square overflow-hidden rounded-lg border border-border"
              >
                <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </Card>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-cream">Attestations</h2>
          {data.token.status === 'ACTIVE' && (
            <Button variant="teal" onClick={() => setAttestOpen(true)}>
              Add Attestation
            </Button>
          )}
        </div>
        {data.attestations.length === 0 ? (
          <Card className="text-center text-text-secondary">
            <p>No employer attestations yet. Be the first to verify this worker&apos;s experience.</p>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.attestations.map((a, i) => (
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
        )}
      </div>

      <PolygonscanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        txHash={data.token.txHash}
        blockNumber={data.token.blockNumber}
        tokenId={data.token.tokenId}
        workerWallet={data.worker.walletAddress}
        metadataHash={data.token.metadataHash}
        timestamp={data.token.mintedAt}
      />

      <Modal open={attestOpen} onClose={() => setAttestOpen(false)} title="Add Attestation" size="lg">
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Residential Complex — BHEL Colony"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream">
              Project Description
            </label>
            <textarea
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              rows={4}
              placeholder="Describe the work performed, quality, and duration..."
              className="w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-cream placeholder:text-text-muted focus:border-saffron/50 focus:outline-none focus:ring-1 focus:ring-saffron/30"
            />
          </div>
          <Input
            label="Duration (months)"
            type="number"
            min={1}
            max={120}
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-cream">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="rounded-lg p-2 transition-all duration-200 hover:bg-surface-hover"
                >
                  <Star
                    className={`h-8 w-8 ${n <= rating ? 'fill-amber text-amber' : 'text-border'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" loading={submitting} onClick={submitAttestation}>
            Submit Attestation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
