'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { CredentialCard } from '@/components/credential-card';
import { CredentialCardBack } from '@/components/credential-card-back';
import { PolygonscanModal } from '@/components/polygonscan-modal';
import { AttestationCard } from '@/components/attestation-card';
import { CredentialPdfDocument } from '@/components/credential-pdf-document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, truncateHash } from '@/lib/utils';
import { ArrowLeft, Download, ExternalLink, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { NSQFLevel, TokenStatus } from '@prisma/client';

interface CredentialData {
  token: {
    tokenId: string;
    txHash: string;
    blockNumber: number;
    trade: string;
    nsqfLevel: NSQFLevel;
    mintedAt: string;
    status: TokenStatus;
    metadataHash: string;
    contractAddress: string;
    score: number | null;
    evidenceUrls: string[];
  };
  worker: {
    name: string;
    walletAddress: string;
    photoUrl?: string | null;
    city?: string;
    state?: string;
    trade?: string;
  };
  assessor: { name: string; itiName: string };
  attestations: {
    id: string;
    projectName: string;
    rating: number;
    durationMonths: number;
    attestedAt: string;
    txHash: string;
    employerName: string;
  }[];
}

export default function WorkerCredentialDetailPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const [data, setData] = useState<CredentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/tokens/${tokenId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, [tokenId]);

  const handleDownloadPdf = useCallback(async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const blob = await pdf(
        <CredentialPdfDocument
          workerName={data.worker.name}
          trade={data.token.trade}
          nsqfLevel={data.token.nsqfLevel}
          tokenId={data.token.tokenId}
          txHash={data.token.txHash}
          blockNumber={data.token.blockNumber}
          assessorIti={data.assessor.itiName}
          mintedAt={formatDate(data.token.mintedAt)}
          walletAddress={data.worker.walletAddress}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kaarsetu-credential-${data.token.tokenId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mx-auto h-64 w-[400px] rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="text-center">
        <p className="text-text-secondary">Credential not found.</p>
        <Link href="/worker/credentials" className="mt-4 inline-block">
          <Button variant="outline">Back to credentials</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/worker/credentials">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="font-display text-2xl font-bold text-cream">
          Credential #{data.token.tokenId}
        </h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="perspective-[1200px]" style={{ perspective: '1200px' }}>
          <motion.div
            className="relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <div
              className={flipped ? 'invisible absolute' : ''}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CredentialCard
                token={data.token}
                worker={data.worker}
                assessor={data.assessor}
                size="lg"
              />
            </div>
            <div
              className={!flipped ? 'invisible absolute' : ''}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <CredentialCardBack tokenId={data.token.tokenId} className="w-[500px] min-h-[300px]" />
            </div>
          </motion.div>
        </div>

        <Button variant="outline" onClick={() => setFlipped((f) => !f)}>
          <RotateCcw className="h-4 w-4" />
          {flipped ? 'Show front' : 'Flip card'}
        </Button>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => setScanOpen(true)}>
            <ExternalLink className="h-4 w-4" />
            View on PolygonScan
          </Button>
          <Button variant="secondary" onClick={handleDownloadPdf} loading={downloading}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <h3 className="font-display font-bold text-cream">On-chain details</h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">Transaction</dt>
            <dd className="font-mono text-cream">{truncateHash(data.token.txHash, 12, 8)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Block</dt>
            <dd className="text-cream">#{data.token.blockNumber.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Metadata (IPFS)</dt>
            <dd className="font-mono text-xs text-cream">{data.token.metadataHash}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Assessment score</dt>
            <dd className="text-cream">{data.token.score ?? '—'}%</dd>
          </div>
        </dl>
      </Card>

      {data.attestations.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-cream">Employer attestations</h2>
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
        </section>
      )}

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
    </div>
  );
}
