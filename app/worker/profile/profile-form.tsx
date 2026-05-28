'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INDIAN_STATES } from '@/lib/constants';
import { Select } from '@/components/ui/select';
import { truncateAddress } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

interface ProfileFormProps {
  profileId: string;
  initial: {
    name: string;
    phone: string;
    walletAddress: string;
    trade: string;
    city: string;
    state: string;
    bio: string;
    photoUrl: string;
    aadhaarVerified: boolean;
    aadhaarLast4: string | null;
    eShramUAN: string | null;
  };
}

export function ProfileForm({ profileId, initial }: ProfileFormProps) {
  const [city, setCity] = useState(initial.city);
  const [state, setState] = useState(initial.state);
  const [bio, setBio] = useState(initial.bio);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/workers/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state, bio, photoUrl: photoUrl || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Update failed');
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream">My Profile</h1>
        <p className="mt-1 text-text-secondary">Update your public worker information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Full name" value={initial.name} disabled />
          <Input label="Phone" value={initial.phone} disabled />
          <div>
            <p className="mb-1.5 text-sm font-medium text-cream">Wallet address</p>
            <p className="rounded-lg border border-border bg-surface-raised px-4 py-2.5 font-mono text-sm text-text-secondary">
              {truncateAddress(initial.walletAddress, 10, 8)}
            </p>
          </div>
          <Input label="Trade" value={initial.trade} disabled />
          <div className="flex flex-wrap gap-2">
            {initial.aadhaarVerified && (
              <Badge variant="teal">
                <CheckCircle className="mr-1 h-3 w-3" />
                Aadhaar verified ••••{initial.aadhaarLast4}
              </Badge>
            )}
            {initial.eShramUAN && (
              <Badge variant="default">e-Shram: {initial.eShramUAN}</Badge>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit details</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Select
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream">Bio</label>
            <textarea
              className="w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-cream placeholder:text-text-muted focus:border-saffron/50 focus:outline-none focus:ring-1 focus:ring-saffron/30"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief description of your experience..."
            />
          </div>
          <Input
            label="Photo URL"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
          />
          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
