'use client';

import type { Trade } from '@/lib/trades';
import type { WorkerChecklistData, TaskResultValue } from '@/lib/assessment-scoring';
import {
  calculateAssessorScoreFromWorkerChecklist,
  isPassingScore,
} from '@/lib/assessment-scoring';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const RESULT_OPTIONS: { value: TaskResultValue; label: string }[] = [
  { value: 'PASS', label: 'Pass' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'FAIL', label: 'Fail' },
];

interface AssessorReviewChecklistProps {
  trade: Trade;
  value: WorkerChecklistData;
  onChange: (value: WorkerChecklistData) => void;
}

export function AssessorReviewChecklist({ trade, value, onChange }: AssessorReviewChecklistProps) {
  const score = calculateAssessorScoreFromWorkerChecklist(value, trade.checklist);
  const passEligible = isPassingScore(score, trade);

  const setAssessorResult = (taskId: string, assessorResult: TaskResultValue) => {
    onChange({
      ...value,
      [taskId]: {
        ...value[taskId],
        assessorResult,
      },
    });
  };

  const setAssessorNote = (taskId: string, assessorNote: string) => {
    onChange({
      ...value,
      [taskId]: { ...value[taskId], assessorNote },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-2xl font-bold text-saffron">{score}%</span>
          {passEligible ? (
            <Badge variant="teal">Pass eligible — ≥ {trade.passingScore}%</Badge>
          ) : (
            <Badge variant="amber">Below passing threshold</Badge>
          )}
        </div>
        <Progress value={score} max={100} className="mt-2" />
        <p className="mt-2 text-xs text-text-muted">
          Score is calculated from your Pass/Partial/Fail marks only — not worker self-report.
        </p>
      </div>

      <ul className="space-y-4">
        {trade.checklist.map((item) => {
          const entry = value[item.id];
          const result = entry?.assessorResult;
          return (
            <li key={item.id} className="rounded-xl border border-border bg-surface-card p-4">
              <p className="font-medium text-cream">{item.label}</p>
              <div className="mt-2 rounded-lg bg-surface-raised p-3 text-sm">
                <p className="text-text-muted">Worker self-report</p>
                <p className="text-cream">
                  {entry?.workerStatus?.replace(/_/g, ' ') ?? '—'}
                  {entry?.workerNote ? ` — "${entry.workerNote}"` : ''}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {RESULT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAssessorResult(item.id, opt.value)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      result === opt.value
                        ? opt.value === 'PASS'
                          ? 'border-teal bg-teal/20 text-teal'
                          : opt.value === 'PARTIAL'
                            ? 'border-amber bg-amber/20 text-amber'
                            : 'border-red-err bg-red-err/20 text-red-err'
                        : 'border-border text-text-secondary'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <textarea
                className="mt-2 w-full rounded-lg border border-border bg-surface-raised p-2 text-sm text-cream"
                rows={2}
                placeholder="Assessor feedback for this task..."
                value={entry?.assessorNote ?? ''}
                onChange={(e) => setAssessorNote(item.id, e.target.value)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
