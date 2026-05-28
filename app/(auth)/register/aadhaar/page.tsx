'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useCountdown } from '@/hooks/use-countdown';
import { registerSchema } from '@/lib/validations';
import { REGISTER_DRAFT_KEY } from '@/lib/constants';
import { truncateAddress } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { z } from 'zod';
import type { Role } from '@prisma/client';

type RegisterForm = z.infer<typeof registerSchema>;

const MOCK_OTP = '123456';

export default function AadhaarVerificationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<RegisterForm | null>(null);
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [walletShown, setWalletShown] = useState<string | null>(null);
  const { seconds, start, isRunning } = useCountdown(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTER_DRAFT_KEY);
    if (!raw) {
      router.replace('/register');
      return;
    }
    try {
      setDraft(JSON.parse(raw) as RegisterForm);
    } catch {
      router.replace('/register');
    }
  }, [router]);

  const sendOtp = async () => {
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      toast.error('Enter last 4 digits of Aadhaar');
      return;
    }
    setSendingOtp(true);
    await new Promise((r) => setTimeout(r, 1200));
    setOtpSent(true);
    setSendingOtp(false);
    start();
    toast.success(`OTP sent to ****${aadhaarLast4}XXXXX`);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyAndRegister = useCallback(async () => {
    if (!draft) return;
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    if (otpValue !== MOCK_OTP) {
      toast.error('Invalid OTP. Use 123456 for demo.');
      return;
    }

    const payload = { ...draft, aadhaarLast4 };
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid registration data');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? 'Registration failed');
        return;
      }

      setWalletShown(json.data?.walletAddress ?? null);

      const signInResult = await signIn('credentials', {
        phone: parsed.data.phone,
        password: parsed.data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        if (signInResult.error.includes('pending approval')) {
          toast.info('Account created. Awaiting admin approval.');
          router.push('/login');
          return;
        }
        toast.error('Account created but sign-in failed. Please log in.');
        router.push('/login');
        return;
      }

      sessionStorage.removeItem(REGISTER_DRAFT_KEY);
      await new Promise((r) => setTimeout(r, 1500));

      const role = (json.data?.role ?? parsed.data.role) as Role;
      const dashboard =
        role === 'WORKER'
          ? '/worker/dashboard'
          : role === 'ASSESSOR'
            ? '/assessor/dashboard'
            : role === 'EMPLOYER'
              ? '/employer/dashboard'
              : '/admin/dashboard';
      router.push(dashboard);
      router.refresh();
    } catch {
      toast.error('Registration failed');
    } finally {
      setVerifying(false);
    }
  }, [draft, otp, aadhaarLast4, router]);

  if (!draft) {
    return (
      <Card className="text-center text-text-secondary">
        <p>Loading registration...</p>
      </Card>
    );
  }

  return (
    <Card>
      <Link href="/register" className="text-sm text-text-secondary hover:text-saffron">
        ← Back
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-cream">Verify your Aadhaar</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Step 2 of 2 — Mock verification for demo
      </p>

      <div className="mt-8 space-y-6">
        <Input
          label="Enter last 4 digits of Aadhaar"
          placeholder="1234"
          maxLength={4}
          value={aadhaarLast4}
          onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          disabled={otpSent}
        />

        {!otpSent ? (
          <Button
            type="button"
            className="w-full"
            onClick={sendOtp}
            loading={sendingOtp}
            disabled={aadhaarLast4.length !== 4}
          >
            Send OTP
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-text-secondary">
              OTP sent to ****{aadhaarLast4}XXXXX
              {isRunning && (
                <span className="ml-2 text-saffron">Resend in {seconds}s</span>
              )}
              {!isRunning && seconds === 0 && (
                <button
                  type="button"
                  className="ml-2 text-teal hover:underline"
                  onClick={sendOtp}
                >
                  Resend OTP
                </button>
              )}
            </p>

            <div>
              <p className="mb-3 text-sm font-medium text-cream">Enter 6-digit OTP</p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 w-10 rounded-lg border border-border bg-surface-raised text-center text-lg font-bold text-cream focus:border-saffron/50 focus:outline-none focus:ring-1 focus:ring-saffron/30"
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-text-muted">Demo OTP: 123456</p>
            </div>

            {walletShown && (
              <p className="rounded-lg border border-teal/30 bg-teal/10 p-3 text-center text-sm text-teal">
                Wallet created: {truncateAddress(walletShown)} ✓
              </p>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={verifyAndRegister}
              loading={verifying}
              disabled={otp.join('').length !== 6}
            >
              Verify & Create Account
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
