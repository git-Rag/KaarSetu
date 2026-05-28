import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-card p-12 text-center">
      <div className="mb-4 text-text-muted">{icon}</div>
      <h3 className="font-display text-lg font-bold text-cream">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a href={action.href}>
              <Button>{action.label}</Button>
            </a>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkerEmptyCredentialsIcon() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden>
      <rect x="20" y="15" width="80" height="50" rx="6" stroke="#2A2A2A" strokeWidth="2" fill="#141414" />
      <circle cx="40" cy="35" r="8" stroke="#5C5750" strokeWidth="1.5" fill="#1C1C1C" />
      <rect x="55" y="28" width="35" height="4" rx="2" fill="#2A2A2A" />
      <rect x="55" y="36" width="25" height="3" rx="1.5" fill="#2A2A2A" />
      <path d="M45 75 L60 55 L75 75" stroke="#FF6B00" strokeWidth="2" fill="none" opacity="0.5" />
      <circle cx="60" cy="78" r="3" fill="#FF6B00" opacity="0.3" />
    </svg>
  );
}
