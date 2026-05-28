'use client';

import { useState, useEffect, useRef } from 'react';
import type { Trade } from '@/lib/trades';
import type { WorkerChecklistData, WorkerTaskStatus } from '@/lib/assessment-scoring';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Check,
  Edit2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Info,
  Keyboard,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/lib/i18n/use-translation';

interface VoiceGuidedAttemptProps {
  trade: Trade;
  value: WorkerChecklistData;
  onChange: (value: WorkerChecklistData) => void;
  onComplete: () => void;
}

type Language = 'en-US' | 'hi-IN';

interface AIResult {
  workerStatus: WorkerTaskStatus;
  cleanNote: string;
  missingEvidence: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  safetyFlags: string[];
  originalTranscript?: string;
}

export function VoiceGuidedAttempt({
  trade,
  value,
  onChange,
  onComplete,
}: VoiceGuidedAttemptProps) {
  const { t, lang: uiLang } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState<Language>(uiLang === 'hi' ? 'hi-IN' : 'en-US');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  // Sync internal language with global language switcher
  useEffect(() => {
    setLanguage(uiLang === 'hi' ? 'hi-IN' : 'en-US');
  }, [uiLang]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentTask = trade.checklist[currentIndex];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
      setAiResult(null);
      setIsEditing(false);
      setIsTypingMode(false);
    } catch (error) {
      console.error('Microphone access error:', error);
      toast.error('Could not access microphone. Please check permissions.');
      setIsTypingMode(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'worker-answer.webm');
      formData.append('tradeId', trade.id);
      formData.append('taskId', currentTask.id);
      formData.append('taskLabel', currentTask.label);
      formData.append('taskDescription', currentTask.description);
      formData.append('uiLanguage', uiLang);

      const res = await fetch('/api/ai/transcribe-worker-audio', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');

      setAiResult(json.data);
      if (json.data.originalTranscript) {
        setTranscript(json.data.originalTranscript);
      }
    } catch (e) {
      console.error('AI Processing Error:', e);
      toast.error(e instanceof Error ? e.message : t('worker.tests.voice.thinking'));
      setIsTypingMode(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTypedSubmit = async () => {
    if (!typedAnswer.trim()) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId: trade.id,
          taskId: currentTask.id,
          taskLabel: currentTask.label,
          taskDescription: currentTask.description,
          transcript: typedAnswer,
          uiLanguage: uiLang,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');
      
      setAiResult(json.data);
      setTranscript(typedAnswer);
      setIsTypingMode(false);
      setTypedAnswer('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const useSampleAnswer = () => {
    const samples: Record<string, string> = {
      'electrician': uiLang === 'hi' ? 'मैंने सारे टूल्स चेक कर लिए हैं। वायर स्ट्रिपर और टेस्टर मेरे पास है। इंसुलेशन टेप भी तैयार है।' : 'I have checked all the tools. I have the wire stripper and tester with me. Insulation tape is also ready.',
      'plumber': uiLang === 'hi' ? 'मैंने पाइप लीक चेक कर लिया है। थ्रेड सील टेप लगा दी है और अब कोई लीकेज नहीं है।' : 'I have checked the pipe leak. I have applied thread seal tape and now there is no leakage.',
      'painter': uiLang === 'hi' ? 'सतह को मैंने साफ़ कर दिया है और प्राइमर का पहला कोट लगा दिया है। अब सूखने का इंतज़ार कर रहा हूँ।' : 'I have cleaned the surface and applied the first coat of primer. Now waiting for it to dry.',
    };
    
    const sampleText = samples[trade.id] || (uiLang === 'hi' ? 'मैंने काम अच्छे से पूरा कर लिया है।' : 'I have completed the task well.');
    setTypedAnswer(sampleText);
    setIsTypingMode(true);
  };

  const acceptAnswer = () => {
    if (!aiResult) return;
    
    onChange({
      ...value,
      [currentTask.id]: {
        ...value[currentTask.id],
        workerStatus: aiResult.workerStatus,
        workerNote: aiResult.cleanNote,
        isVoice: true,
      },
    });

    if (currentIndex < trade.checklist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
      setAiResult(null);
      setIsEditing(false);
    } else {
      onComplete();
    }
  };

  const playQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(
      language === 'hi-IN' 
        ? `कृपया बताएं: ${currentTask.label}. ${currentTask.description}`
        : `Please describe: ${currentTask.label}. ${currentTask.description}`
    );
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="border-saffron/20 bg-surface-raised">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/20 text-saffron">
              <span className="font-bold">{currentIndex + 1}</span>
            </div>
            <div>
              <CardTitle className="text-lg text-cream">{currentTask.label}</CardTitle>
              <p className="text-sm text-text-secondary">{currentTask.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTypingMode(!isTypingMode)}
              className="h-8 px-2 text-[10px] uppercase tracking-wider"
            >
              {isTypingMode ? <Mic className="h-3 w-3 mr-1" /> : <Keyboard className="h-3 w-3 mr-1" />}
              {isTypingMode ? t('worker.tests.voice.useVoice') : t('worker.tests.voice.typeInstead')}
            </Button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-lg border border-border bg-surface-card px-2 py-1 text-xs text-cream outline-none"
            >
              <option value="hi-IN">Hindi / Hinglish</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {isTypingMode ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={playQuestion} className="gap-2">
                <Play className="h-4 w-4" /> {t('worker.tests.voice.playQuestion')}
              </Button>
              <Button variant="outline" onClick={useSampleAnswer} className="gap-2 text-saffron border-saffron/20">
                <Wand2 className="h-4 w-4" /> {t('worker.tests.voice.useSample')}
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-muted">Type your answer in Hindi, Hinglish, or English:</label>
              <textarea
                className="w-full rounded-xl border border-border bg-surface-card p-4 text-cream focus:border-saffron/50 outline-none"
                rows={4}
                placeholder={t('worker.tests.voice.typePlaceholder')}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
              />
            </div>
            <Button onClick={handleTypedSubmit} className="w-full bg-saffron hover:bg-saffron-light" disabled={!typedAnswer.trim() || isProcessing} loading={isProcessing}>
              {t('worker.tests.voice.submitText')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={playQuestion} className="gap-2">
                <Play className="h-4 w-4" /> {t('worker.tests.voice.playQuestion')}
              </Button>
              <Button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={cn(
                  'gap-2 transition-all duration-300 min-w-[160px]',
                  isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-saffron hover:bg-saffron-light'
                )}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? t('worker.tests.voice.stopRecording') : t('worker.tests.voice.startSpeaking')}
              </Button>
              {transcript && !isRecording && !isProcessing && (
                <Button variant="outline" onClick={() => { setTranscript(''); setAiResult(null); }} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> {t('worker.tests.voice.reRecord')}
                </Button>
              )}
            </div>
            
            {!isRecording && !isProcessing && !aiResult && (
              <Button variant="ghost" size="sm" onClick={useSampleAnswer} className="text-text-muted hover:text-saffron">
                <Wand2 className="h-3 w-3 mr-2" /> {t('worker.tests.voice.noMic')}
              </Button>
            )}
          </div>
        )}

        {isRecording && (
          <div className="rounded-xl bg-surface-card p-8 text-center border border-saffron/20 border-dashed">
            <div className="flex justify-center mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            </div>
            <p className="text-lg font-medium text-cream mb-2">{t('worker.tests.voice.listening')}</p>
            <p className="text-sm text-text-secondary italic">"Explain what you did for this task..."</p>
          </div>
        )}

        {!isRecording && isProcessing && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 rounded-xl bg-surface-card border border-border">
            <Spinner className="h-10 w-10 text-saffron" />
            <div className="text-center">
              <p className="text-cream font-medium">{t('worker.tests.voice.thinking')}</p>
              <p className="text-sm text-text-secondary mt-1">{t('worker.tests.voice.transcribing')}</p>
            </div>
          </div>
        )}

        {!isRecording && !isProcessing && aiResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className={cn(
              "rounded-xl border p-4",
              aiResult.workerStatus === 'COMPLETED' ? "border-teal/30 bg-teal/5" : "border-amber/30 bg-amber/5"
            )}>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={aiResult.workerStatus === 'COMPLETED' ? 'teal' : 'amber'}>
                  {aiResult.workerStatus === 'COMPLETED' ? t('common.completed') : aiResult.workerStatus.replace(/_/g, ' ')}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Info className="h-3 w-3" />
                  AI Confidence: {aiResult.confidence}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">{t('worker.tests.voice.transcript')}:</p>
                <p className="text-cream text-sm italic">"{transcript}"</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">{t('worker.tests.voice.aiNote')}:</p>
                {isEditing ? (
                  <textarea
                    className="w-full rounded-lg border border-border bg-surface-card p-2 text-sm text-cream"
                    rows={3}
                    value={aiResult.cleanNote}
                    onChange={(e) => setAiResult({ ...aiResult, cleanNote: e.target.value })}
                  />
                ) : (
                  <p className="text-cream text-sm font-medium">{aiResult.cleanNote}</p>
                )}
              </div>

              {aiResult.missingEvidence.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t('worker.tests.voice.missingEvidence')}:</p>
                  <ul className="mt-1 space-y-1">
                    {aiResult.missingEvidence.map((ev, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-amber" /> {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.safetyFlags.length > 0 && (
                <div className="mt-3 rounded-lg bg-red-500/10 p-2 border border-red-500/20">
                  <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {t('worker.tests.voice.safetyWarnings')}
                  </p>
                  <ul className="mt-1">
                    {aiResult.safetyFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-red-200">- {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={acceptAnswer} className="flex-1 gap-2 bg-teal hover:bg-teal-light">
                <Check className="h-4 w-4" /> {t('worker.tests.voice.acceptAnswer')}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                <Edit2 className="h-4 w-4" /> {isEditing ? t('common.save') : t('worker.tests.voice.editManually')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0 || isProcessing || isRecording}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> {t('common.previous')}
          </Button>
          <span className="text-xs text-text-muted">
            {t('common.next') === 'आगे' ? `कार्य ${currentIndex + 1} / ${trade.checklist.length}` : `Task ${currentIndex + 1} of ${trade.checklist.length}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(trade.checklist.length - 1, currentIndex + 1))}
            disabled={currentIndex === trade.checklist.length - 1 || isProcessing || isRecording}
            className="gap-1"
          >
            {t('common.next')} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
