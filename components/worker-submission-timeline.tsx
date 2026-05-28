import { formatDate, formatDateTime } from '@/lib/utils';
import type { WorkerSubmissionLabel } from '@/lib/submission-status';
import { submissionBadgeVariant } from '@/lib/submission-status';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  label: string;
  date?: Date | string | null;
  description?: string;
}

export function WorkerSubmissionTimeline({
  events,
  statusLabel,
}: {
  events: TimelineEvent[];
  statusLabel: WorkerSubmissionLabel;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display font-bold text-cream">Submission timeline</h3>
        <Badge variant={submissionBadgeVariant(statusLabel)}>{statusLabel}</Badge>
      </div>
      <ol className="relative space-y-4 border-l border-border pl-6">
        {events.map((event, i) => (
          <li key={i} className="relative">
            <span
              className={cn(
                'absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full border-2 border-surface-base',
                i === 0 ? 'bg-saffron' : 'bg-border-bright'
              )}
            />
            <p className="font-medium text-cream">{event.label}</p>
            {event.date && (
              <p className="text-xs text-text-muted">{formatDateTime(event.date)}</p>
            )}
            {event.description && (
              <p className="mt-1 text-sm text-text-secondary">{event.description}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
