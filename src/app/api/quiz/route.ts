import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { rowToImagePair } from '@/db/mappers';
import { generateQuestions } from '@/lib/quiz-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');

    const client = await ensureDb();
    const result = await client.execute(
      'SELECT * FROM images WHERE is_active = 1'
    );

    const images = result.rows.map(rowToImagePair);

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Henüz görsel eklenmemiş. Seed scriptini çalıştırın.' },
        { status: 404 }
      );
    }

    const questions = generateQuestions(images, count);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
