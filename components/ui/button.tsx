'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:
    'bg-saffron text-text-inverse hover:bg-saffron-dim border border-saffron/50',
  secondary: 'bg-surface-raised text-cream border border-border hover:bg-surface-hover',
  outline:
    'bg-transparent text-teal border border-teal/60 hover:bg-teal/10 hover:border-teal',
  ghost: 'bg-transparent text-cream border border-transparent hover:bg-surface-hover',
  danger: 'bg-red-err/20 text-red-err border border-red-err/40 hover:bg-red-err/30',
  teal: 'bg-teal text-text-inverse hover:bg-teal-dim border border-teal/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium font-body transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
