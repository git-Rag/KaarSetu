import type { Trade, TradeChecklist } from '@/lib/trades';
import { TRADE_MAP, getTradeByName } from '@/lib/trades';

export type TaskResultValue = 'PASS' | 'PARTIAL' | 'FAIL';

export interface TaskAssessment {
  result: TaskResultValue;
  note?: string;
}

export type ChecklistData = Record<string, TaskAssessment>;

export function createEmptyChecklist(trade: Trade): ChecklistData {
  const data: ChecklistData = {};
  for (const task of trade.checklist) {
    data[task.id] = { result: 'FAIL', note: '' };
  }
  return data;
}

/** Normalize legacy boolean checklist JSON from older seeds. */
export function normalizeChecklistData(
  raw: unknown,
  trade: Trade
): ChecklistData {
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

export function calculatePracticalScore(
  checklistData: ChecklistData,
  tasks: TradeChecklist[]
): number {
  let totalWeight = 0;
  let earned = 0;

  for (const task of tasks) {
    const weight = task.isRequired ? 2 : 1;
    totalWeight += weight;
    const entry = checklistData[task.id];
    if (!entry) continue;
    if (entry.result === 'PASS') earned += weight;
    else if (entry.result === 'PARTIAL') earned += weight * 0.5;
  }

  if (totalWeight === 0) return 0;
  return Math.round((earned / totalWeight) * 100);
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
      const entry = checklistData[task.id];
      if (!entry) {
        return { valid: false, error: `Required task not assessed: ${task.label}` };
      }
    }
  }

  return { valid: true };
}

export function isPassingScore(score: number, trade: Trade): boolean {
  return score >= trade.passingScore;
}

export function resolveTradeForAssessment(tradeKeyOrName: string): Trade | undefined {
  return TRADE_MAP[tradeKeyOrName] ?? getTradeByName(tradeKeyOrName);
}

/** Build seed checklist from per-task results. */
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
