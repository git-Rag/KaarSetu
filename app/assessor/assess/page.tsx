import { WorkerSearch } from '@/components/worker-search';

export default function AssessorAssessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">Assess a Worker</h1>
        <p className="mt-1 text-text-secondary">
          Search by phone number or name to start an NSQF skill assessment.
        </p>
      </div>
      <WorkerSearch />
    </div>
  );
}
