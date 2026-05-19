import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { rowToImagePair } from '@/db/mappers';
import { resolveImagePairUrls } from '@/lib/resolve-public-image-url';
import { generateQuestions } from '@/lib/quiz-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await ensureDb();
    const result = await client.execute(
      'SELECT * FROM images WHERE is_active = 1'
    );

    const images = result.rows.map((row) =>
      resolveImagePairUrls(rowToImagePair(row))
    );

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Henüz görsel eklenmemiş. Seed scriptini çalıştırın.' },
        { status: 404 }
      );
    }

    const gen = generateQuestions(images);
    if (!gen.ok) {
      return NextResponse.json({ error: gen.message }, { status: 422 });
    }

    return NextResponse.json({ questions: gen.questions });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
