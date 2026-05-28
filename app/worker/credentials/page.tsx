'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CredentialCard } from '@/components/credential-card';
import { EmptyState, WorkerEmptyCredentialsIcon } from '@/components/empty-state';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { NSQFLevel, TokenStatus } from '@prisma/client';

interface TokenRow {
  id: string;
  tokenId: string;
  txHash: string;
  blockNumber: number;
  trade: string;
  nsqfLevel: NSQFLevel;
  mintedAt: string;
  status: TokenStatus;
  metadataHash: string;
  workerProfile: {
    user: { name: string; walletAddress: string; avatarUrl: string | null };
    photoUrl: string | null;
  };
  assessment: {
    assessorProfile: {
      user: { name: string };
      itiName: string;
    };
  };
}

import { useTranslation } from '@/lib/i18n/use-translation';

export default function WorkerCredentialsPage() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeFilter, setTradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/tokens')
      .then((r) => r.json())
      .then((json) => setTokens(json.data ?? []))
      .catch(() => setTokens([]))
      .finally(() => setLoading(false));
  }, []);

  const trades = useMemo(
    () => ['all', ...Array.from(new Set(tokens.map((t) => t.trade)))],
    [tokens]
  );

  const filtered = useMemo(() => {
    return tokens.filter((t) => {
      if (tradeFilter !== 'all' && t.trade !== tradeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search && !t.tokenId.includes(search) && !t.trade.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [tokens, tradeFilter, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">{t('nav.credentials')}</h1>
        <p className="mt-1 text-text-secondary">
          Soulbound skill tokens minted on Polygon — non-transferable, verifiable anywhere.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          placeholder="Search by token ID or trade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label={t('common.trade')}
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value)}
          options={trades.map((tr) => ({
            value: tr,
            label: tr === 'all' ? (t('common.next') === 'आगे' ? 'सभी ट्रेड' : 'All trades') : tr,
          }))}
        />
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: t('common.next') === 'आगे' ? 'सभी' : 'All statuses' },
            { value: 'ACTIVE', label: t('common.active') },
            { value: 'REVOKED', label: 'Revoked' },
          ]}
        />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No credentials yet"
          description="Get assessed by an ITI-certified assessor to mint your first on-chain skill credential."
          icon={<WorkerEmptyCredentialsIcon />}
          action={{ label: t('common.dashboard'), href: '/worker/dashboard' }}
        />
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((token) => (
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
                  name: token.workerProfile.user.name,
                  walletAddress: token.workerProfile.user.walletAddress,
                  photoUrl: token.workerProfile.photoUrl ?? token.workerProfile.user.avatarUrl,
                }}
                assessor={{
                  name: token.assessment.assessorProfile.user.name,
                  itiName: token.assessment.assessorProfile.itiName,
                }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
