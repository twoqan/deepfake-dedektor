import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { rowToScoreEntry } from '@/db/mappers';
import {
  extractAdminPasswordFromRequest,
  isAdminPasswordOk,
} from '@/lib/admin-password';
import { SCORE_LEADERBOARD_SQL } from '@/lib/score-leaderboard-sql';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Liderlikteki ilk 100 satırı (her isim için ilk katılım) UTF-8 BOM CSV indirir. */
export async function GET(request: Request) {
  try {
    const pw = extractAdminPasswordFromRequest(request);
    if (!isAdminPasswordOk(pw)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const client = await ensureDb();
    const result = await client.execute(SCORE_LEADERBOARD_SQL);

    const headerRow = [
      'sira',
      'id',
      'isim',
      'puan',
      'toplam_soru',
      'sure_ms',
      'tarih',
      'session_id',
    ];

    const lines: string[] = [headerRow.join(',')];

    result.rows.forEach((row, index) => {
      const e = rowToScoreEntry(row);
      const rank = index + 1;
      const cols = [
        rank,
        e.id,
        e.player_name,
        e.score,
        e.total_questions,
        e.duration_ms ?? '',
        e.created_at,
        e.session_id,
      ];
      lines.push(cols.map(csvEscape).join(','));
    });

    const csvBody = `\uFEFF${lines.join('\r\n')}`;
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csvBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leaderboard-ilk100-${date}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export leaderboard CSV error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
