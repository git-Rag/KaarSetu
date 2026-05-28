import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { requireRole } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`upload:${ip}`, 10, 60_000);
    if (!limited.success) {
      return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
    }

    const authCheck = await requireRole(['ASSESSOR']);
    if (authCheck.error || !authCheck.session) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const assessor = await prisma.assessorProfile.findUnique({
      where: { userId: authCheck.session.user.id },
    });
    if (!assessor) {
      return NextResponse.json({ error: 'Assessor profile not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const assessmentId = formData.get('assessmentId') as string;
    if (!assessmentId) {
      return NextResponse.json({ error: 'assessmentId required' }, { status: 400 });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (assessment.assessorProfileId !== assessor.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingCount = assessment.evidenceUrls.length;
    const files = formData.getAll('evidence') as File[];
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    if (existingCount + files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} evidence files per assessment` },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'evidence', assessmentId);
    await mkdir(uploadDir, { recursive: true });

    const paths: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
      }

      const ext = file.type === 'video/mp4' ? 'mp4' : file.type.split('/')[1] ?? 'bin';
      const filename = `${nanoid()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      paths.push(`/uploads/evidence/${assessmentId}/${filename}`);
    }

    return NextResponse.json({ data: paths });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
