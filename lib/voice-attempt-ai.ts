import { chatCompletion, groq } from './groq';

export interface AIWorkerAnswerInput {
  tradeId: string;
  taskId: string;
  taskLabel: string;
  taskDescription: string;
  transcript: string;
  uiLanguage?: 'en' | 'hi';
}

export interface AIWorkerAnswerOutput {
  workerStatus: 'COMPLETED' | 'NEEDS_PRACTICE' | 'NOT_ATTEMPTED';
  cleanNote: string;
  missingEvidence: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  safetyFlags: string[];
}

const SYSTEM_PROMPT = `
You are KaarSetu Saathi, an AI assistant helping informal workers in India document their skills.
Your task is to take a rough spoken transcript (in Hindi, Hinglish, or English) from a worker performing a practical task and convert it into a professional, clean note for an assessor.

Rules:
1. Determine the worker's status:
   - COMPLETED: If the worker clearly describes finishing the task successfully.
   - NEEDS_PRACTICE: If the worker struggled, expressed confusion, or didn't finish.
   - NOT_ATTEMPTED: If the transcript is empty or says they didn't do it.
2. cleanNote: Create a professional summary. 
   - If UI language is 'hi', provide the summary in natural Hindi/Hinglish.
   - If UI language is 'en', provide it in professional English.
   - Preserve technical terms in English characters if they are commonly used (e.g., "MCB", "leakage", "primer").
3. missingEvidence: Suggest what photos or videos are missing based on the task (in UI language).
4. confidence: HIGH if the transcript is clear, MEDIUM if somewhat vague, LOW if very unclear.
5. safetyFlags: List any safety concerns mentioned or missing (in UI language).
6. Respond ONLY with a JSON object.

Input format:
{
  "trade": "string",
  "task": "string",
  "description": "string",
  "transcript": "string",
  "uiLanguage": "en" | "hi"
}

Output format:
{
  "workerStatus": "COMPLETED" | "NEEDS_PRACTICE" | "NOT_ATTEMPTED",
  "cleanNote": "string",
  "missingEvidence": ["string"],
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "safetyFlags": ["string"]
}
`;

export async function structureWorkerAnswer(
  input: AIWorkerAnswerInput
): Promise<AIWorkerAnswerOutput> {
  if (!groq) {
    return getDeterministicFallback(input);
  }

  try {
    const userPrompt = JSON.stringify({
      trade: input.tradeId,
      task: input.taskLabel,
      description: input.taskDescription,
      transcript: input.transcript,
      uiLanguage: input.uiLanguage || 'en',
    });

    const result = await chatCompletion(SYSTEM_PROMPT, userPrompt);
    if (!result) throw new Error('Empty response from Groq');

    const parsed = JSON.parse(result) as AIWorkerAnswerOutput;
    
    // Validate workerStatus
    if (!['COMPLETED', 'NEEDS_PRACTICE', 'NOT_ATTEMPTED'].includes(parsed.workerStatus)) {
      parsed.workerStatus = 'NEEDS_PRACTICE';
    }

    return parsed;
  } catch (error) {
    console.error('AI Structuring Error:', error);
    return getDeterministicFallback(input);
  }
}

function getDeterministicFallback(input: AIWorkerAnswerInput): AIWorkerAnswerOutput {
  const text = input.transcript.toLowerCase().trim();
  
  if (!text || text.length < 5) {
    return {
      workerStatus: 'NOT_ATTEMPTED',
      cleanNote: 'No significant input provided.',
      missingEvidence: [],
      confidence: 'LOW',
      safetyFlags: [],
    };
  }

  const needsPracticeKeywords = [
    'nahi aata',
    'not sure',
    'confused',
    'practice',
    'mushkil',
    'help',
    'dikkat',
    'trouble',
    'fail',
  ];
  
  const needsPractice = needsPracticeKeywords.some((k) => text.includes(k));

  return {
    workerStatus: needsPractice ? 'NEEDS_PRACTICE' : 'COMPLETED',
    cleanNote: `Voice transcript: "${input.transcript}"`,
    missingEvidence: [],
    confidence: 'LOW',
    safetyFlags: [],
  };
}
