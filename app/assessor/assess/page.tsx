import { TRADES } from '@/lib/trades';
import { WorkerSearch } from '@/components/worker-search';
import { PracticalModulesOverview } from '@/components/practical-modules-overview';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssessorAssessPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Practical Skill Assessment</h1>
        <p className="mt-1 max-w-2xl text-text-secondary">
          Conduct observed practical tests for Electrician, Plumber, or Painter modules. Search a
          worker, select a trade module, mark task results, upload evidence, and mint an SBT when
          score ≥ 70%.
        </p>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-cream">Available modules</h2>
        <PracticalModulesOverview />
        <p className="mt-3 text-xs text-text-muted">
          Select a module when starting an assessment for a worker below.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Find worker to assess</CardTitle>
        </CardHeader>
        <WorkerSearch />
        <p className="mt-4 text-center text-sm text-text-muted">
          Demo: search <strong className="text-cream">Anita Devi</strong> or{' '}
          <strong className="text-cream">9876540004</strong> for Painter ready to mint.
        </p>
      </Card>

      <div className="grid gap-3 text-sm text-text-secondary md:grid-cols-3">
        {TRADES.map((t) => (
          <div key={t.id} className="rounded-lg border border-border bg-surface-raised p-3">
            <span className="text-lg">{t.icon}</span>
            <p className="mt-1 font-medium text-cream">{t.testTitle}</p>
            <p className="text-xs">{t.checklist.length} tasks • {t.practicalDurationMinutes} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}
