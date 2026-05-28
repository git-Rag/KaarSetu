import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-surface-raised text-cream border-border',
  saffron: 'bg-saffron/15 text-saffron border-saffron/40',
  teal: 'bg-teal/15 text-teal border-teal/40',
  amber: 'bg-amber/15 text-amber border-amber/40',
  red: 'bg-red-err/15 text-red-err border-red-err/40',
  indigo: 'bg-indigo/15 text-indigo border-indigo/40',
};

export function Badge({
  variant = 'default',
  className,
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
