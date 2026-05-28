'use client';

import { useState } from 'react';
import type { Trade } from '@/lib/trades';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  calculatePracticalScore,
  countTaskResults,
  isPassingScore,
  type ChecklistData,
  type TaskResultValue,
} from '@/lib/assessment-scoring';

interface AssessmentChecklistProps {
  trade: Trade;
  value: ChecklistData;
  onChange: (value: ChecklistData) => void;
}

import { useTranslation } from '@/lib/i18n/use-translation';

export function AssessmentChecklist({ trade, value, onChange }: AssessmentChecklistProps) {
  const { t } = useTranslation();
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const RESULT_OPTIONS: { value: TaskResultValue; label: string; variant: 'teal' | 'amber' | 'red' }[] = [
    { value: 'PASS', label: t('common.next') === 'आगे' ? 'पास' : 'Pass', variant: 'teal' },
    { value: 'PARTIAL', label: t('common.next') === 'आगे' ? 'आंशिक' : 'Partial', variant: 'amber' },
    { value: 'FAIL', label: t('common.next') === 'आगे' ? 'विफल' : 'Fail', variant: 'red' },
  ];

  const score = calculatePracticalScore(value, trade.checklist);
  const counts = countTaskResults(value);
  const marked = counts.pass + counts.partial + counts.fail;
  const total = trade.checklist.length;
  const passEligible = isPassingScore(score, trade);
  const requiredTasks = trade.checklist.filter((t) => t.isRequired);
  const requiredMarked = requiredTasks.filter((t) => value[t.id]?.result).length;

  const setResult = (taskId: string, result: TaskResultValue) => {
    onChange({
      ...value,
      [taskId]: { ...value[taskId], result, note: value[taskId]?.note ?? '' },
    });
  };

  const setNote = (taskId: string, note: string) => {
    onChange({
      ...value,
      [taskId]: { ...value[taskId], result: value[taskId]?.result ?? 'FAIL', note },
    });
  };

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative h-24 w-24">
          <svg className="-rotate-90" width="96" height="96" aria-hidden>
            <circle cx="48" cy="48" r="36" fill="none" stroke="#2A2A2A" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r="36"
              fill="none"
              stroke={passEligible ? '#00BFA5' : '#FF6B00'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center font-display text-xl font-bold',
              passEligible ? 'text-teal' : 'text-saffron'
            )}
          >
            {score}%
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {passEligible ? (
              <Badge variant="teal">Pass eligible — ≥ {trade.passingScore}%</Badge>
            ) : (
              <Badge variant="amber">Needs improvement — below {trade.passingScore}%</Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {marked}/{total} tasks marked • Required: {requiredMarked}/{requiredTasks.length}
          </p>
          <Progress value={score} max={100} className="mt-1" />
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-teal">Pass: {counts.pass}</span>
            <span className="text-amber">Partial: {counts.partial}</span>
            <span className="text-red-err">Fail: {counts.fail}</span>
          </div>
        </div>
      </div>

      <p className="rounded-lg border border-border bg-surface-raised p-3 text-sm text-text-secondary">
        {trade.moduleInstructions}
      </p>

      <ul className="space-y-3">
        {trade.checklist.map((item, index) => {
          const entry = value[item.id];
          const result = entry?.result ?? 'FAIL';
          
          const localizedLabel = t(`trades.${trade.id}.tasks.${item.id}.label`);
          const localizedDesc = t(`trades.${trade.id}.tasks.${item.id}.desc`);

          return (
            <li
              key={item.id}
              className={cn(
                'rounded-xl border border-border bg-surface-raised p-4 transition-all duration-200',
                result === 'PASS' && 'border-teal/30 bg-teal/5',
                result === 'PARTIAL' && 'border-amber/30 bg-amber/5',
                result === 'FAIL' && entry && 'border-red-err/20'
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">Task {index + 1}</span>
                    {item.isRequired && <Badge variant="red">Required</Badge>}
                  </div>
                  <p className="mt-1 font-medium text-cream">{localizedLabel}</p>
                  <p className="mt-1 text-sm text-text-secondary">{localizedDesc}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {RESULT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setResult(item.id, opt.value)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        result === opt.value
                          ? opt.variant === 'teal'
                            ? 'border-teal bg-teal/20 text-teal'
                            : opt.variant === 'amber'
                              ? 'border-amber bg-amber/20 text-amber'
                              : 'border-red-err bg-red-err/20 text-red-err'
                          : 'border-border text-text-secondary hover:border-border-bright'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-saffron hover:underline"
                onClick={() => setExpandedNotes(expandedNotes === item.id ? null : item.id)}
              >
                {expandedNotes === item.id ? 'Hide notes' : 'Task notes'}
              </button>
              {expandedNotes === item.id && (
                <textarea
                  className="mt-2 w-full rounded-lg border border-border bg-surface-card p-2 text-sm text-cream"
                  rows={2}
                  placeholder="Observations for this task..."
                  value={entry?.note ?? ''}
                  onChange={(e) => setNote(item.id, e.target.value)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
