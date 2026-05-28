import { PrismaClient, NSQFLevel, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TRADE_MAP } from '../lib/trades';
import {
  buildSeedChecklist,
  calculatePracticalScore,
  type TaskResultValue,
} from '../lib/assessment-scoring';

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

function scoreFor(tradeId: string, marks: Record<string, TaskResultValue>) {
  const trade = TRADE_MAP[tradeId];
  const data = buildSeedChecklist(trade, marks);
  return calculatePracticalScore(data, trade.checklist);
}

async function main() {
  await prisma.attestation.deleteMany();
  await prisma.sBToken.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.sessionLog.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.assessorProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: 'Arjun Sharma',
      phone: '9999000000',
      passwordHash: await hash('Admin@123'),
      role: 'ADMIN',
      walletAddress: '0x4a3eE5B3bE3DF7Aa4d3c88FAB1e9C8B2f7D6A19f',
      aadhaarVerified: true,
      aadhaarLast4: '0000',
    },
  });

  const assessor1User = await prisma.user.create({
    data: {
      name: 'Dr. Pradeep Mishra',
      phone: '9876543210',
      passwordHash: await hash('Assess@123'),
      role: 'ASSESSOR',
      walletAddress: '0x7f3a2b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
      aadhaarVerified: true,
      aadhaarLast4: '4521',
      assessorProfile: {
        create: {
          itiName: 'ITI Bhopal',
          itiCode: 'ITI-BPL-001',
          district: 'Bhopal',
          state: 'Madhya Pradesh',
          isApproved: true,
        },
      },
    },
    include: { assessorProfile: true },
  });

  await prisma.user.create({
    data: {
      name: 'Sunita Rao',
      phone: '9876543211',
      passwordHash: await hash('Assess@123'),
      role: 'ASSESSOR',
      walletAddress: '0x8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      aadhaarVerified: true,
      assessorProfile: {
        create: {
          itiName: 'ITI Indore',
          itiCode: 'ITI-IDR-007',
          district: 'Indore',
          state: 'Madhya Pradesh',
          isApproved: true,
        },
      },
    },
  });

  const employer1 = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      phone: '9876541001',
      passwordHash: await hash('Employer@123'),
      role: 'EMPLOYER',
      walletAddress: '0x9a1e2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      aadhaarVerified: true,
      employerProfile: {
        create: {
          companyName: 'Madhya Bharat Construction Pvt Ltd',
          city: 'Bhopal',
          state: 'Madhya Pradesh',
        },
      },
    },
    include: { employerProfile: true },
  });

  await prisma.user.create({
    data: {
      name: 'Meera Joshi',
      phone: '9876541002',
      passwordHash: await hash('Employer@123'),
      role: 'EMPLOYER',
      walletAddress: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      aadhaarVerified: true,
      employerProfile: {
        create: {
          companyName: 'Central India Infrastructure',
          city: 'Indore',
          state: 'Madhya Pradesh',
        },
      },
    },
  });

  const ramesh = await prisma.user.create({
    data: {
      name: 'Ramesh Yadav',
      phone: '9876540001',
      passwordHash: await hash('Worker@123'),
      role: 'WORKER',
      walletAddress: '0x7f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Electrician', state: 'Madhya Pradesh', city: 'Bhopal' },
      },
    },
    include: { workerProfile: true },
  });

  await prisma.user.create({
    data: {
      name: 'Priya Kumari',
      phone: '9876540002',
      passwordHash: await hash('Worker@123'),
      role: 'WORKER',
      walletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Painter', state: 'Madhya Pradesh', city: 'Indore' },
      },
    },
  });

  const suresh = await prisma.user.create({
    data: {
      name: 'Suresh Patel',
      phone: '9876540003',
      passwordHash: await hash('Worker@123'),
      role: 'WORKER',
      walletAddress: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Plumber', state: 'Madhya Pradesh', city: 'Bhopal' },
      },
    },
    include: { workerProfile: true },
  });

  const anita = await prisma.user.create({
    data: {
      name: 'Anita Devi',
      phone: '9876540004',
      passwordHash: await hash('Worker@123'),
      role: 'WORKER',
      walletAddress: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Painter', state: 'Madhya Pradesh', city: 'Bhopal' },
      },
    },
    include: { workerProfile: true },
  });

  const kiran = await prisma.user.create({
    data: {
      name: 'Kiran Verma',
      phone: '9876540005',
      passwordHash: await hash('Worker@123'),
      role: 'WORKER',
      walletAddress: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Electrician', state: 'Madhya Pradesh', city: 'Sehore' },
      },
    },
    include: { workerProfile: true },
  });

  const assessor1 = assessor1User.assessorProfile!;

  const electricianMarks: Record<string, TaskResultValue> = {
    e1: 'PASS',
    e2: 'PASS',
    e3: 'PASS',
    e4: 'PASS',
    e5: 'PASS',
    e6: 'PASS',
    e7: 'PARTIAL',
    e8: 'PASS',
  };
  const electricianChecklist = buildSeedChecklist(TRADE_MAP.electrician, electricianMarks);
  const electricianScore = scoreFor('electrician', electricianMarks);

  const painterMarks: Record<string, TaskResultValue> = {
    pt1: 'PASS',
    pt2: 'PASS',
    pt3: 'PASS',
    pt4: 'PASS',
    pt5: 'PASS',
    pt6: 'PASS',
    pt7: 'PASS',
    pt8: 'PARTIAL',
  };
  const painterChecklist = buildSeedChecklist(TRADE_MAP.painter, painterMarks);
  const painterScore = scoreFor('painter', painterMarks);

  const plumberMarks: Record<string, TaskResultValue> = {
    p1: 'PASS',
    p2: 'PASS',
    p3: 'PASS',
    p4: 'PASS',
    p5: 'PASS',
    p6: 'PASS',
    p7: 'PARTIAL',
    p8: 'PASS',
  };
  const plumberChecklist = buildSeedChecklist(TRADE_MAP.plumber, plumberMarks);
  const plumberScore = scoreFor('plumber', plumberMarks);

  const kiranFailMarks: Record<string, TaskResultValue> = {
    e1: 'PASS',
    e2: 'PARTIAL',
    e3: 'FAIL',
    e4: 'FAIL',
    e5: 'PARTIAL',
    e6: 'FAIL',
    e7: 'FAIL',
    e8: 'PASS',
  };
  const kiranFailChecklist = buildSeedChecklist(TRADE_MAP.electrician, kiranFailMarks);
  const kiranFailScore = scoreFor('electrician', kiranFailMarks);

  await prisma.assessment.create({
    data: {
      workerProfileId: anita.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Painter',
      nsqfLevel: 'LEVEL_2' as NSQFLevel,
      status: 'PASSED',
      score: painterScore,
      checklistData: painterChecklist as unknown as Prisma.InputJsonValue,
      evidenceUrls: [],
      notes: 'Excellent surface prep and roller technique. Ready for SBT minting.',
      assessedAt: new Date('2026-05-28'),
    },
  });

  const rameshAssess = await prisma.assessment.create({
    data: {
      workerProfileId: ramesh.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_2',
      status: 'MINTED',
      score: electricianScore,
      checklistData: electricianChecklist as unknown as Prisma.InputJsonValue,
      evidenceUrls: [],
      notes: 'Solid domestic wiring practical.',
      assessedAt: new Date('2026-05-14'),
    },
  });

  await prisma.sBToken.create({
    data: {
      tokenId: '1042',
      txHash: '0x7f3a2b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
      blockNumber: 47391042,
      workerProfileId: ramesh.workerProfile!.id,
      ownerId: ramesh.id,
      assessmentId: rameshAssess.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_2',
      metadataHash: 'QmX7T9K2mN4pR8sV1wY3zA5bC6dE7fG8hJ9kL0mN1pQ2rS3t',
      mintedAt: new Date('2026-05-15'),
    },
  });

  const sureshAssess = await prisma.assessment.create({
    data: {
      workerProfileId: suresh.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Plumber',
      nsqfLevel: 'LEVEL_2',
      status: 'MINTED',
      score: plumberScore,
      checklistData: plumberChecklist as unknown as Prisma.InputJsonValue,
      evidenceUrls: [],
      assessedAt: new Date('2026-05-18'),
    },
  });

  await prisma.sBToken.create({
    data: {
      tokenId: '1045',
      txHash: '0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
      blockNumber: 47391234,
      workerProfileId: suresh.workerProfile!.id,
      ownerId: suresh.id,
      assessmentId: sureshAssess.id,
      trade: 'Plumber',
      nsqfLevel: 'LEVEL_2',
      metadataHash: 'QmA0W2N5pQ7sU1vY4zB6cD8eF9gH0iJ1kL2mN3oP4qR5sT6uV7w',
      mintedAt: new Date('2026-05-19'),
    },
  });

  await prisma.assessment.create({
    data: {
      workerProfileId: kiran.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_2',
      status: 'FAILED',
      score: kiranFailScore,
      checklistData: kiranFailChecklist as unknown as Prisma.InputJsonValue,
      evidenceUrls: [],
      notes: 'Failed switchboard wiring and fault detection tasks. Recommend retraining.',
      assessedAt: new Date('2026-05-25'),
    },
  });

  const token1042 = await prisma.sBToken.findUnique({ where: { tokenId: '1042' } });
  if (token1042 && employer1.employerProfile) {
    await prisma.attestation.create({
      data: {
        tokenId: token1042.id,
        givenByUserId: employer1.id,
        employerProfileId: employer1.employerProfile.id,
        projectName: 'Ashoka Colony Rewiring',
        projectDetails: 'Complete rewiring of 24 residential units including MCB panel upgrade.',
        durationMonths: 3,
        rating: 5,
        txHash: '0x9a1e2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
        blockNumber: 47391500,
        attestedAt: new Date('2026-05-20'),
      },
    });
  }

  console.log('Seed complete:', {
    painterAnita: { score: painterScore, phone: anita.phone },
    electricianRamesh: { token: '1042', score: electricianScore },
    plumberSuresh: { token: '1045', score: plumberScore },
    failedKiran: { score: kiranFailScore, phone: kiran.phone },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
