import { TRADE_MAP } from '@/lib/trades';
import { cn } from '@/lib/utils';

export function TradeBadge({ trade, className }: { trade: string; className?: string }) {
  const tradeData = TRADE_MAP[trade] ?? Object.values(TRADE_MAP).find((t) => t.name === trade);
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm text-cream', className)}>
      {tradeData?.icon && <span>{tradeData.icon}</span>}
      {tradeData?.name ?? trade}
    </span>
  );
}
