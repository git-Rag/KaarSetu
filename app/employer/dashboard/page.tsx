'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScanLine, Star, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RECENT_VERIFICATIONS_KEY } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface RecentVerification {
  tokenId: string;
  workerName: string;
  trade: string;
  verifiedAt: string;
  attested: boolean;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [recent, setRecent] = useState<RecentVerification[]>([]);
  const [quickTokenId, setQuickTokenId] = useState('');
  const [stats, setStats] = useState({
    verificationsToday: 0,
    workersAttested: 0,
    avgRating: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_VERIFICATIONS_KEY);
      if (raw) {
        const list = JSON.parse(raw) as RecentVerification[];
        setRecent(list.slice(0, 8));
        const today = new Date().toDateString();
        setStats({
          verificationsToday: list.filter(
            (v) => new Date(v.verifiedAt).toDateString() === today
          ).length,
          workersAttested: list.filter((v) => v.attested).length,
          avgRating: list.length > 0 ? 4.2 : 0,
        });
      }
    } catch {
      setRecent([]);
    }
  }, []);

  const quickVerify = () => {
    const id = quickTokenId.trim();
    if (!id) return;
    router.push(`/employer/verify/${id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Employer Dashboard</h1>
        <p className="mt-1 text-text-secondary">Verify credentials and attest work history</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-text-secondary">Verifications Today</p>
          <p className="mt-2 font-display text-3xl font-bold text-teal">{stats.verificationsToday}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Workers Attested</p>
          <p className="mt-2 font-display text-3xl font-bold text-saffron">{stats.workersAttested}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Avg Rating Given</p>
          <p className="mt-2 flex items-center gap-1 font-display text-3xl font-bold text-amber">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
            <Star className="h-6 w-6 fill-amber text-amber" />
          </p>
        </Card>
      </div>

      <Card className="border-teal/40 bg-teal/5">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-teal/40 bg-teal/10">
              <ScanLine className="h-8 w-8 text-teal" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-cream">Scan & Verify</h2>
              <p className="text-sm text-text-secondary">
                Point your camera at a worker&apos;s credential QR code
              </p>
            </div>
          </div>
          <Link href="/employer/verify">
            <Button variant="teal" size="lg">
              Open Scanner
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Verify</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-text-secondary">
          Paste a token ID when QR scan is unavailable
        </p>
        <div className="flex gap-3">
          <Input
            placeholder="e.g. 1042"
            value={quickTokenId}
            onChange={(e) => setQuickTokenId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && quickVerify()}
            className="flex-1"
          />
          <Button onClick={quickVerify}>Verify</Button>
        </div>
      </Card>

      <div>
        <h2 className="font-display text-lg font-bold text-cream">Recent Verifications</h2>
        {recent.length === 0 ? (
          <Card className="mt-4 text-center text-text-secondary">
            <p>No verifications yet. Scan a worker&apos;s QR code to get started.</p>
            <Link href="/employer/verify" className="mt-4 inline-block">
              <Button size="sm" variant="outline">
                Start Scanning
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {recent.map((v) => (
              <Link key={`${v.tokenId}-${v.verifiedAt}`} href={`/employer/verify/${v.tokenId}`}>
                <Card className="flex items-center justify-between transition-all duration-200 hover:border-teal/30">
                  <div>
                    <p className="font-display font-bold text-cream">{v.workerName}</p>
                    <p className="text-sm text-text-secondary">{v.trade}</p>
                  </div>
                  <div className="text-right">
                    {v.attested ? (
                      <Badge variant="teal">Attested</Badge>
                    ) : (
                      <Badge variant="amber">Verified only</Badge>
                    )}
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(v.verifiedAt), { addSuffix: true })}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
