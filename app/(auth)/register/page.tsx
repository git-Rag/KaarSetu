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

import { useTranslation } from '@/lib/i18n/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

type RegisterStep1Form = z.infer<typeof registerStep1Schema>;

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ROLES = [
    { value: 'WORKER' as const, label: t('landing.ctaFooter.roles.worker.title'), icon: HardHat, desc: t('landing.ctaFooter.roles.worker.desc') },
    { value: 'ASSESSOR' as const, label: t('landing.ctaFooter.roles.assessor.title'), icon: GraduationCap, desc: t('landing.ctaFooter.roles.assessor.desc') },
    { value: 'EMPLOYER' as const, label: t('landing.ctaFooter.roles.employer.title'), icon: Building2, desc: t('landing.ctaFooter.roles.employer.desc') },
  ];

  const stateOptions = [{ value: '', label: t('common.next') === 'आगे' ? 'राज्य चुनें' : 'Select state' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))];
  const tradeOptions = [{ value: '', label: t('common.next') === 'आगे' ? 'ट्रेड चुनें' : 'Select trade' }, ...TRADES.map((t) => ({ value: t.name, label: t.name }))];

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
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold text-saffron">
          KaarSetu
        </Link>
        <LanguageSwitcher />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-cream">{t('auth.register.title')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('auth.register.subtitle')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-cream">{t('auth.register.roleLabel')}</p>
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
                  <p className="mt-2 font-display font-bold text-cream leading-tight">{r.label}</p>
                  <p className="mt-1 text-[10px] leading-snug text-text-muted">{r.desc}</p>
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register('role')} />
        </div>

        <Input label={t('auth.register.nameLabel')} placeholder="Ramesh Yadav" {...register('name')} error={errors.name?.message} />
        <Input
          label={t('auth.login.phoneLabel')}
          placeholder="9876543210"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label={t('auth.login.passwordLabel')}
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label={t('common.next') === 'आगे' ? 'पासवर्ड कन्फर्म करें' : 'Confirm Password'}
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        {role === 'WORKER' && (
          <>
            <Select
              label={t('common.trade')}
              options={tradeOptions}
              {...register('trade')}
              error={errors.trade?.message}
            />
            <Select
              label={t('common.next') === 'आगे' ? 'राज्य' : 'State'}
              options={stateOptions}
              {...register('state')}
              error={errors.state?.message}
            />
            <Input label={t('common.next') === 'आगे' ? 'शहर' : 'City'} placeholder="Bhopal" {...register('city')} error={errors.city?.message} />
          </>
        )}

        {role === 'ASSESSOR' && (
          <>
            <Input
              label={t('common.next') === 'आगे' ? 'ITI का नाम' : 'ITI Name'}
              placeholder="Govt ITI Bhopal"
              {...register('itiName')}
              error={errors.itiName?.message}
            />
            <Input
              label={t('common.next') === 'आगे' ? 'ITI कोड' : 'ITI Code'}
              placeholder="MP-ITI-042"
              {...register('itiCode')}
              error={errors.itiCode?.message}
            />
            <Input
              label={t('common.next') === 'आगे' ? 'ज़िला' : 'District'}
              placeholder="Bhopal"
              {...register('district')}
              error={errors.district?.message}
            />
            <Select
              label={t('common.next') === 'आगे' ? 'राज्य' : 'State'}
              options={stateOptions}
              {...register('state')}
              error={errors.state?.message}
            />
          </>
        )}

        {role === 'EMPLOYER' && (
          <>
            <Input
              label={t('common.next') === 'आगे' ? 'कंपनी का नाम' : 'Company Name'}
              placeholder="Madhya Bharat Construction"
              {...register('companyName')}
              error={errors.companyName?.message}
            />
            <Input
              label={t('common.next') === 'आगे' ? 'GST नंबर (वैकल्पिक)' : 'GST Number (optional)'}
              placeholder="22AAAAA0000A1Z5"
              {...register('gstNumber')}
            />
            <Input label={t('common.next') === 'आगे' ? 'शहर' : 'City'} placeholder="Bhopal" {...register('city')} error={errors.city?.message} />
            <Select
              label={t('common.next') === 'आगे' ? 'राज्य' : 'State'}
              options={stateOptions}
              {...register('state')}
              error={errors.state?.message}
            />
          </>
        )}

        <Button type="submit" className="w-full" size="lg">
          {t('common.next')} →
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.register.hasAccount')}{' '}
        <Link href="/login" className="text-saffron hover:underline">
          {t('common.signIn')}
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
