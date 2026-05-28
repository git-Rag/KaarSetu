import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { requireRole } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
];

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
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const formData = await request.formData();
    const assessmentId = formData.get('assessmentId') as string;
    if (!assessmentId) {
      return NextResponse.json({ error: 'assessmentId required' }, { status: 400 });
    }

    const files = formData.getAll('evidence') as File[];
    if (files.length === 0 || files.length > MAX_FILES) {
      return NextResponse.json({ error: `Upload 1-${MAX_FILES} files` }, { status: 400 });
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
