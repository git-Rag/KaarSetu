'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  ArrowRight,
  ScanLine,
  Award,
  Users,
  ChevronRight,
} from 'lucide-react';
import { StatsCounter } from '@/components/stats-counter';
import { CredentialCard } from '@/components/credential-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TRADES } from '@/lib/trades';
import { useTranslation } from '@/lib/i18n/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

const DEMO_CREDENTIAL = {
  token: {
    tokenId: '1042',
    txHash: '0x7f3a2b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    blockNumber: 47391042,
    trade: 'Electrician',
    nsqfLevel: 'LEVEL_2' as const,
    mintedAt: '2026-05-29',
    status: 'ACTIVE' as const,
    metadataHash: 'Qm4xT7kP9nR2wL8vY3bN6mJ1sF5hD0cA4eG7iU2oP',
  },
  worker: {
    name: 'Ramesh Yadav',
    walletAddress: '0x7f3a8b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    photoUrl: null,
  },
  assessor: {
    name: 'Priya Sharma',
    itiName: 'Govt ITI Bhopal',
  },
};

const STEPS = [
  {
    num: '01',
    title: 'ASSESS',
    color: 'text-teal border-teal/40 bg-teal/10',
    desc: 'Practical skill test at a registered ITI. No theory papers — real tools, real tasks.',
  },
  {
    num: '02',
    title: 'MINT',
    color: 'text-saffron border-saffron/40 bg-saffron/10',
    desc: 'Soulbound Token minted on Polygon. Non-transferable proof that lives forever on-chain.',
  },
  {
    num: '03',
    title: 'ATTEST',
    color: 'text-indigo border-indigo/40 bg-indigo/10',
    desc: 'Employers add work history. Reputation layer that travels with the worker.',
  },
];

const WORKER_PAIN = [
  'No portable proof of skills across cities',
  'Fake certificates accepted everywhere',
  'Wages stuck at unskilled rates',
  'Lost paperwork when migrating for work',
];

const CONTRACTOR_PAIN = [
  'Cannot verify worker skills on-site',
  'High cost of failed hires and rework',
  'No trusted record of past projects',
  'Compliance risk on government contracts',
];

const ROLES = [
  {
    role: 'WORKER',
    title: 'I am a Worker',
    desc: 'Get assessed, earn your credential, unlock better wages.',
    href: '/register?role=WORKER',
    accent: 'border-saffron/40 hover:border-saffron hover:shadow-[0_0_30px_rgba(255,107,0,0.12)]',
  },
  {
    role: 'ASSESSOR',
    title: 'I am an Assessor',
    desc: 'ITI instructors certify skills with structured checklists.',
    href: '/register?role=ASSESSOR',
    accent: 'border-teal/40 hover:border-teal hover:shadow-[0_0_30px_rgba(0,191,165,0.12)]',
  },
  {
    role: 'EMPLOYER',
    title: 'I am an Employer',
    desc: 'Scan QR codes, verify instantly, attest work history.',
    href: '/register?role=EMPLOYER',
    accent: 'border-indigo/40 hover:border-indigo hover:shadow-[0_0_30px_rgba(92,107,192,0.12)]',
  },
];

export default function LandingPage() {
  const { t } = useTranslation();

  const STEPS = [
    {
      num: '01',
      title: t('landing.howItWorks.steps.assess.title'),
      color: 'text-teal border-teal/40 bg-teal/10',
      desc: t('landing.howItWorks.steps.assess.desc'),
    },
    {
      num: '02',
      title: t('landing.howItWorks.steps.mint.title'),
      color: 'text-saffron border-saffron/40 bg-saffron/10',
      desc: t('landing.howItWorks.steps.mint.desc'),
    },
    {
      num: '03',
      title: t('landing.howItWorks.steps.attest.title'),
      color: 'text-indigo border-indigo/40 bg-indigo/10',
      desc: t('landing.howItWorks.steps.attest.desc'),
    },
  ];

  const ROLES = [
    {
      role: 'WORKER',
      title: t('landing.ctaFooter.roles.worker.title'),
      desc: t('landing.ctaFooter.roles.worker.desc'),
      href: '/register?role=WORKER',
      accent: 'border-saffron/40 hover:border-saffron hover:shadow-[0_0_30px_rgba(255,107,0,0.12)]',
    },
    {
      role: 'ASSESSOR',
      title: t('landing.ctaFooter.roles.assessor.title'),
      desc: t('landing.ctaFooter.roles.assessor.desc'),
      href: '/register?role=ASSESSOR',
      accent: 'border-teal/40 hover:border-teal hover:shadow-[0_0_30px_rgba(0,191,165,0.12)]',
    },
    {
      role: 'EMPLOYER',
      title: t('landing.ctaFooter.roles.employer.title'),
      desc: t('landing.ctaFooter.roles.employer.desc'),
      href: '/register?role=EMPLOYER',
      accent: 'border-indigo/40 hover:border-indigo hover:shadow-[0_0_30px_rgba(92,107,192,0.12)]',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-base">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-surface-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold text-saffron">
            KaarSetu
          </Link>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher className="hidden md:flex" />
            <Link
              href="/verify/1042"
              className="text-sm text-text-secondary transition-colors hover:text-cream"
            >
              {t('common.verify')}
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('common.signIn')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t('common.getStarted')}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 pt-24">
        <div className="pointer-events-none absolute inset-0 grid-hero" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl font-display text-5xl font-extrabold leading-tight text-cream md:text-7xl"
          >
            {t('landing.hero.title1')}
            <br />
            <span className="text-saffron">{t('landing.hero.title2')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 max-w-2xl text-lg text-text-secondary md:text-xl"
          >
            {t('landing.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/register?role=WORKER">
              <Button size="lg">{t('landing.hero.ctaPrimary')}</Button>
            </Link>
            <Link href="/verify/1042">
              <Button size="lg" variant="outline">
                <ScanLine className="h-4 w-4" />
                {t('landing.hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-20 grid grid-cols-2 gap-8 border-t border-border pt-12 md:grid-cols-4"
          >
            <StatsCounter value={450} suffix="M" label={t('landing.stats.workers')} />
            <StatsCounter value={50} suffix="%" prefix="40–" label={t('landing.stats.premium')} numeric={false} />
            <StatsCounter value={0.001} prefix="₹" label={t('landing.stats.cost')} numeric={false} />
            <StatsCounter value={3} suffix="s" label={t('landing.stats.time')} numeric={false} />
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-cream md:text-4xl">
            {t('landing.problem.title')}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-saffron/30 bg-surface-card">
              <div className="mb-4 flex items-center gap-2 text-saffron">
                <Users className="h-5 w-5" />
                <span className="font-display text-sm font-bold uppercase tracking-wide">
                  {t('landing.problem.workerPain')}
                </span>
              </div>
              <ul className="space-y-4 text-text-secondary">
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />No portable proof of skills across cities</li>
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />Fake certificates accepted everywhere</li>
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />Wages stuck at unskilled rates</li>
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />Lost paperwork when migrating for work</li>
              </ul>
            </Card>
            <Card className="border-red-err/30 bg-surface-card">
              <div className="mb-4 flex items-center gap-2 text-red-err">
                <Building2 className="h-5 w-5" />
                <span className="font-display text-sm font-bold uppercase tracking-wide">
                  {t('landing.problem.contractorPain')}
                </span>
              </div>
              <ul className="space-y-4 text-text-secondary">
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-err" />Cannot verify worker skills on-site</li>
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-err" />High cost of failed hires and rework</li>
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-err" />No trusted record of past projects</li>
                <li className="flex gap-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-err" />Compliance risk on government contracts</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface-card/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-cream">
            {t('landing.howItWorks.title')}
          </h2>
          <div className="mt-12 flex flex-col items-stretch gap-6 md:flex-row md:items-center">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex flex-1 items-center gap-4">
                <Card className={`flex-1 border ${step.color}`}>
                  <p className="font-display text-4xl font-extrabold opacity-30">{step.num}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{step.desc}</p>
                </Card>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden h-8 w-8 shrink-0 text-border-bright md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credential preview */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl font-bold text-cream">
            {t('landing.credentialPreview.title')}
          </h2>
          <p className="mt-4 text-text-secondary">
            {t('landing.credentialPreview.subtitle')}
          </p>
          <div className="mt-12 flex justify-center">
            <CredentialCard
              token={DEMO_CREDENTIAL.token}
              worker={DEMO_CREDENTIAL.worker}
              assessor={DEMO_CREDENTIAL.assessor}
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Trade grid */}
      <section className="border-t border-border bg-surface-card/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-cream">
            {t('landing.trades.title')}
          </h2>
          <p className="mt-4 text-center text-text-secondary">
            {t('landing.trades.subtitle')}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRADES.map((trade) => (
              <motion.div
                key={trade.id}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-border bg-surface-card p-6 transition-all duration-200 hover:border-saffron/40 hover:shadow-[0_0_30px_rgba(255,107,0,0.08)]"
              >
                <span className="text-3xl">{trade.icon}</span>
                <h3 className="mt-3 font-display font-bold text-cream">{trade.name}</h3>
                <p className="mt-1 text-xs text-text-muted">{trade.sector}</p>
                <p className="mt-3 text-sm text-teal">
                  NSQF L{trade.nsqfLevels[0]}–L{trade.nsqfLevels[trade.nsqfLevels.length - 1]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl font-bold text-cream md:text-4xl">
            {t('landing.ctaFooter.title1')}
            <br />
            <span className="text-saffron">{t('landing.ctaFooter.title2')}</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {ROLES.map((r) => (
              <Link key={r.role} href={r.href}>
                <Card
                  className={`h-full text-left transition-all duration-200 ${r.accent}`}
                >
                  <Award className="h-8 w-8 text-saffron" />
                  <h3 className="mt-4 font-display text-lg font-bold text-cream">{r.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{r.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-saffron">
                    {t('common.register')} <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted">
        <p>{t('landing.footer.tagline')}</p>
        <p className="mt-1">{t('landing.footer.builtFor')}</p>
      </footer>
    </div>
  );
}
