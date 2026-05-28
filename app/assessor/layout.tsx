import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RoleLayout } from '@/components/role-layout';

export default async function AssessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role !== 'ASSESSOR' && session.user.role !== 'ADMIN') {
    redirect(`/${session.user.role.toLowerCase()}/dashboard`);
  }

  return <RoleLayout role="ASSESSOR">{children}</RoleLayout>;
}
