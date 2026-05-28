import Link from 'next/link';
import { TRADES } from '@/lib/trades';
import { WorkerTestModuleCard } from '@/components/worker-test-module-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function WorkerTestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Skill Tests</h1>
        <p className="mt-1 max-w-2xl text-text-secondary">
          Complete a practical self-attempt, upload evidence, and submit for review by an
          approved ITI assessor. You cannot issue your own credential.
        </p>
      </div>

      <Card className="flex gap-3 border-saffron/30 bg-saffron/5">
        <Shield className="h-5 w-5 shrink-0 text-saffron" />
        <p className="text-sm text-cream">
          Your attempt is evidence for review. Only an approved assessor can verify it and
          issue a credential.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {TRADES.map((trade) => (
          <WorkerTestModuleCard key={trade.id} trade={trade} />
        ))}
      </div>

      <div className="flex justify-center">
        <Link href="/worker/tests/submissions">
          <Button variant="outline">View my submissions</Button>
        </Link>
      </div>
    </div>
  );
}
