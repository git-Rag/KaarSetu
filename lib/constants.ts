import type { NSQFLevel } from '@prisma/client';

export const NSQF_LEVELS: { value: NSQFLevel; label: string; number: number }[] = [
  { value: 'LEVEL_1', label: 'NSQF Level 1', number: 1 },
  { value: 'LEVEL_2', label: 'NSQF Level 2', number: 2 },
  { value: 'LEVEL_3', label: 'NSQF Level 3', number: 3 },
  { value: 'LEVEL_4', label: 'NSQF Level 4', number: 4 },
  { value: 'LEVEL_5', label: 'NSQF Level 5', number: 5 },
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
];

export const CONTRACT_ADDRESS = '0x4a3eE5B3bE3DF7Aa4d3c88FAB1e9C8B2f7D6A19e';

export const REGISTER_DRAFT_KEY = 'kaarsetu_register_draft';

export const RECENT_VERIFICATIONS_KEY = 'kaarsetu_recent_verifications';

export const ROLE_ROUTES: Record<string, string> = {
  WORKER: '/dashboard',
  ASSESSOR: '/dashboard',
  EMPLOYER: '/dashboard',
  ADMIN: '/dashboard',
};

export const ROLE_DASHBOARD_PREFIX: Record<string, string> = {
  WORKER: '',
  ASSESSOR: '',
  EMPLOYER: '',
  ADMIN: '',
};
