'use client';

import { useTranslation } from '@/lib/i18n/i18n-context';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useTranslation();

  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-border bg-surface-card p-1', className)}>
      <Languages className="mx-2 h-4 w-4 text-text-muted" />
      {SUPPORTED_LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-all duration-200',
            lang === l.code
              ? 'bg-saffron text-white shadow-sm'
              : 'text-text-secondary hover:bg-surface-hover hover:text-cream'
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
