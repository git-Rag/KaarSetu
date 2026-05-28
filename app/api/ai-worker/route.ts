import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { structureWorkerAnswer } from '@/lib/voice-attempt-ai';
import { z } from 'zod';

const schema = z.object({
  tradeId: z.string().min(1),
  taskId: z.string().min(1),
  taskLabel: z.string().min(1),
  taskDescription: z.string().min(1),
  transcript: z.string().min(1),
  uiLanguage: z.enum(['en', 'hi']).optional().default('en'),
});

export async function GET() {
  return NextResponse.json({ status: 'active', message: 'KaarSetu AI Worker API is reachable' });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'WORKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 20 AI calls per minute per user
  const ip = getClientIp(req);
  const { success } = rateLimit(`ai-voice-${session.user.id}-${ip}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validated = schema.parse(body);

    const result = await structureWorkerAnswer(validated);

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    console.error('AI API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
