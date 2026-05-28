'use client';

import { TRADES } from '@/lib/trades';
import { PracticalModuleCard } from '@/components/practical-module-card';

/** Read-only module grid for the assess landing page. */
export function PracticalModulesOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TRADES.map((trade) => (
        <PracticalModuleCard
          key={trade.id}
          trade={trade}
          displayOnly
        />
      ))}
    </div>
  );
}
