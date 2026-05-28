import { RECENT_VERIFICATIONS_KEY } from '@/lib/constants';

export interface RecentVerification {
  tokenId: string;
  workerName: string;
  trade: string;
  verifiedAt: string;
  attested: boolean;
}

export function saveRecentVerification(entry: Omit<RecentVerification, 'verifiedAt'> & { verifiedAt?: string }) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_VERIFICATIONS_KEY);
    const list: RecentVerification[] = raw ? JSON.parse(raw) : [];
    const item: RecentVerification = {
      ...entry,
      verifiedAt: entry.verifiedAt ?? new Date().toISOString(),
    };
    const filtered = list.filter((v) => v.tokenId !== item.tokenId);
    localStorage.setItem(
      RECENT_VERIFICATIONS_KEY,
      JSON.stringify([item, ...filtered].slice(0, 20))
    );
  } catch {
    /* ignore */
  }
}

export function markVerificationAttested(tokenId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_VERIFICATIONS_KEY);
    if (!raw) return;
    const list = JSON.parse(raw) as RecentVerification[];
    const updated = list.map((v) =>
      v.tokenId === tokenId ? { ...v, attested: true } : v
    );
    localStorage.setItem(RECENT_VERIFICATIONS_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}
