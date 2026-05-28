'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MINT_STATUS_LABELS, type MintChainStatus } from '@/lib/mock-chain';
import { cn } from '@/lib/utils';

interface BlockchainLoaderProps {
  open: boolean;
  status: MintChainStatus;
  mempoolPosition?: number;
  onComplete?: () => void;
}

export function BlockchainLoader({
  open,
  status,
  mempoolPosition = 47,
  onComplete,
}: BlockchainLoaderProps) {
  const [mempool, setMempool] = useState(mempoolPosition);
  const steps: MintChainStatus[] = [
    'broadcasting',
    'in_mempool',
    'mining',
    'confirming',
    'confirmed',
  ];
  const currentStep = steps.indexOf(status);

  useEffect(() => {
    if (status === 'in_mempool' && mempool > 1) {
      const t = setInterval(() => setMempool((p) => Math.max(1, p - 3)), 400);
      return () => clearInterval(t);
    }
  }, [status, mempool]);

  useEffect(() => {
    if (status === 'confirmed' && onComplete) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [status, onComplete]);

  if (!open) return null;

  const isComplete = status === 'confirmed';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="mx-4 max-w-md text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-6 font-display text-2xl font-bold text-saffron"
        >
          KaarSetu
        </motion.div>

        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: i <= currentStep ? 1 : 0.5,
                opacity: i <= currentStep ? 1 : 0.3,
              }}
              className={cn(
                'h-3 w-3 rounded-full',
                i <= currentStep ? (isComplete ? 'bg-teal' : 'bg-saffron') : 'bg-border'
              )}
            />
          ))}
        </div>

        <svg viewBox="0 0 200 40" className="mx-auto mb-6 h-10 w-48">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <motion.circle
                cx={20 + i * 40}
                cy={20}
                r={8}
                fill={i <= currentStep ? '#FF6B00' : '#2A2A2A'}
                initial={{ scale: 0 }}
                animate={{ scale: i <= currentStep ? 1 : 0.5 }}
                transition={{ delay: i * 0.15 }}
              />
              {i < 4 && (
                <motion.line
                  x1={28 + i * 40}
                  y1={20}
                  x2={52 + i * 40}
                  y2={20}
                  stroke={i < currentStep ? '#FF6B00' : '#2A2A2A'}
                  strokeWidth={2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: i < currentStep ? 1 : 0 }}
                />
              )}
            </g>
          ))}
        </svg>

        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 text-sm text-cream"
          >
            {MINT_STATUS_LABELS[status]}
          </motion.p>
        </AnimatePresence>

        {status === 'in_mempool' && (
          <p className="text-xs text-text-secondary">
            Position in mempool: #{mempool}
          </p>
        )}

        <p className="mt-2 text-xs text-text-muted">Gas: 0.000023 MATIC</p>

        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/20 text-teal">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
