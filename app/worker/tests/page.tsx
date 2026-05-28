import Link from 'next/link';
import { TRADES } from '@/lib/trades';
import { WorkerTestModuleCard } from '@/components/worker-test-module-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

import { getServerTranslation } from '@/lib/i18n/server';

export default function WorkerTestsPage() {
  const { t } = getServerTranslation();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">{t('worker.tests.title')}</h1>
        <p className="mt-1 max-w-2xl text-text-secondary">
          {t('worker.tests.subtitle')}
        </p>
      </div>

      <Card className="flex gap-3 border-saffron/30 bg-saffron/5">
        <Shield className="h-5 w-5 shrink-0 text-saffron" />
        <p className="text-sm text-cream">
          {t('worker.tests.voice.trustDisclaimer')}
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {TRADES.map((trade) => (
          <WorkerTestModuleCard key={trade.id} trade={trade} />
        ))}
      </div>

      <div className="flex justify-center">
        <Link href="/worker/tests/submissions">
          <Button variant="outline">{t('nav.history')}</Button>
        </Link>
      </div>
    </div>
  );
}
