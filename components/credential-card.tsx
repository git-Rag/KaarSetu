'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatDate, getVerifyUrl } from '@/lib/utils';
import { QrGenerator } from '@/components/qr-generator';
import { NsqfLevelBadge } from '@/components/nsqf-level-badge';
import type { NSQFLevel } from '@prisma/client';

export interface CredentialCardProps {
  token: {
    tokenId: string;
    txHash: string;
    blockNumber: number;
    trade: string;
    nsqfLevel: NSQFLevel;
    mintedAt: Date | string;
    status: 'ACTIVE' | 'REVOKED';
    metadataHash: string;
  };
  worker: {
    name: string;
    walletAddress: string;
    photoUrl?: string | null;
  };
  assessor: {
    name: string;
    itiName: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showFlip?: boolean;
  className?: string;
}

const sizes = {
  sm: { w: 320, h: 192, qr: 64, name: 'text-sm', photo: 36 },
  md: { w: 400, h: 240, qr: 80, name: 'text-base', photo: 48 },
  lg: { w: 500, h: 300, qr: 96, name: 'text-xl', photo: 56 },
};

export function CredentialCard({
  token,
  worker,
  assessor,
  size = 'md',
  className,
}: CredentialCardProps) {
  const [hovered, setHovered] = useState(false);
  const s = sizes[size];
  const isRevoked = token.status === 'REVOKED';
  const badgeLabel = isRevoked ? 'REVOKED' : 'VERIFIED';
  const badgeClass = isRevoked ? 'bg-red-err/20 text-red-err border-red-err/40' : 'bg-teal/15 text-teal border-teal/40';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('group relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="credential-card relative overflow-hidden rounded-xl transition-all duration-200"
        style={{
          width: s.w,
          height: s.h,
          background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 50%, #1E1A14 100%)',
          border: '1px solid rgba(255,107,0,0.4)',
          boxShadow: hovered
            ? '0 0 60px rgba(255,107,0,0.15), 0 20px 60px rgba(0,0,0,0.6)'
            : '0 0 40px rgba(255,107,0,0.08), 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-6xl font-extrabold opacity-[0.03]"
          aria-hidden
        >
          NSQF
        </span>

        {hovered && (
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255,107,0,0.2) 50%, rgba(0,191,165,0.2) 55%, transparent 60%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        )}

        <div className="relative flex h-full flex-col p-4">
          <div className="flex items-start justify-between">
            <span className="font-display text-sm font-bold text-saffron">KaarSetu</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                badgeClass
              )}
            >
              {badgeLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-1 gap-3">
            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-2 flex items-center gap-2">
                {worker.photoUrl ? (
                  <img
                    src={worker.photoUrl}
                    alt=""
                    className="rounded-full object-cover"
                    style={{ width: s.photo, height: s.photo }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full bg-surface-raised text-text-secondary"
                    style={{ width: s.photo, height: s.photo }}
                  >
                    {worker.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3
                className={cn('font-display font-bold uppercase leading-tight text-cream', s.name)}
              >
                {worker.name}
              </h3>
              <p className="mt-0.5 text-xs text-text-secondary">{token.trade}</p>
              <NsqfLevelBadge level={token.nsqfLevel} className="mt-1" />
            </div>
            <div className="flex shrink-0 items-end">
              <QrGenerator value={getVerifyUrl(token.tokenId)} size={s.qr} />
            </div>
          </div>

          <div className="mt-auto border-t border-border/50 pt-2 text-[10px] text-text-secondary">
            <p>Certified by: {assessor.itiName}</p>
            <p className="mt-0.5">
              Block: #{token.blockNumber.toLocaleString()} • {formatDate(token.mintedAt)}
            </p>
            <p>Token: #{token.tokenId}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
