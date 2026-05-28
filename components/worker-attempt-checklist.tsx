'use client';

import type { Trade } from '@/lib/trades';
import type { WorkerChecklistData, WorkerTaskStatus } from '@/lib/assessment-scoring';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: { value: WorkerTaskStatus; label: string }[] = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NEEDS_PRACTICE', label: 'Needs Practice' },
  { value: 'NOT_ATTEMPTED', label: 'Not Attempted' },
];

interface WorkerAttemptChecklistProps {
  trade: Trade;
  value: WorkerChecklistData;
  onChange: (value: WorkerChecklistData) => void;
  readOnly?: boolean;
}

export function WorkerAttemptChecklist({
  trade,
  value,
  onChange,
  readOnly,
}: WorkerAttemptChecklistProps) {
  const setStatus = (taskId: string, workerStatus: WorkerTaskStatus) => {
    onChange({
      ...value,
      [taskId]: {
        ...value[taskId],
        workerStatus,
        workerNote: value[taskId]?.workerNote ?? '',
        assessorResult: null,
        assessorNote: value[taskId]?.assessorNote ?? '',
      },
    });
  };

  const setNote = (taskId: string, workerNote: string) => {
    onChange({
      ...value,
      [taskId]: { ...value[taskId], workerNote },
    });
  };

  return (
    <ul className="space-y-3">
      {trade.checklist.map((item, index) => {
        const entry = value[item.id];
        const status = entry?.workerStatus ?? 'NOT_ATTEMPTED';
        return (
          <li
            key={item.id}
            className={cn(
              'rounded-xl border border-border bg-surface-raised p-4',
              status === 'COMPLETED' && 'border-teal/30 bg-teal/5',
              status === 'NEEDS_PRACTICE' && 'border-amber/30 bg-amber/5'
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted">Task {index + 1}</span>
              {item.isRequired && <Badge variant="red">Required</Badge>}
            </div>
            <p className="mt-1 font-medium text-cream">{item.label}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
            {!readOnly && (
              <>
                <div className="mt-3 flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(item.id, opt.value)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-xs transition-all duration-200',
                        status === opt.value
                          ? opt.value === 'COMPLETED'
                            ? 'border-teal bg-teal/20 text-teal'
                            : opt.value === 'NEEDS_PRACTICE'
                              ? 'border-amber bg-amber/20 text-amber'
                              : 'border-border-bright text-cream'
                          : 'border-border text-text-secondary hover:border-border-bright'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="mt-2 w-full rounded-lg border border-border bg-surface-card p-2 text-sm text-cream"
                  rows={2}
                  placeholder="Your notes on this task..."
                  value={entry?.workerNote ?? ''}
                  onChange={(e) => setNote(item.id, e.target.value)}
                />
              </>
            )}
            {readOnly && entry && (
              <p className="mt-2 text-sm text-text-secondary">
                Self-report: <span className="text-cream">{status.replace(/_/g, ' ')}</span>
                {entry.workerNote && ` — ${entry.workerNote}`}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
