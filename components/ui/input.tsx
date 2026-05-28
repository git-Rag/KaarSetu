'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-cream">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-cream placeholder:text-text-muted transition-all duration-200 focus:border-saffron/50 focus:outline-none focus:ring-1 focus:ring-saffron/30',
          error && 'border-red-err/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-err">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
