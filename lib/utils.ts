import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm:ss');
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end + 2) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function truncateHash(hash: string, start = 8, end = 4): string {
  return truncateAddress(hash, start, end);
}

export function nsqfLevelToNumber(level: string): number {
  const match = level.match(/LEVEL_(\d)/);
  return match ? parseInt(match[1], 10) : 1;
}

export function nsqfLevelLabel(level: string): string {
  return `NSQF Level ${nsqfLevelToNumber(level)}`;
}

export function nsqfLevelFromNumber(n: number): string {
  return `LEVEL_${n}`;
}

export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function getVerifyUrl(tokenId: string): string {
  return `${getBaseUrl()}/verify/${tokenId}`;
}
