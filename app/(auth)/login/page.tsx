'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { z } from 'zod';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error === 'CredentialsSignin' ? 'Invalid phone or password' : result.error);
        return;
      }

      const res = await fetch('/api/auth/session');
      const session = await res.json();
      const role = session?.user?.role?.toLowerCase() ?? 'worker';
      router.push(`/${role}/dashboard`);
      router.refresh();
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Link href="/" className="font-display text-xl font-bold text-saffron">
        KaarSetu
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-cream">Welcome back</h1>
      <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          label="Phone Number"
          placeholder="9876543210"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-saffron hover:underline">
          Register
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface-raised p-3 text-xs text-text-muted">
        <p className="font-medium text-text-secondary">Demo accounts</p>
        <p>Worker: 9876540001 / Worker@123</p>
        <p>Assessor: 9876543210 / Assess@123</p>
        <p>Employer: 9876541001 / Employer@123</p>
      </div>
    </Card>
  );
}
