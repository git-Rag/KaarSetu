'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { formatDate, truncateHash } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface AttestationCardProps {
  employerName: string;
  projectName: string;
  rating: number;
  durationMonths: number;
  attestedAt: Date | string;
  txHash: string;
  index?: number;
}

export function AttestationCard({
  employerName,
  projectName,
  rating,
  durationMonths,
  attestedAt,
  txHash,
  index = 0,
}: AttestationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring' }}
      className="min-w-[280px] shrink-0"
    >
      <Card className="h-full hover:border-teal/30">
        <p className="text-xs text-text-muted">{formatDate(attestedAt)}</p>
        <h4 className="mt-1 font-display font-bold text-cream">{projectName}</h4>
        <p className="text-sm text-text-secondary">{employerName}</p>
        <div className="mt-2 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i <= rating ? 'fill-amber text-amber' : 'text-border'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-text-muted">{durationMonths} months • {truncateHash(txHash)}</p>
      </Card>
    </motion.div>
  );
}
