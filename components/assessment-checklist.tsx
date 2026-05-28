'use client';

import { useState } from 'react';
import type { Trade } from '@/lib/trades';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn, calculateChecklistScore } from '@/lib/utils';

interface AssessmentChecklistProps {
  trade: Trade;
  value: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
}

export function AssessmentChecklist({ trade, value, onChange }: AssessmentChecklistProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const completed = Object.values(value).filter(Boolean).length;
  const total = trade.checklist.length;
  const score = calculateChecklistScore(value, trade.checklist);
  const requiredTotal = trade.checklist.filter((c) => c.isRequired).length;
  const requiredDone = trade.checklist.filter((c) => c.isRequired && value[c.id]).length;

  const toggle = (id: string) => {
    onChange({ ...value, [id]: !value[id] });
  };

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative h-24 w-24">
          <svg className="-rotate-90" width="96" height="96">
            <circle cx="48" cy="48" r="36" fill="none" stroke="#2A2A2A" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r="36"
              fill="none"
              stroke="#FF6B00"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-saffron">
            {score}%
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-text-secondary">
            {completed}/{total} items completed
          </p>
          <Progress value={completed} max={total} className="mt-2" />
          <p className="mt-2 text-xs text-text-muted">
            Required: {requiredDone}/{requiredTotal} (weighted 2× in score)
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {trade.checklist.map((item) => (
          <li
            key={item.id}
            className={cn(
              'rounded-xl border border-border bg-surface-raised p-4 transition-all duration-200 hover:border-border-bright',
              value[item.id] && 'border-teal/30 bg-teal/5'
            )}
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-all duration-200',
                  value[item.id]
                    ? 'border-teal bg-teal text-text-inverse'
                    : 'border-border-bright hover:border-teal/50'
                )}
              >
                {value[item.id] && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-cream">{item.label}</span>
                  {item.isRequired && <Badge variant="red">Required</Badge>}
                </div>
                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                <button
                  type="button"
                  className="mt-2 text-xs text-saffron hover:underline"
                  onClick={() =>
                    setExpandedNotes(expandedNotes === item.id ? null : item.id)
                  }
                >
                  {expandedNotes === item.id ? 'Hide notes' : 'Add notes'}
                </button>
                {expandedNotes === item.id && (
                  <textarea
                    className="mt-2 w-full rounded-lg border border-border bg-surface-card p-2 text-sm text-cream"
                    rows={2}
                    placeholder="Assessment notes for this item..."
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
