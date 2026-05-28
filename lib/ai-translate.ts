import { chatCompletion, groq } from './groq';
import { z } from 'zod';

const translationSchema = z.object({
  translatedText: z.string(),
});

export async function aiTranslate(
  text: string,
  targetLang: 'en' | 'hi',
  context?: string
): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  if (!groq) return text;

  try {
    const systemPrompt = `
      You are a professional translator for KaarSetu, a platform for India's informal workers.
      Translate the given text into ${targetLang === 'hi' ? 'natural Hindi/Hinglish' : 'professional English'}.
      
      Rules:
      1. Preserve technical terms in English characters if they are commonly used by workers (e.g., "MCB", "PVC pipe", "primer").
      2. Keep the tone helpful and respectful.
      3. ${context ? `Context: ${context}` : ''}
      4. Respond ONLY with a JSON object: {"translatedText": "..."}
    `;

    const result = await chatCompletion(systemPrompt, text);
    if (!result) return text;

    const parsed = JSON.parse(result);
    return parsed.translatedText || text;
  } catch (error) {
    console.error('AI Translation Error:', error);
    return text;
  }
}
