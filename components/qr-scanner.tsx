'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Spinner } from '@/components/ui/spinner';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    const id = 'qr-reader';
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          onScan(text);
        },
        () => {}
      )
      .then(() => setLoading(false))
      .catch(() => {
        setError('Camera access denied or unavailable. Use manual entry.');
        setLoading(false);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-teal/40 bg-black">
      <div id="qr-reader" className="w-full [&_video]:!rounded-xl" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 animate-pulse rounded-lg border-2 border-teal border-dashed" />
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Spinner />
        </div>
      )}
      {error && (
        <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-red-err">
          {error}
        </p>
      )}
    </div>
  );
}
