import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    walletAddress: string;
    phone: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email?: string | null;
      role: Role;
      walletAddress: string;
      phone: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
    walletAddress: string;
    phone: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const phone = String(credentials.phone);
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: { phone },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.role === 'ASSESSOR') {
          const assessor = await prisma.assessorProfile.findUnique({
            where: { userId: user.id },
          });
          if (assessor && !assessor.isApproved) {
            throw new Error('Assessor account pending approval');
          }
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          walletAddress: user.walletAddress,
          phone: user.phone,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.walletAddress = user.walletAddress;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.walletAddress = token.walletAddress as string;
      session.user.phone = token.phone as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export function getRoleDashboardPath(role: Role): string {
  switch (role) {
    case 'WORKER':
      return '/worker/dashboard';
    case 'ASSESSOR':
      return '/assessor/dashboard';
    case 'EMPLOYER':
      return '/employer/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized' as const, session: null };
  if (!allowed.includes(session.user.role)) {
    return { error: 'Forbidden' as const, session: null };
  }
  return { error: null, session };
}
