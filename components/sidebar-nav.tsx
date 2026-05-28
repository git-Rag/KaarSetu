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

const NAV_ITEMS: Record<
  Role,
  { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  WORKER: [
    { href: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/worker/tests', label: 'Skill Tests', icon: FlaskConical },
    { href: '/worker/credentials', label: 'Credentials', icon: Award },
    { href: '/worker/profile', label: 'Profile', icon: User },
    { href: '/worker/jobs', label: 'Jobs', icon: Briefcase },
  ],
  ASSESSOR: [
    { href: '/assessor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assessor/assess', label: 'Assess', icon: ClipboardCheck },
    { href: '/assessor/history', label: 'History', icon: History },
  ],
  EMPLOYER: [
    { href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employer/verify', label: 'Verify', icon: ScanLine },
    { href: '/employer/workers', label: 'Workers', icon: Users },
  ],
  ADMIN: [{ href: '/admin/dashboard', label: 'Dashboard', icon: Shield }],
};

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface-card">
      <div className="border-b border-border p-6">
        <Link href="/" className="font-display text-xl font-bold text-saffron">
          KaarSetu
        </Link>
        <p className="mt-1 text-xs text-text-secondary capitalize">{role.toLowerCase()} portal</p>
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
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-cream"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
