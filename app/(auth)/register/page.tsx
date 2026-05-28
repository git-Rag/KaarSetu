'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerStep1Schema } from '@/lib/validations';
import { REGISTER_DRAFT_KEY } from '@/lib/constants';
import { INDIAN_STATES } from '@/lib/constants';
import { TRADES } from '@/lib/trades';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HardHat, GraduationCap, Building2 } from 'lucide-react';
import type { z } from 'zod';

type RegisterStep1Form = z.infer<typeof registerStep1Schema>;

const ROLES = [
  { value: 'WORKER' as const, label: 'Worker', icon: HardHat, desc: 'Get skill credentials' },
  { value: 'ASSESSOR' as const, label: 'Assessor', icon: GraduationCap, desc: 'ITI instructor' },
  { value: 'EMPLOYER' as const, label: 'Employer', icon: Building2, desc: 'Verify & attest' },
];

const stateOptions = [{ value: '', label: 'Select state' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))];
const tradeOptions = [{ value: '', label: 'Select trade' }, ...TRADES.map((t) => ({ value: t.name, label: t.name }))];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as RegisterStep1Form['role']) || 'WORKER';
  const [selectedRole, setSelectedRole] = useState<RegisterStep1Form['role']>(initialRole);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterStep1Form>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: { role: initialRole },
  });

  const role = watch('role');

  useEffect(() => {
    const param = searchParams.get('role') as RegisterStep1Form['role'] | null;
    if (param && ['WORKER', 'ASSESSOR', 'EMPLOYER'].includes(param)) {
      setSelectedRole(param);
      setValue('role', param);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole, setValue]);

  const onSubmit = (data: RegisterStep1Form) => {
    sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(data));
    router.push('/register/aadhaar');
  };

  return (
    <Card>
      <Link href="/" className="font-display text-xl font-bold text-saffron">
        KaarSetu
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-cream">Create your account</h1>
      <p className="mt-1 text-sm text-text-secondary">Step 1 of 2 — Basic information</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-cream">I am a...</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = selectedRole === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all duration-200',
                    active
                      ? 'border-saffron bg-saffron/10'
                      : 'border-border bg-surface-raised hover:border-border-bright'
                  )}
                >
                  <Icon className={cn('h-6 w-6', active ? 'text-saffron' : 'text-text-secondary')} />
                  <p className="mt-2 font-display font-bold text-cream">{r.label}</p>
                  <p className="text-xs text-text-muted">{r.desc}</p>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('role')} />
        </div>

        <Input label="Full Name" placeholder="Ramesh Yadav" {...register('name')} error={errors.name?.message} />
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
        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        {role === 'WORKER' && (
          <>
            <Select
              label="Trade"
              options={tradeOptions}
              {...register('trade')}
              error={errors.trade?.message}
            />
            <Select
              label="State"
              options={stateOptions}
              {...register('state')}
              error={errors.state?.message}
            />
            <Input label="City" placeholder="Bhopal" {...register('city')} error={errors.city?.message} />
          </>
        )}

        {role === 'ASSESSOR' && (
          <>
            <Input
              label="ITI Name"
              placeholder="Govt ITI Bhopal"
              {...register('itiName')}
              error={errors.itiName?.message}
            />
            <Input
              label="ITI Code"
              placeholder="MP-ITI-042"
              {...register('itiCode')}
              error={errors.itiCode?.message}
            />
            <Input
              label="District"
              placeholder="Bhopal"
              {...register('district')}
              error={errors.district?.message}
            />
            <Select
              label="State"
              options={stateOptions}
              {...register('state')}
              error={errors.state?.message}
            />
          </>
        )}

        {role === 'EMPLOYER' && (
          <>
            <Input
              label="Company Name"
              placeholder="Madhya Bharat Construction"
              {...register('companyName')}
              error={errors.companyName?.message}
            />
            <Input
              label="GST Number (optional)"
              placeholder="22AAAAA0000A1Z5"
              {...register('gstNumber')}
            />
            <Input label="City" placeholder="Bhopal" {...register('city')} error={errors.city?.message} />
            <Select
              label="State"
              options={stateOptions}
              {...register('state')}
              error={errors.state?.message}
            />
          </>
        )}

        <Button type="submit" className="w-full" size="lg">
          Continue →
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-saffron hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Card className="text-center text-text-secondary">
          <p>Loading...</p>
        </Card>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
