import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTradeById, TRADES } from '@/lib/trades';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EvidenceSuggestionsPanel } from '@/components/evidence-suggestions-panel';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield } from 'lucide-react';

export function generateStaticParams() {
  return TRADES.map((t) => ({ tradeId: t.id }));
}

import { getServerTranslation } from '@/lib/i18n/server';

export default function WorkerTestDetailPage({
  params,
}: {
  params: { tradeId: string };
}) {
  const { t } = getServerTranslation();
  const trade = getTradeById(params.tradeId);
  if (!trade) notFound();

  const testTitle = t(`trades.${trade.id}.testTitle`);

  return (
    <div className="space-y-8">
      <Link href="/worker/tests">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Button>
      </Link>

      <div>
        <span className="text-4xl">{trade.icon}</span>
        <h1 className="mt-2 font-display text-2xl font-bold text-cream">{testTitle}</h1>
        <p className="mt-1 text-text-secondary">{trade.sector}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="default">~{trade.practicalDurationMinutes} minutes</Badge>
          <Badge variant="teal">{t('common.next') === 'आगे' ? 'पास' : 'Pass'} ≥ {trade.passingScore}%</Badge>
          <Badge variant="default">{trade.checklist.length} practical tasks</Badge>
        </div>
      </div>

      <Card className="border-amber/30 bg-amber/5">
        <p className="flex gap-2 text-sm text-cream">
          <Shield className="h-5 w-5 shrink-0 text-amber" />
          {t('worker.tests.voice.trustDisclaimer')}
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Practical tasks</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {trade.checklist.map((task, i) => {
              const localizedLabel = t(`trades.${trade.id}.tasks.${task.id}.label`);
              const localizedDesc = t(`trades.${trade.id}.tasks.${task.id}.desc`);
              
              return (
                <li
                  key={task.id}
                  className="rounded-lg border border-border bg-surface-raised p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Task {i + 1}</span>
                    {task.isRequired && <Badge variant="red">Required</Badge>}
                  </div>
                  <p className="mt-1 font-medium text-cream">{localizedLabel}</p>
                  <p className="mt-1 text-sm text-text-secondary">{localizedDesc}</p>
                </li>
              );
            })}
          </ul>
        </Card>
        <EvidenceSuggestionsPanel suggestions={t(`trades.${trade.id}.evidence`) as any || trade.evidenceSuggestions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How scoring works</CardTitle>
        </CardHeader>
        <ul className="list-inside list-disc space-y-2 text-sm text-text-secondary">
          <li>You mark tasks as Completed, Needs Practice, or Not Attempted — this is self-report only.</li>
          <li>An assessor observes your evidence and marks each task Pass, Partial, or Fail.</li>
          <li>Required tasks count double. Partial earns half credit.</li>
          <li>You need {trade.passingScore}% or higher from the assessor to pass and receive an SBT.</li>
        </ul>
        <p className="mt-4 text-sm text-text-muted">
          {t('worker.tests.voice.trustDisclaimer')}
        </p>
        <Link href={`/worker/tests/${trade.id}/attempt`} className="mt-6 inline-block">
          <Button size="lg">{t('worker.tests.startAttempt')}</Button>
        </Link>
      </Card>
    </div>
  );
}
