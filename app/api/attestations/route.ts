import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { attestationSchema } from '@/lib/validations';
import { createAttestationResult } from '@/lib/mock-chain';

export async function POST(request: Request) {
  try {
    const authCheck = await requireRole(['EMPLOYER']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error ?? 'Unauthorized' }, { status: 401 });
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!employer) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = attestationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const token = await prisma.sBToken.findFirst({
      where: {
        OR: [{ id: parsed.data.tokenId }, { tokenId: parsed.data.tokenId }],
        status: 'ACTIVE',
      },
    });

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const chain = createAttestationResult();

    const attestation = await prisma.attestation.create({
      data: {
        tokenId: token.id,
        givenByUserId: authCheck.session.user.id,
        employerProfileId: employer.id,
        projectName: parsed.data.projectName,
        projectDetails: parsed.data.projectDetails,
        durationMonths: parsed.data.durationMonths,
        rating: parsed.data.rating,
        txHash: chain.txHash,
        blockNumber: chain.blockNumber,
      },
      include: {
        employerProfile: true,
      },
    });

    return NextResponse.json({ data: attestation });
  } catch {
    return NextResponse.json({ error: 'Failed to create attestation' }, { status: 500 });
  }
}
