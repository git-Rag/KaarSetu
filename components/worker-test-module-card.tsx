'use client';

import Link from 'next/link';
import type { Trade } from '@/lib/trades';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, ListChecks } from 'lucide-react';

interface WorkerTestModuleCardProps {
  trade: Trade;
  className?: string;
}

export function WorkerTestModuleCard({ trade, className }: WorkerTestModuleCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border border-border bg-surface-card p-6 transition-all duration-200 hover:border-saffron/30',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{trade.icon}</span>
        <span className="rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-xs text-teal">
          Pass ≥ {trade.passingScore}%
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-cream">{trade.testTitle}</h3>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> ~{trade.practicalDurationMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" /> {trade.checklist.length} tasks
        </span>
      </div>
      <ul className="mt-3 flex-1 space-y-1 text-xs text-text-muted">
        {trade.evidenceSuggestions.slice(0, 2).map((s) => (
          <li key={s}>• {s}</li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href={`/worker/tests/${trade.id}/attempt`} className="flex-1">
          <Button className="w-full">Start Attempt</Button>
        </Link>
        <Link href={`/worker/tests/${trade.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Requirements
          </Button>
        </Link>
      </div>
    </div>
  );
}
