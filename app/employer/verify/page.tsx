'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrScanner } from '@/components/qr-scanner';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getVerifyUrl } from '@/lib/utils';

type Tab = 'scan' | 'manual';

function extractTokenId(decoded: string): string | null {
  try {
    if (decoded.startsWith('http')) {
      const url = new URL(decoded);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] ?? null;
    }
    if (/^\d+$/.test(decoded.trim())) return decoded.trim();
    const match = decoded.match(/(\d{3,})/);
    return match?.[1] ?? null;
  } catch {
    return /^\d+$/.test(decoded.trim()) ? decoded.trim() : null;
  }
}

export default function EmployerVerifyPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('scan');
  const [manualId, setManualId] = useState('');

  const handleScan = useCallback(
    (text: string) => {
      const tokenId = extractTokenId(text);
      if (tokenId) {
        router.push(`/employer/verify/${tokenId}`);
      }
    },
    [router]
  );

  const manualVerify = () => {
    const tokenId = extractTokenId(manualId);
    if (tokenId) router.push(`/employer/verify/${tokenId}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Verify Credential</h1>
        <p className="mt-1 text-text-secondary">Scan QR or enter token ID manually</p>
      </div>

      <div className="flex gap-2 rounded-lg border border-border bg-surface-raised p-1">
        {(['scan', 'manual'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200',
              tab === t ? 'bg-saffron/15 text-saffron' : 'text-text-secondary hover:text-cream'
            )}
          >
            {t === 'scan' ? 'Camera Scan' : 'Manual Entry'}
          </button>
        ))}
      </div>

      {tab === 'scan' ? (
        <Card>
          <p className="mb-4 text-center text-sm text-text-secondary">
            Point camera at worker&apos;s QR code
          </p>
          <QrScanner onScan={handleScan} />
          <p className="mt-4 text-center text-xs text-text-muted">
            QR links to {getVerifyUrl('1042').replace('1042', '[tokenId]')}
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
          </CardHeader>
          <Input
            label="Token ID or verification URL"
            placeholder="1042"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && manualVerify()}
          />
          <Button className="mt-4 w-full" onClick={manualVerify}>
            Verify Credential
          </Button>
        </Card>
      )}
    </div>
  );
}
