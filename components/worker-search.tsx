'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface WorkerResult {
  id: string;
  userId: string;
  name: string;
  phone: string;
  trade: string;
  city: string;
  state: string;
  photoUrl?: string | null;
}

export function WorkerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WorkerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/workers?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setResults(json.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Input
          placeholder="Search by phone number or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          className="flex-1"
        />
        <Button onClick={search} loading={loading}>
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {searched && results.length === 0 && !loading && (
        <Card className="text-center text-text-secondary">
          <p>Worker not registered.</p>
          <p className="mt-2 text-sm">
            They can register at{' '}
            <Link href="/register?role=WORKER" className="text-saffron hover:underline">
              kaarsetu.in/register
            </Link>
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((worker) => (
          <Card key={worker.id} className="flex items-center gap-4 hover:border-saffron/30">
            {worker.photoUrl ? (
              <img src={worker.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-lg text-text-secondary">
                {worker.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-display font-bold text-cream">{worker.name}</h4>
              <p className="text-sm text-text-secondary">
                {worker.trade} • {worker.city}
              </p>
            </div>
            <Link href={`/assessor/assess/${worker.id}`}>
              <Button size="sm">Start Assessment</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
