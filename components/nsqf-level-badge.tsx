import { cn, nsqfLevelToNumber } from '@/lib/utils';

export function NsqfLevelBadge({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  const n = nsqfLevelToNumber(level);
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
        NSQF
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              i <= n ? 'bg-saffron' : 'bg-border-bright'
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-cream">Level {n}</span>
    </div>
  );
}
