'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTradeById } from '@/lib/trades';
import { WorkerAttemptChecklist } from '@/components/worker-attempt-checklist';
import { EvidenceSuggestionsPanel } from '@/components/evidence-suggestions-panel';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  createEmptyWorkerChecklist,
  normalizeWorkerChecklistData,
  type WorkerChecklistData,
} from '@/lib/assessment-scoring';
import { NSQF_LEVELS } from '@/lib/constants';
import { ArrowLeft, Upload, Shield, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { NSQFLevel } from '@prisma/client';

interface AssessorOption {
  id: string;
  name: string;
  itiName: string;
  district: string;
}

export default function WorkerAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.tradeId as string;
  const trade = getTradeById(tradeId);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<WorkerChecklistData>({});
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [nsqfLevel, setNsqfLevel] = useState<NSQFLevel>('LEVEL_2');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assessors, setAssessors] = useState<AssessorOption[]>([]);
  const [selectedAssessor, setSelectedAssessor] = useState('');
  const [autoAssign, setAutoAssign] = useState(true);

  const initAttempt = useCallback(async () => {
    if (!trade) return;
    setLoading(true);
    try {
      const res = await fetch('/api/worker/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId: trade.id, nsqfLevel }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to start attempt');
      setAttemptId(json.data.id);
      setChecklist(
        normalizeWorkerChecklistData(json.data.checklistData, trade) ??
          createEmptyWorkerChecklist(trade)
      );
      setEvidenceUrls(json.data.evidenceUrls ?? []);
      setNotes(json.data.notes ?? '');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start attempt');
    } finally {
      setLoading(false);
    }
  }, [trade, nsqfLevel]);

  useEffect(() => {
    initAttempt();
    fetch('/api/assessors/approved')
      .then((r) => r.json())
      .then((json) => setAssessors(json.data ?? []))
      .catch(() => {});
  }, [initAttempt]);

  const saveDraft = async () => {
    if (!attemptId) return false;
    setSaving(true);
    try {
      const res = await fetch(`/api/worker/attempts/${attemptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistData: checklist, evidenceUrls, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Draft saved');
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !attemptId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('assessmentId', attemptId);
      Array.from(files).forEach((f) => formData.append('evidence', f));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const paths = json.data as string[];
      setEvidenceUrls((prev) => [...prev, ...paths]);
      await fetch(`/api/worker/attempts/${attemptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceUrls: [...evidenceUrls, ...paths] }),
      });
      toast.success(`${paths.length} file(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    const saved = await saveDraft();
    if (!saved) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/worker/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoAssign,
          assessorProfileId: autoAssign ? undefined : selectedAssessor,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Submitted for assessor review');
      router.push(`/worker/tests/submissions/${attemptId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!trade) {
    return (
      <Card>
        <p className="text-text-secondary">Module not found.</p>
      </Card>
    );
  }

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  const nsqfOptions = NSQF_LEVELS.filter((l) => trade.nsqfLevels.includes(l.number)).map(
    (l) => ({ value: l.value, label: l.label })
  );

  return (
    <div className="space-y-6">
      <Link href={`/worker/tests/${tradeId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Requirements
        </Button>
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-cream">{trade.testTitle}</h1>
        <p className="text-text-secondary">Practical self-attempt (draft)</p>
      </div>

      <Card className="border-saffron/30 bg-saffron/5">
        <p className="flex gap-2 text-sm text-cream">
          <Shield className="h-5 w-5 shrink-0 text-saffron" />
          Your attempt is evidence for review. Only an approved assessor can verify it and
          issue a credential.
        </p>
      </Card>

      <Select
        label="NSQF level"
        value={nsqfLevel}
        onChange={(e) => setNsqfLevel(e.target.value as NSQFLevel)}
        options={nsqfOptions}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your practical attempt</CardTitle>
          </CardHeader>
          <WorkerAttemptChecklist trade={trade} value={checklist} onChange={setChecklist} />
        </Card>
        <EvidenceSuggestionsPanel suggestions={trade.evidenceSuggestions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidence upload</CardTitle>
        </CardHeader>
        <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border p-8 hover:border-saffron/40">
          <Upload className="mb-2 h-8 w-8 text-text-muted" />
          <span className="text-sm text-cream">Photos or video (max 5 files, 10MB each)</span>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            multiple
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
        {evidenceUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {evidenceUrls.map((url) => (
              <div key={url} className="overflow-hidden rounded-lg border border-border">
                {url.endsWith('.mp4') ? (
                  <video src={url} className="h-20 w-full object-cover" controls />
                ) : (
                  <img src={url} alt="" className="h-20 w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
        <textarea
          className="mt-4 w-full rounded-lg border border-border bg-surface-raised p-3 text-cream"
          rows={3}
          placeholder="Overall notes for your assessor..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit for review</CardTitle>
        </CardHeader>
        <label className="mb-4 flex items-center gap-2 text-sm text-cream">
          <input
            type="checkbox"
            checked={autoAssign}
            onChange={(e) => setAutoAssign(e.target.checked)}
            className="rounded border-border"
          />
          Auto-assign assessor (same state/city, or ITI Bhopal demo default)
        </label>
        {!autoAssign && (
          <Select
            label="Choose assessor"
            value={selectedAssessor}
            onChange={(e) => setSelectedAssessor(e.target.value)}
            options={[
              { value: '', label: 'Select assessor' },
              ...assessors.map((a) => ({
                value: a.id,
                label: `${a.name} — ${a.itiName}, ${a.district}`,
              })),
            ]}
          />
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={saveDraft} loading={saving}>
            Save draft
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            <Send className="h-4 w-4" />
            Submit for assessor review
          </Button>
        </div>
      </Card>
    </div>
  );
}
