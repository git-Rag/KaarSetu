'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Shield } from 'lucide-react';
import { CredentialCard } from '@/components/credential-card';
import { AttestationCard } from '@/components/attestation-card';
import { PolygonscanModal } from '@/components/polygonscan-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { truncateHash, truncateAddress } from '@/lib/utils';
import type { NSQFLevel } from '@prisma/client';
import { useTranslation } from '@/lib/i18n/use-translation';

interface TokenResponse {
  token: {
    tokenId: string;
    txHash: string;
    blockNumber: number;
    trade: string;
    nsqfLevel: NSQFLevel;
    mintedAt: string;
    status: 'ACTIVE' | 'REVOKED';
    metadataHash: string;
    contractAddress: string;
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
    rating: number;
    durationMonths: number;
    attestedAt: string;
    txHash: string;
    employerName: string;
  }[];
}

export default function PublicVerifyPage() {
  const { t } = useTranslation();
  const params = useParams();
  const tokenId = String(params.tokenId);
  const [data, setData] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanOpen, setScanOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/${tokenId}`);
      const json = await res.json();
      if (res.ok) setData(json.data);
      else setData(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-surface-base px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold text-saffron">
            KaarSetu
          </Link>
          <p className="mt-2 text-sm text-text-secondary">{t('credential.verified')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !data ? (
          <Card className="text-center">
            <p className="text-text-secondary">Credential not found</p>
            <p className="mt-2 text-sm text-text-muted">Token #{tokenId} does not exist or was revoked.</p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="outline">{t('common.back')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {data.token.status === 'ACTIVE' ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-teal/40 bg-teal/10 py-4 text-teal">
                <CheckCircle2 className="h-8 w-8" />
                <div className="text-left">
                  <p className="font-display text-lg font-bold uppercase">{t('credential.verified')}</p>
                  <p className="text-xs opacity-80">Active soulbound credential</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-red-err/40 bg-red-err/10 py-4 text-red-err">
                <p className="font-display text-lg font-bold uppercase">REVOKED</p>
              </div>
            )}

            <div className="flex justify-center">
              <CredentialCard
                token={data.token}
                worker={data.worker}
                assessor={data.assessor}
                size="md"
              />
            </div>

            <p className="text-center text-sm text-text-secondary">
              This credential is permanently recorded on the Polygon blockchain.
            </p>

            <Card className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Token ID</span>
                <span className="font-mono text-cream">#{data.token.tokenId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Tx Hash</span>
                <span className="font-mono text-cream">{truncateHash(data.token.txHash)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Block</span>
                <span className="text-cream">#{data.token.blockNumber.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Wallet</span>
                <span className="font-mono text-cream">
                  {truncateAddress(data.worker.walletAddress)}
                </span>
              </div>
              {(data.worker.city || data.worker.state) && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Location</span>
                  <span className="text-cream">
                    {[data.worker.city, data.worker.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full" onClick={() => setScanOpen(true)}>
                {t('credential.viewOnPolygon')}
              </Button>
            </Card>

            {data.attestations.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-cream">Employer Attestations</h2>
                  <Badge variant="teal">{data.attestations.length}</Badge>
                </div>
                <div className="space-y-3">
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
              </div>
            )}

            <footer className="flex items-center justify-center gap-2 border-t border-border pt-6 text-xs text-text-muted">
              <Shield className="h-4 w-4 text-teal" />
              Verified by KaarSetu • Polygon Amoy (simulated)
            </footer>
          </div>
        )}

        {data && (
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
        )}
      </div>
    </div>
  );
}
