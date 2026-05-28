import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { transcribeAudio } from '@/lib/groq';
import { structureWorkerAnswer } from '@/lib/voice-attempt-ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'WORKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const ip = getClientIp(req);
  const { success } = rateLimit(`ai-audio-${session.user.id}-${ip}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as Blob | null;
    const tradeId = formData.get('tradeId') as string;
    const taskId = formData.get('taskId') as string;
    const taskLabel = formData.get('taskLabel') as string;
    const taskDescription = formData.get('taskDescription') as string;
    const uiLanguage = (formData.get('uiLanguage') as 'en' | 'hi') || 'en';

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    // 1. Transcribe with Whisper
    const transcript = await transcribeAudio(audio);

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'Could not transcribe audio' }, { status: 400 });
    }

    // 2. Structure the answer with existing logic
    const result = await structureWorkerAnswer({
      tradeId,
      taskId,
      taskLabel,
      taskDescription,
      transcript,
      uiLanguage,
    });

    return NextResponse.json({ 
      data: {
        ...result,
        originalTranscript: transcript
      } 
    });
  } catch (error) {
    console.error('Audio Transcription API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
