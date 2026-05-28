'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const QRCode = dynamic(() => import('react-qr-code').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded bg-white/90 text-[10px] text-black">
      QR
    </div>
  ),
});

interface QrGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrGenerator({ value, size = 96, className }: QrGeneratorProps) {
  const safeValue = value?.trim() || 'https://kaarsetu.demo/verify/demo';

  return (
    <div
      className={cn('flex items-center justify-center rounded-lg bg-white p-2', className)}
      style={{ width: size + 16, height: size + 16 }}
    >
      <QRCode value={safeValue} size={size} />
    </div>
  );
}
