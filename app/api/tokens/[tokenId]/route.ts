import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { tokenRevokeSchema } from '@/lib/validations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    const token = await prisma.sBToken.findFirst({
      where: {
        OR: [{ tokenId }, { id: tokenId }],
      },
      include: {
        workerProfile: {
          include: {
            user: {
              select: {
                name: true,
                walletAddress: true,
                avatarUrl: true,
              },
            },
          },
        },
        assessment: {
          include: {
            assessorProfile: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        attestations: {
          include: {
            employerProfile: true,
            givenByUser: { select: { name: true } },
          },
          orderBy: { attestedAt: 'desc' },
        },
      },
    });

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const data = {
      token: {
        id: token.id,
        tokenId: token.tokenId,
        txHash: token.txHash,
        blockNumber: token.blockNumber,
        trade: token.trade,
        nsqfLevel: token.nsqfLevel,
        mintedAt: token.mintedAt,
        status: token.status,
        metadataHash: token.metadataHash,
        contractAddress: token.contractAddress,
        evidenceUrls: token.assessment.evidenceUrls,
        checklistData: token.assessment.checklistData,
        score: token.assessment.score,
      },
      worker: {
        name: token.workerProfile.user.name,
        walletAddress: token.workerProfile.user.walletAddress,
        photoUrl: token.workerProfile.photoUrl ?? token.workerProfile.user.avatarUrl,
        city: token.workerProfile.city,
        state: token.workerProfile.state,
        trade: token.workerProfile.trade,
      },
      assessor: {
        name: token.assessment.assessorProfile.user.name,
        itiName: token.assessment.assessorProfile.itiName,
      },
      attestations: token.attestations.map((a) => ({
        id: a.id,
        projectName: a.projectName,
        projectDetails: a.projectDetails,
        durationMonths: a.durationMonths,
        rating: a.rating,
        attestedAt: a.attestedAt,
        txHash: a.txHash,
        employerName: a.employerProfile.companyName,
      })),
    };

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tokenId } = await params;
    const body = await request.json();
    const parsed = tokenRevokeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const token = await prisma.sBToken.update({
      where: { tokenId },
      data: {
        status: 'REVOKED',
        revokeReason: parsed.data.revokeReason,
      },
    });

    return NextResponse.json({ data: token });
  } catch {
    return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 });
  }
}
