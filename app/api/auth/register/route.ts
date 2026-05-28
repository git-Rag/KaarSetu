import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { generateWalletAddress } from '@/lib/mock-chain';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`register:${ip}`, 10, 60_000);
    if (!limited.success) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const walletAddress = generateWalletAddress();

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          passwordHash,
          role: data.role,
          walletAddress,
          aadhaarVerified: true,
          aadhaarLast4: data.aadhaarLast4,
        },
      });

      if (data.role === 'WORKER' && data.trade && data.state && data.city) {
        await tx.workerProfile.create({
          data: {
            userId: created.id,
            trade: data.trade,
            state: data.state,
            city: data.city,
          },
        });
      }

      if (data.role === 'ASSESSOR' && data.itiName && data.itiCode && data.district && data.state) {
        await tx.assessorProfile.create({
          data: {
            userId: created.id,
            itiName: data.itiName,
            itiCode: data.itiCode,
            district: data.district,
            state: data.state,
            isApproved: false,
          },
        });
      }

      if (data.role === 'EMPLOYER' && data.companyName && data.city && data.state) {
        await tx.employerProfile.create({
          data: {
            userId: created.id,
            companyName: data.companyName,
            gstNumber: data.gstNumber,
            city: data.city,
            state: data.state,
          },
        });
      }

      return created;
    });

    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({
      data: {
        id: safeUser.id,
        name: safeUser.name,
        phone: safeUser.phone,
        role: safeUser.role,
        walletAddress: safeUser.walletAddress,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
