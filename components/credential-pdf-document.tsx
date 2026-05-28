import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { nsqfLevelLabel } from '@/lib/utils';
import type { NSQFLevel } from '@prisma/client';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#0F0F0F' },
  title: { fontSize: 24, color: '#FF6B00', marginBottom: 8 },
  subtitle: { fontSize: 12, color: '#888', marginBottom: 24 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 120, fontSize: 10, color: '#888' },
  value: { flex: 1, fontSize: 10, color: '#F5F0E8' },
  badge: {
    backgroundColor: '#00BFA5',
    color: '#000',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
});

interface CredentialPdfDocumentProps {
  workerName: string;
  trade: string;
  nsqfLevel: NSQFLevel;
  tokenId: string;
  txHash: string;
  blockNumber: number;
  assessorIti: string;
  mintedAt: string;
  walletAddress: string;
}

export function CredentialPdfDocument({
  workerName,
  trade,
  nsqfLevel,
  tokenId,
  txHash,
  blockNumber,
  assessorIti,
  mintedAt,
  walletAddress,
}: CredentialPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>KaarSetu Skill Credential</Text>
        <Text style={styles.subtitle}>ERC-5192 Soulbound Token — Polygon Amoy</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Worker</Text>
          <Text style={styles.value}>{workerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trade</Text>
          <Text style={styles.value}>{trade}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NSQF Level</Text>
          <Text style={styles.value}>{nsqfLevelLabel(nsqfLevel)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Token ID</Text>
          <Text style={styles.value}>#{tokenId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tx Hash</Text>
          <Text style={styles.value}>{txHash}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Block</Text>
          <Text style={styles.value}>#{blockNumber.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Wallet</Text>
          <Text style={styles.value}>{walletAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Certified by</Text>
          <Text style={styles.value}>{assessorIti}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Minted</Text>
          <Text style={styles.value}>{mintedAt}</Text>
        </View>

        <Text style={styles.badge}>VERIFIED ON-CHAIN</Text>
      </Page>
    </Document>
  );
}
