'use client';

import { Modal } from '@/components/ui/modal';
import { useClipboard } from '@/hooks/use-clipboard';
import { formatDateTime, truncateAddress } from '@/lib/utils';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import { Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PolygonscanModalProps {
  open: boolean;
  onClose: () => void;
  txHash: string;
  blockNumber: number;
  tokenId: string;
  workerWallet: string;
  metadataHash: string;
  gasUsed?: string;
  gasPrice?: string;
  timestamp?: Date | string;
}

export function PolygonscanModal({
  open,
  onClose,
  txHash,
  blockNumber,
  tokenId,
  workerWallet,
  metadataHash,
  gasUsed = '73429',
  gasPrice = '0.0000023',
  timestamp = new Date(),
}: PolygonscanModalProps) {
  const { copy } = useClipboard();
  const ts = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  return (
    <Modal open={open} onClose={onClose} size="lg" className="!bg-[#111] !border-[#333]">
      <div className="p-0">
        <div className="flex items-center justify-between border-b border-[#333] bg-[#0d0d0d] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8247E5] text-xs font-bold text-white">
              P
            </div>
            <div>
              <span className="font-semibold text-white">PolygonScan</span>
              <span className="ml-2 rounded bg-[#8247E5]/30 px-1.5 py-0.5 text-[10px] text-[#c4a5ff]">
                Amoy Testnet
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 font-mono text-sm">
          <h3 className="text-base font-sans font-semibold text-white">Transaction Details</h3>

          <Row label="Tx Hash" value={txHash} onCopy={() => copy(txHash)} />
          <div className="flex gap-2">
            <span className="text-[#888] w-28 shrink-0">Status:</span>
            <span className="flex items-center gap-1 text-[#4ade80]">
              <span className="h-2 w-2 rounded-full bg-[#4ade80]" /> Success
            </span>
          </div>
          <Row label="Block" value={blockNumber.toLocaleString()} />
          <Row
            label="Timestamp"
            value={`${formatDistanceToNow(ts, { addSuffix: true })} (${formatDateTime(ts)})`}
          />
          <Row label="From" value={`${truncateAddress(CONTRACT_ADDRESS)} (Registry.sol)`} />
          <Row label="Interacted With" value="KaarSetuSBT.sol" />
          <Row label="" value={truncateAddress(CONTRACT_ADDRESS, 10, 6)} />

          <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-3">
            <p className="mb-2 font-sans text-xs font-semibold text-[#8247E5]">Token Transfer</p>
            <p className="text-xs text-[#ccc]">ERC-5192 Soulbound Token (KST)</p>
            <p className="mt-1 text-xs text-white">Token ID: #{tokenId}</p>
            <p className="text-xs text-[#888]">From: 0x000...0000 (Minted)</p>
            <p className="text-xs text-[#888]">To: {truncateAddress(workerWallet)} (Worker Wallet)</p>
          </div>

          <p className="text-xs text-[#888]">
            Gas Used: {gasUsed} | Gas Price: {gasPrice} MATIC
          </p>
          <p className="text-xs text-[#888]">Tx Fee: 0.000169 MATIC (~₹0.00089)</p>

          <div className="rounded border border-[#333] bg-[#0a0a0a] p-2 text-xs text-[#aaa]">
            <p className="text-[#666]">Input Data:</p>
            <p className="mt-1 break-all text-[#ccc]">
              mint({truncateAddress(workerWallet)}, &quot;{metadataHash.slice(0, 8)}...&quot;)
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Row({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="w-28 shrink-0 text-[#888]">{label}:</span>
      <span className="flex-1 break-all text-[#ccc]">{value}</span>
      {onCopy && (
        <button type="button" onClick={onCopy} className="text-[#8247E5] hover:text-[#a78bfa]">
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
