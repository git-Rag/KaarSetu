import type { Trade, TradeChecklist } from '@/lib/trades';
import { TRADE_MAP, getTradeByName } from '@/lib/trades';

export type TaskResultValue = 'PASS' | 'PARTIAL' | 'FAIL';
export type WorkerTaskStatus = 'COMPLETED' | 'NEEDS_PRACTICE' | 'NOT_ATTEMPTED';

/** Assessor-led practical checklist (direct assessment). */
export interface TaskAssessment {
  result: TaskResultValue;
  note?: string;
}

export type ChecklistData = Record<string, TaskAssessment>;

/** Worker self-attempt + assessor review on same record. */
export interface WorkerTaskEntry {
  workerStatus: WorkerTaskStatus;
  workerNote: string;
  assessorResult: TaskResultValue | null;
  assessorNote: string;
}

export type WorkerChecklistData = Record<string, WorkerTaskEntry>;

export function isWorkerChecklistFormat(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const first = Object.values(raw as Record<string, unknown>)[0];
  return (
    !!first &&
    typeof first === 'object' &&
    'workerStatus' in (first as object)
  );
}

export function createEmptyChecklist(trade: Trade): ChecklistData {
  const data: ChecklistData = {};
  for (const task of trade.checklist) {
    data[task.id] = { result: 'FAIL', note: '' };
  }
  return data;
}

export function createEmptyWorkerChecklist(trade: Trade): WorkerChecklistData {
  const data: WorkerChecklistData = {};
  for (const task of trade.checklist) {
    data[task.id] = {
      workerStatus: 'NOT_ATTEMPTED',
      workerNote: '',
      assessorResult: null,
      assessorNote: '',
    };
  }
  return data;
}

/** Normalize legacy boolean or assessor-only JSON. */
export function normalizeChecklistData(
  raw: unknown,
  trade: Trade
): ChecklistData {
  if (isWorkerChecklistFormat(raw)) {
    return workerChecklistToAssessorFormat(normalizeWorkerChecklistData(raw, trade), trade);
  }

  if (!raw || typeof raw !== 'object') {
    return createEmptyChecklist(trade);
  }

  const obj = raw as Record<string, unknown>;
  const first = Object.values(obj)[0];

  if (typeof first === 'boolean') {
    const data: ChecklistData = {};
    for (const task of trade.checklist) {
      const legacy = obj[task.id];
      data[task.id] = {
        result: legacy === true ? 'PASS' : 'FAIL',
        note: '',
      };
    }
    return data;
  }

  const data: ChecklistData = {};
  for (const task of trade.checklist) {
    const entry = obj[task.id];
    if (entry && typeof entry === 'object' && 'result' in entry) {
      const e = entry as TaskAssessment;
      const result = e.result;
      if (result === 'PASS' || result === 'PARTIAL' || result === 'FAIL') {
        data[task.id] = { result, note: e.note ?? '' };
      } else {
        data[task.id] = { result: 'FAIL', note: '' };
      }
    } else {
      data[task.id] = { result: 'FAIL', note: '' };
    }
  }
  return data;
}

export function normalizeWorkerChecklistData(
  raw: unknown,
  trade: Trade
): WorkerChecklistData {
  if (!raw || typeof raw !== 'object') {
    return createEmptyWorkerChecklist(trade);
  }

  const obj = raw as Record<string, unknown>;

  if (!isWorkerChecklistFormat(raw)) {
    const assessor = normalizeChecklistData(raw, trade);
    const data = createEmptyWorkerChecklist(trade);
    for (const task of trade.checklist) {
      const a = assessor[task.id];
      if (a) {
        data[task.id] = {
          workerStatus: 'COMPLETED',
          workerNote: '',
          assessorResult: a.result,
          assessorNote: a.note ?? '',
        };
      }
    }
    return data;
  }

  const validWorker: WorkerTaskStatus[] = ['COMPLETED', 'NEEDS_PRACTICE', 'NOT_ATTEMPTED'];
  const validAssessor: (TaskResultValue | null)[] = ['PASS', 'PARTIAL', 'FAIL', null];
  const data: WorkerChecklistData = {};

  for (const task of trade.checklist) {
    const entry = obj[task.id];
    if (entry && typeof entry === 'object') {
      const e = entry as Partial<WorkerTaskEntry>;
      const ws = e.workerStatus;
      const ar = e.assessorResult ?? null;
      data[task.id] = {
        workerStatus: validWorker.includes(ws as WorkerTaskStatus)
          ? (ws as WorkerTaskStatus)
          : 'NOT_ATTEMPTED',
        workerNote: e.workerNote ?? '',
        assessorResult: validAssessor.includes(ar as TaskResultValue | null)
          ? (ar as TaskResultValue | null)
          : null,
        assessorNote: e.assessorNote ?? '',
      };
    } else {
      data[task.id] = {
        workerStatus: 'NOT_ATTEMPTED',
        workerNote: '',
        assessorResult: null,
        assessorNote: '',
      };
    }
  }
  return data;
}

export function workerChecklistToAssessorFormat(
  workerData: WorkerChecklistData,
  trade: Trade
): ChecklistData {
  const data: ChecklistData = {};
  for (const task of trade.checklist) {
    const entry = workerData[task.id];
    const result = entry?.assessorResult ?? 'FAIL';
    data[task.id] = { result, note: entry?.assessorNote ?? '' };
  }
  return data;
}

/** Score from assessor marks only — never workerStatus. */
export function calculatePracticalScore(
  checklistData: ChecklistData | WorkerChecklistData,
  tasks: TradeChecklist[],
  options?: { workerFormat?: boolean }
): number {
  const workerFormat =
    options?.workerFormat ?? isWorkerChecklistFormat(checklistData);

  let totalWeight = 0;
  let earned = 0;

  for (const task of tasks) {
    const weight = task.isRequired ? 2 : 1;
    totalWeight += weight;

    if (workerFormat) {
      const entry = (checklistData as WorkerChecklistData)[task.id];
      const result = entry?.assessorResult;
      if (!result) continue;
      if (result === 'PASS') earned += weight;
      else if (result === 'PARTIAL') earned += weight * 0.5;
    } else {
      const entry = (checklistData as ChecklistData)[task.id];
      if (!entry) continue;
      if (entry.result === 'PASS') earned += weight;
      else if (entry.result === 'PARTIAL') earned += weight * 0.5;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((earned / totalWeight) * 100);
}

export function calculateAssessorScoreFromWorkerChecklist(
  workerData: WorkerChecklistData,
  tasks: TradeChecklist[]
): number {
  return calculatePracticalScore(workerData, tasks, { workerFormat: true });
}

export function countTaskResults(checklistData: ChecklistData) {
  let pass = 0;
  let partial = 0;
  let fail = 0;
  for (const entry of Object.values(checklistData)) {
    if (entry.result === 'PASS') pass++;
    else if (entry.result === 'PARTIAL') partial++;
    else fail++;
  }
  return { pass, partial, fail };
}

export function validateChecklistData(
  checklistData: ChecklistData,
  trade: Trade,
  options: { requireAllTasks?: boolean; requireRequiredMarked?: boolean } = {}
): { valid: boolean; error?: string } {
  const { requireAllTasks = false, requireRequiredMarked = false } = options;
  const validResults: TaskResultValue[] = ['PASS', 'PARTIAL', 'FAIL'];

  for (const key of Object.keys(checklistData)) {
    if (!trade.checklist.some((t) => t.id === key)) {
      return { valid: false, error: `Invalid task ID: ${key}` };
    }
    const entry = checklistData[key];
    if (!entry || !validResults.includes(entry.result)) {
      return { valid: false, error: `Invalid result for task ${key}` };
    }
  }

  if (requireAllTasks) {
    for (const task of trade.checklist) {
      if (!checklistData[task.id]) {
        return { valid: false, error: `Missing assessment for task: ${task.label}` };
      }
    }
  }

  if (requireRequiredMarked) {
    for (const task of trade.checklist.filter((t) => t.isRequired)) {
      if (!checklistData[task.id]) {
        return { valid: false, error: `Required task not assessed: ${task.label}` };
      }
    }
  }

  return { valid: true };
}

const workerStatusSchema = ['COMPLETED', 'NEEDS_PRACTICE', 'NOT_ATTEMPTED'] as const;

export function validateWorkerChecklistData(
  checklistData: WorkerChecklistData,
  trade: Trade,
  options: { requireAllTasks?: boolean } = {}
): { valid: boolean; error?: string } {
  for (const key of Object.keys(checklistData)) {
    if (!trade.checklist.some((t) => t.id === key)) {
      return { valid: false, error: `Invalid task ID: ${key}` };
    }
    const entry = checklistData[key];
    if (!workerStatusSchema.includes(entry.workerStatus)) {
      return { valid: false, error: `Invalid worker status for ${key}` };
    }
    if (
      entry.assessorResult !== null &&
      !['PASS', 'PARTIAL', 'FAIL'].includes(entry.assessorResult)
    ) {
      return { valid: false, error: `Invalid assessor result for ${key}` };
    }
  }

  if (options.requireAllTasks) {
    for (const task of trade.checklist) {
      if (!checklistData[task.id]) {
        return { valid: false, error: `Missing task: ${task.label}` };
      }
    }
  }

  return { valid: true };
}

export function validateWorkerReviewChecklist(
  checklistData: WorkerChecklistData,
  trade: Trade
): { valid: boolean; error?: string } {
  for (const task of trade.checklist) {
    const entry = checklistData[task.id];
    if (!entry?.assessorResult) {
      return { valid: false, error: `Assessor must score: ${task.label}` };
    }
  }
  return validateWorkerChecklistData(checklistData, trade, { requireAllTasks: true });
}

export function isPassingScore(score: number, trade: Trade): boolean {
  return score >= trade.passingScore;
}

export function resolveTradeForAssessment(tradeKeyOrName: string): Trade | undefined {
  return TRADE_MAP[tradeKeyOrName] ?? getTradeByName(tradeKeyOrName);
}

export function buildSeedChecklist(
  trade: Trade,
  marks: Record<string, TaskResultValue>
): ChecklistData {
  const data = createEmptyChecklist(trade);
  for (const [id, result] of Object.entries(marks)) {
    if (data[id]) data[id] = { result, note: '' };
  }
  return data;
}

export function buildSeedWorkerChecklist(
  trade: Trade,
  workerMarks: Record<string, WorkerTaskStatus>,
  assessorMarks: Record<string, TaskResultValue>
): WorkerChecklistData {
  const data = createEmptyWorkerChecklist(trade);
  for (const task of trade.checklist) {
    if (workerMarks[task.id]) {
      data[task.id].workerStatus = workerMarks[task.id];
    }
    if (assessorMarks[task.id]) {
      data[task.id].assessorResult = assessorMarks[task.id];
    }
  }
  return data;
}
