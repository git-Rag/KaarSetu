'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Award,
  User,
  Briefcase,
  ClipboardCheck,
  History,
  ScanLine,
  Users,
  LogOut,
  Shield,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@prisma/client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

export function SidebarNav({ role }: { role: Role }) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const NAV_ITEMS: Record<
    Role,
    { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
  > = {
    WORKER: [
      { href: '/worker/dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
      { href: '/worker/tests', label: t('nav.skillTests'), icon: FlaskConical },
      { href: '/worker/credentials', label: t('nav.credentials'), icon: Award },
      { href: '/worker/profile', label: t('common.profile'), icon: User },
      { href: '/worker/jobs', label: t('nav.jobs'), icon: Briefcase },
    ],
    ASSESSOR: [
      { href: '/assessor/dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
      { href: '/assessor/assess', label: t('nav.assess'), icon: ClipboardCheck },
      { href: '/assessor/history', label: t('nav.history'), icon: History },
    ],
    EMPLOYER: [
      { href: '/employer/dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
      { href: '/employer/verify', label: t('common.verify'), icon: ScanLine },
      { href: '/employer/workers', label: t('nav.workers'), icon: Users },
    ],
    ADMIN: [{ href: '/admin/dashboard', label: t('common.dashboard'), icon: Shield }],
  };

  const items = NAV_ITEMS[role] ?? [];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface-card">
      <div className="border-b border-border p-6">
        <Link href="/" className="font-display text-xl font-bold text-saffron">
          KaarSetu
        </Link>
        <p className="mt-1 text-xs text-text-secondary capitalize">
          {t(`nav.${role.toLowerCase() as any}`)}
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                active
                  ? 'border border-saffron/30 bg-saffron/10 text-saffron'
                  : 'text-text-secondary hover:border hover:border-border-bright hover:bg-surface-hover hover:text-cream'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-4 border-t border-border p-4">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-cream"
        >
          <LogOut className="h-4 w-4" />
          {t('common.signOut')}
        </button>
      </div>
    </aside>
  );
}
