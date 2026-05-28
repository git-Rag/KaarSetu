const BLOCK_BASE = 47_382_910;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function randomHex(bytes: number): string {
  const chars = '0123456789abcdef';
  return Array.from({ length: bytes * 2 }, () =>
    chars[Math.floor(Math.random() * 16)]
  ).join('');
}

export function generateWalletAddress(): string {
  return '0x' + randomHex(20);
}

export function generateTxHash(): string {
  return '0x' + randomHex(32);
}

export function generateBlockNumber(): number {
  return BLOCK_BASE + Math.floor(Math.random() * 50_000);
}

export function generateTokenId(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

export function generateIpfsHash(): string {
  const base58chars =
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return (
    'Qm' +
    Array.from({ length: 44 }, () =>
      base58chars[Math.floor(Math.random() * base58chars.length)]
    ).join('')
  );
}

export interface MintResult {
  txHash: string;
  blockNumber: number;
  tokenId: string;
  metadataHash: string;
  gasUsed: string;
  effectiveGasPrice: string;
  timestamp: Date;
}

export type MintChainStatus =
  | 'idle'
  | 'broadcasting'
  | 'in_mempool'
  | 'mining'
  | 'confirming'
  | 'confirmed'
  | 'failed';

export const MINT_STATUS_LABELS: Record<MintChainStatus, string> = {
  idle: 'Ready',
  broadcasting: 'Broadcasting to Polygon PoS network...',
  in_mempool: 'Transaction in mempool — waiting for inclusion...',
  mining: 'Block being mined — ERC-5192 SBT minting...',
  confirming: 'Block confirmed — writing to token registry...',
  confirmed: 'Credential minted on-chain ✓',
  failed: 'Transaction failed',
};

export async function simulateMint(
  onStatusChange: (status: MintChainStatus) => void
): Promise<MintResult> {
  onStatusChange('broadcasting');
  await sleep(800);

  onStatusChange('in_mempool');
  await sleep(600 + Math.random() * 400);

  onStatusChange('mining');
  await sleep(1200 + Math.random() * 800);

  onStatusChange('confirming');
  await sleep(500);

  onStatusChange('confirmed');

  return {
    txHash: generateTxHash(),
    blockNumber: generateBlockNumber(),
    tokenId: generateTokenId(),
    metadataHash: generateIpfsHash(),
    gasUsed: String(Math.floor(Math.random() * 20000) + 60000),
    effectiveGasPrice: (0.000001 + Math.random() * 0.000002).toFixed(8),
    timestamp: new Date(),
  };
}

export async function simulateAttestation(
  onStatusChange: (status: MintChainStatus) => void
): Promise<{ txHash: string; blockNumber: number }> {
  onStatusChange('broadcasting');
  await sleep(600);
  onStatusChange('mining');
  await sleep(1500 + Math.random() * 500);
  onStatusChange('confirmed');
  return {
    txHash: generateTxHash(),
    blockNumber: generateBlockNumber(),
  };
}

export function createMintResult(): MintResult {
  return {
    txHash: generateTxHash(),
    blockNumber: generateBlockNumber(),
    tokenId: generateTokenId(),
    metadataHash: generateIpfsHash(),
    gasUsed: String(Math.floor(Math.random() * 20000) + 60000),
    effectiveGasPrice: (0.000001 + Math.random() * 0.000002).toFixed(8),
    timestamp: new Date(),
  };
}

export function createAttestationResult(): { txHash: string; blockNumber: number } {
  return {
    txHash: generateTxHash(),
    blockNumber: generateBlockNumber(),
  };
}
