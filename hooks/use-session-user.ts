'use client';

import { useSession } from 'next-auth/react';
import type { SessionUser } from '@/types';

export function useSessionUser(): SessionUser | null {
  const { data } = useSession();
  if (!data?.user) return null;
  return {
    id: data.user.id,
    name: data.user.name ?? '',
    role: data.user.role,
    walletAddress: data.user.walletAddress,
    phone: data.user.phone,
  };
}
