import type {
  NSQFLevel,
  Role,
  AssessmentStatus,
  TokenStatus,
} from '@prisma/client';

export type { Role, NSQFLevel, AssessmentStatus, TokenStatus };

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface CredentialTokenData {
  id: string;
  tokenId: string;
  txHash: string;
  blockNumber: number;
  trade: string;
  nsqfLevel: NSQFLevel;
  mintedAt: Date | string;
  status: TokenStatus;
  metadataHash: string;
  contractAddress: string;
}

export interface CredentialWorkerData {
  name: string;
  walletAddress: string;
  photoUrl?: string | null;
  city?: string;
  state?: string;
}

export interface CredentialAssessorData {
  name: string;
  itiName: string;
}

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  walletAddress: string;
  phone: string;
}
