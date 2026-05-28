import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { createMintResult } from '@/lib/mock-chain';
import { CONTRACT_ADDRESS } from '@/lib/constants';
import {
  calculatePracticalScore,
  normalizeChecklistData,
  resolveTradeForAssessment,
  isPassingScore,
} from '@/lib/assessment-scoring';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(['ASSESSOR']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        workerProfile: true,
        token: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const assessor = await prisma.assessorProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (assessor?.id !== assessment.assessorProfileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (assessment.status !== 'PASSED') {
      return NextResponse.json(
        { error: 'Assessment must be in PASSED state to mint' },
        { status: 400 }
      );
    }

    if (assessment.token) {
      return NextResponse.json({ error: 'Token already minted' }, { status: 409 });
    }

    const trade = resolveTradeForAssessment(assessment.trade);
    if (!trade) {
      return NextResponse.json({ error: 'Trade module not found' }, { status: 400 });
    }

    const checklistData = normalizeChecklistData(assessment.checklistData, trade);
    const score = calculatePracticalScore(checklistData, trade.checklist);

    if (!isPassingScore(score, trade)) {
      return NextResponse.json(
        { error: `Score ${score}% is below minimum ${trade.passingScore}% required to mint` },
        { status: 400 }
      );
    }

    if (score !== assessment.score) {
      await prisma.assessment.update({
        where: { id },
        data: { score },
      });
    }

    const mint = createMintResult();

    const token = await prisma.$transaction(async (tx) => {
      const sb = await tx.sBToken.create({
        data: {
          tokenId: mint.tokenId,
          txHash: mint.txHash,
          blockNumber: mint.blockNumber,
          contractAddress: CONTRACT_ADDRESS,
          workerProfileId: assessment.workerProfileId,
          ownerId: assessment.workerProfile.userId,
          assessmentId: assessment.id,
          trade: assessment.trade,
          nsqfLevel: assessment.nsqfLevel,
          metadataHash: mint.metadataHash,
        },
      });

      await tx.assessment.update({
        where: { id: assessment.id },
        data: { status: 'MINTED' },
      });

      return sb;
    });

    return NextResponse.json({
      data: {
        ...token,
        gasUsed: mint.gasUsed,
        effectiveGasPrice: mint.effectiveGasPrice,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Mint failed' }, { status: 500 });
  }
}
