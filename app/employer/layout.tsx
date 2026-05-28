import { RoleLayout } from '@/components/role-layout';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="EMPLOYER">{children}</RoleLayout>;
}
