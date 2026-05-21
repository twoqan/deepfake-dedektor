import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { isAdminPasswordOk } from '@/lib/admin-password';

export const dynamic = 'force-dynamic';

/** Varsayılan Node runtime; bazı ortamlarda ortam değişkenlerinin garanti görünmesi için. */
export const runtime = 'nodejs';

export async function GET() {
  try {
    const client = await ensureDb();

    const pCount = await client.execute(
      'SELECT COUNT(*) as count FROM scores'
    );
    const pAvg = await client.execute('SELECT AVG(score) as avg FROM scores');
    const iCount = await client.execute(
      'SELECT COUNT(*) as count FROM images'
    );

    const totalParticipants = Number(pCount.rows[0]?.count ?? 0);
    const avgRow = pAvg.rows[0]?.avg;
    const averageScore = avgRow == null ? 0 : Number(avgRow);
    const totalImages = Number(iCount.rows[0]?.count ?? 0);

    let hardestImages: unknown[] = [];
    try {
      const hr = await client.execute(`
        SELECT i.name, COUNT(*) as attempts,
               SUM(CASE WHEN json_extract(a.value, '$.isCorrect') = 1 THEN 0 ELSE 1 END) as wrong_count
        FROM scores s, json_each(s.answers) a
        JOIN images i ON json_extract(a.value, '$.questionId') = i.id
        GROUP BY i.id
        ORDER BY wrong_count DESC
        LIMIT 5
      `);
      hardestImages = hr.rows.map((row) => ({
        name: row.name,
        attempts: row.attempts,
        wrong_count: row.wrong_count,
      }));
    } catch {
      // JSON query may fail if answers format is unexpected
    }

    return NextResponse.json({
      totalParticipants,
      averageScore,
      totalImages,
      hardestImages,
    });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const trimmedInput =
      typeof body.password === 'string' ? body.password.trim() : '';
    if (!isAdminPasswordOk(trimmedInput)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    /** Giriş / reset: ADMIN_PASSWORD veya NEXT_PUBLIC_ADMIN_PASSWORD’teki dolu değerlerden biri. */
    if (body.action === 'authenticate') {
      return NextResponse.json({ success: true });
    }

    const client = await ensureDb();

    if (body.action === 'reset_scores') {
      await client.execute('DELETE FROM scores');
      return NextResponse.json({ success: true, message: 'Skorlar sıfırlandı' });
    }

    return NextResponse.json({ error: 'Bilinmeyen işlem' }, { status: 400 });
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
