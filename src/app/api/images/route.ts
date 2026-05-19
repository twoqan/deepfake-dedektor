import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { rowToImagePair } from '@/db/mappers';
import { resolveImagePairUrls } from '@/lib/resolve-public-image-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await ensureDb();
    const result = await client.execute('SELECT * FROM images ORDER BY id');
    const images = result.rows.map((row) =>
      resolveImagePairUrls(rowToImagePair(row))
    );
    return NextResponse.json(images);
  } catch (error) {
    console.error('Images GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (id == null) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const client = await ensureDb();
    await client.execute({
      sql: 'UPDATE images SET is_active = ? WHERE id = ?',
      args: [is_active ? 1 : 0, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Images PATCH error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
