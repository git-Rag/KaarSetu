'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-surface-card p-8 text-center">
            <h2 className="font-display text-xl font-bold text-cream">Something went wrong</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Please refresh the page or try again later.
            </p>
            <Button className="mt-4" onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
