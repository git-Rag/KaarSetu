import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'KaarSetu — Skill Credentials for India\'s Workers',
  description:
    'Bridge India\'s informal workers to the formal economy with verified soulbound skill credentials.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-surface-base font-body antialiased">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              classNames: {
                toast: 'bg-surface-card border border-border text-cream',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
