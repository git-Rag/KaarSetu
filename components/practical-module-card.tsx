'use client';

import { cn } from '@/lib/utils';
import type { Trade } from '@/lib/trades';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface PracticalModuleCardProps {
  trade: Trade;
  selected?: boolean;
  onSelect?: () => void;
  displayOnly?: boolean;
}

import { useTranslation } from '@/lib/i18n/use-translation';

export function PracticalModuleCard({
  trade,
  selected,
  onSelect,
  displayOnly,
}: PracticalModuleCardProps) {
  const { t } = useTranslation();
  
  const tradeName = t(`trades.${trade.id}.name`);
  const testTitle = t(`trades.${trade.id}.testTitle`);

  const className = cn(
    'w-full rounded-xl border bg-surface-card p-6 text-left transition-all duration-200',
    selected
      ? 'border-saffron/60 bg-saffron/5 shadow-[0_0_40px_rgba(255,107,0,0.08)]'
      : 'border-border',
    !displayOnly && 'hover:border-saffron/30 hover:bg-surface-hover cursor-pointer'
  );

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl">{trade.icon}</span>
        {selected && <Badge variant="saffron">{t('common.active')}</Badge>}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-cream">{tradeName}</h3>
      <p className="mt-1 text-sm text-text-secondary">{testTitle}</p>
      <p className="mt-2 line-clamp-2 text-xs text-text-muted">{trade.sector}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> ~{trade.practicalDurationMinutes} min
        </span>
        <span>•</span>
        <span>{trade.checklist.length} practical tasks</span>
        <span>•</span>
        <span className="text-teal">{t('common.next') === 'आगे' ? 'पास' : 'Pass'} ≥ {trade.passingScore}%</span>
      </div>
    </>
  );

  if (displayOnly) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <button type="button" onClick={onSelect} className={className}>
      {inner}
    </button>
  );
}
