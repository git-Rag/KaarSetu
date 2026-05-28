import type { AssessmentStatus, AssessmentInitiator } from '@prisma/client';

export type WorkerSubmissionLabel =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Passed'
  | 'Failed'
  | 'Minted';

export function getWorkerSubmissionLabel(
  status: AssessmentStatus,
  initiatedBy: AssessmentInitiator,
  submittedAt: Date | null | undefined
): WorkerSubmissionLabel {
  if (status === 'MINTED') return 'Minted';
  if (status === 'PASSED') return 'Passed';
  if (status === 'FAILED') return 'Failed';
  if (initiatedBy === 'WORKER' && !submittedAt) return 'Draft';
  if (initiatedBy === 'WORKER' && submittedAt && status === 'PENDING') return 'Submitted';
  return 'Under Review';
}

export function submissionBadgeVariant(
  label: WorkerSubmissionLabel
): 'teal' | 'amber' | 'red' | 'default' | 'saffron' {
  switch (label) {
    case 'Passed':
    case 'Minted':
      return 'teal';
    case 'Submitted':
    case 'Under Review':
      return 'amber';
    case 'Failed':
      return 'red';
    case 'Draft':
      return 'saffron';
    default:
      return 'default';
  }
}
