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

export default function WorkerTestDetailPage({
  params,
}: {
  params: { tradeId: string };
}) {
  const trade = getTradeById(params.tradeId);
  if (!trade) notFound();

  return (
    <div className="space-y-8">
      <Link href="/worker/tests">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Back to Skill Tests
        </Button>
      </Link>

      <div>
        <span className="text-4xl">{trade.icon}</span>
        <h1 className="mt-2 font-display text-2xl font-bold text-cream">{trade.testTitle}</h1>
        <p className="mt-1 text-text-secondary">{trade.sector}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="default">~{trade.practicalDurationMinutes} minutes</Badge>
          <Badge variant="teal">Pass ≥ {trade.passingScore}%</Badge>
          <Badge variant="default">{trade.checklist.length} practical tasks</Badge>
        </div>
      </div>

      <Card className="border-amber/30 bg-amber/5">
        <p className="flex gap-2 text-sm text-cream">
          <Shield className="h-5 w-5 shrink-0 text-amber" />
          This attempt must be reviewed by an approved assessor before any credential is issued.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Practical tasks</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {trade.checklist.map((task, i) => (
              <li
                key={task.id}
                className="rounded-lg border border-border bg-surface-raised p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Task {i + 1}</span>
                  {task.isRequired && <Badge variant="red">Required</Badge>}
                </div>
                <p className="mt-1 font-medium text-cream">{task.label}</p>
                <p className="mt-1 text-sm text-text-secondary">{task.description}</p>
              </li>
            ))}
          </ul>
        </Card>
        <EvidenceSuggestionsPanel suggestions={trade.evidenceSuggestions} />
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
          Your attempt is evidence for review. Only an approved assessor can verify it and issue
          a credential.
        </p>
        <Link href={`/worker/tests/${trade.id}/attempt`} className="mt-6 inline-block">
          <Button size="lg">Start Practical Attempt</Button>
        </Link>
      </Card>
    </div>
  );
}
