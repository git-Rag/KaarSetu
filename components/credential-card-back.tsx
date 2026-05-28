'use client';

import { motion } from 'framer-motion';
import { QrGenerator } from '@/components/qr-generator';
import { cn, getVerifyUrl } from '@/lib/utils';

export function CredentialCardBack({
  tokenId,
  className,
}: {
  tokenId: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card p-8',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 50%, #1E1A14 100%)',
        border: '1px solid rgba(255,107,0,0.4)',
      }}
    >
      <p className="mb-4 font-display text-sm font-bold text-saffron">Scan to Verify</p>
      <QrGenerator value={getVerifyUrl(tokenId)} size={180} />
      <p className="mt-4 text-center text-xs text-text-secondary">
        Non-transferable Soulbound Token (ERC-5192)
      </p>
    </motion.div>
  );
}
