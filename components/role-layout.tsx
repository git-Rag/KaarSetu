'use client';

import { motion } from 'framer-motion';
import { SidebarNav } from '@/components/sidebar-nav';
import { ErrorBoundary } from '@/components/error-boundary';
import type { Role } from '@prisma/client';

export function RoleLayout({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-base">
      <SidebarNav role={role} />
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </motion.div>
      </main>
    </div>
  );
}
