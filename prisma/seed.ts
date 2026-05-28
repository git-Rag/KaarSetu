import { PrismaClient, NSQFLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 12);
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

  const admin = await prisma.user.create({
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

  const assessor2User = await prisma.user.create({
    data: {
      name: 'Sunita Rao',
      phone: '9876543211',
      passwordHash: await hash('Assess@123'),
      role: 'ASSESSOR',
      walletAddress: '0x8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      aadhaarVerified: true,
      aadhaarLast4: '7832',
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
    include: { assessorProfile: true },
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

  const employer2 = await prisma.user.create({
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
      aadhaarLast4: '1234',
      workerProfile: {
        create: { trade: 'Electrician', state: 'Madhya Pradesh', city: 'Bhopal' },
      },
    },
    include: { workerProfile: true },
  });

  const priya = await prisma.user.create({
    data: {
      name: 'Priya Kumari',
      phone: '9876540002',
      passwordHash: await hash('Worker@123'),
      role: 'WORKER',
      walletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Mason', state: 'Madhya Pradesh', city: 'Indore' },
      },
    },
    include: { workerProfile: true },
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
      walletAddress: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
      aadhaarVerified: true,
      workerProfile: {
        create: { trade: 'Painter & Decorator', state: 'Madhya Pradesh', city: 'Bhopal' },
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
        create: { trade: 'Welder', state: 'Madhya Pradesh', city: 'Sehore' },
      },
    },
    include: { workerProfile: true },
  });

  const assessor1 = assessor1User.assessorProfile!;
  const painterChecklist: Record<string, boolean> = {
    pt1: true, pt2: true, pt3: true, pt4: true, pt5: false,
    pt6: true, pt7: true, pt8: true, pt9: true, pt10: true,
  };

  const anitaAssessment = await prisma.assessment.create({
    data: {
      workerProfileId: anita.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Painter & Decorator',
      nsqfLevel: 'LEVEL_2' as NSQFLevel,
      status: 'PASSED',
      score: 92,
      checklistData: painterChecklist,
      evidenceUrls: [],
      notes: 'Strong practical skills demonstrated. Ready for minting.',
      assessedAt: new Date('2026-05-28'),
    },
  });

  const rameshAssess1 = await prisma.assessment.create({
    data: {
      workerProfileId: ramesh.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_2',
      status: 'MINTED',
      score: 88,
      checklistData: { e1: true, e2: true, e3: true, e4: true, e5: true, e6: true, e7: true, e8: false, e9: true, e10: true },
      evidenceUrls: [],
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
      assessmentId: rameshAssess1.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_2',
      metadataHash: 'QmX7T9K2mN4pR8sV1wY3zA5bC6dE7fG8hJ9kL0mN1pQ2rS3t',
      mintedAt: new Date('2026-05-15'),
    },
  });

  const rameshAssess2 = await prisma.assessment.create({
    data: {
      workerProfileId: ramesh.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_3',
      status: 'MINTED',
      score: 94,
      checklistData: { e1: true, e2: true, e3: true, e4: true, e5: true, e6: true, e7: true, e8: true, e9: true, e10: true },
      evidenceUrls: [],
      assessedAt: new Date('2026-05-21'),
    },
  });

  const token1043 = await prisma.sBToken.create({
    data: {
      tokenId: '1043',
      txHash: '0x8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      blockNumber: 47392518,
      workerProfileId: ramesh.workerProfile!.id,
      ownerId: ramesh.id,
      assessmentId: rameshAssess2.id,
      trade: 'Electrician',
      nsqfLevel: 'LEVEL_3',
      metadataHash: 'QmY8U0L3nO5qS9tW2xZ4aB7cD8eF9gH0jK1lM2nP3qR4sT5u',
      mintedAt: new Date('2026-05-22'),
    },
  });

  const priyaAssess = await prisma.assessment.create({
    data: {
      workerProfileId: priya.workerProfile!.id,
      assessorProfileId: assessor2User.assessorProfile!.id,
      trade: 'Mason',
      nsqfLevel: 'LEVEL_2',
      status: 'MINTED',
      score: 85,
      checklistData: { m1: true, m2: true, m3: true, m4: true, m5: true, m6: true, m7: false, m8: true, m9: false, m10: true },
      evidenceUrls: [],
      assessedAt: new Date('2026-05-10'),
    },
  });

  await prisma.sBToken.create({
    data: {
      tokenId: '1044',
      txHash: '0x9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      blockNumber: 47389876,
      workerProfileId: priya.workerProfile!.id,
      ownerId: priya.id,
      assessmentId: priyaAssess.id,
      trade: 'Mason',
      nsqfLevel: 'LEVEL_2',
      metadataHash: 'QmZ9V1M4oP6rT0uX3yA5bC7dE8fG9hI0jK2lN3oQ4rS5tU6v',
      mintedAt: new Date('2026-05-11'),
    },
  });

  const sureshAssess = await prisma.assessment.create({
    data: {
      workerProfileId: suresh.workerProfile!.id,
      assessorProfileId: assessor1.id,
      trade: 'Plumber',
      nsqfLevel: 'LEVEL_2',
      status: 'MINTED',
      score: 90,
      checklistData: { p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true, p8: false, p9: false, p10: true },
      evidenceUrls: [],
      assessedAt: new Date('2026-05-18'),
    },
  });

  const token1045 = await prisma.sBToken.create({
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
    admin: admin.phone,
    assessors: [assessor1User.phone, assessor2User.phone],
    workers: [ramesh.phone, anita.phone],
    anitaAssessment: anitaAssessment.id,
    tokens: ['1042', '1043', '1044', '1045'],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
