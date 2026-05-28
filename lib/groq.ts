import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

export const groq = apiKey ? new Groq({ apiKey }) : null;

export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
export const GROQ_STT_MODEL = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo';

export async function chatCompletion(system: string, user: string) {
  if (!groq) {
    throw new Error('Groq API key not configured');
  }

  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    model: GROQ_MODEL,
    response_format: { type: 'json_object' },
  });

  return response.choices[0].message.content;
}

export async function transcribeAudio(file: File | Blob) {
  if (!groq) {
    throw new Error('Groq API key not configured');
  }

  const response = await groq.audio.transcriptions.create({
    file: file as any,
    model: GROQ_STT_MODEL,
    response_format: 'json',
  });

  return response.text;
}
