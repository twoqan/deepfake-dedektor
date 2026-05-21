import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { rowToScoreEntry } from '@/db/mappers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/** Her isim (trim + lower) için en erken tarihli ilk katılım; liderlik buna göre. */
const SCORE_LEADERBOARD_SQL = `
WITH first_attempts AS (
  SELECT
    id,
    player_name,
    score,
    total_questions,
    duration_ms,
    created_at,
    session_id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(player_name))
      ORDER BY created_at ASC
    ) AS rn
  FROM scores
)
SELECT id, player_name, score, total_questions, duration_ms, created_at, session_id
FROM first_attempts
WHERE rn = 1
ORDER BY score DESC,
         COALESCE(duration_ms, 2147483647) ASC,
         created_at ASC
LIMIT 100
`;

/** Benzersiz isim sayısı (aynı yazım küçük harf normalize). */
const COUNT_DISTINCT_PLAYERS_SQL = `
SELECT COUNT(DISTINCT LOWER(TRIM(player_name))) AS count FROM scores
`;

/** Ortalama puan — yalnızca her ismin ilk katılımı üzerinden. */
const AVG_FIRST_ATTEMPT_SQL = `
WITH first_attempts AS (
  SELECT score,
         ROW_NUMBER() OVER (
           PARTITION BY LOWER(TRIM(player_name))
           ORDER BY created_at ASC
         ) AS rn
  FROM scores
)
SELECT AVG(score) AS avg FROM first_attempts WHERE rn = 1
`;

export async function GET() {
  try {
    const client = await ensureDb();

    const [scoresResult, countResult, avgResult] = await Promise.all([
      client.execute(SCORE_LEADERBOARD_SQL),
      client.execute(COUNT_DISTINCT_PLAYERS_SQL),
      client.execute(AVG_FIRST_ATTEMPT_SQL),
    ]);

    const totalParticipants = Number(countResult.rows[0]?.count ?? 0);
    const avgRow = avgResult.rows[0]?.avg;
    const averageScore =
      avgRow == null || avgRow === null ? 0 : Number(avgRow);

    return NextResponse.json({
      scores: scoresResult.rows.map(rowToScoreEntry),
      totalParticipants,
      averageScore,
    });
  } catch (error) {
    console.error('Scores GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerName, score, totalQuestions, answers, durationMs } = body;

    if (!playerName || score == null || !totalQuestions) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
    }

    const duration =
      typeof durationMs === 'number' && durationMs >= 0
        ? Math.round(durationMs)
        : null;

    const sessionId = crypto.randomUUID();
    const client = await ensureDb();

    const answersJson =
      typeof answers === 'string' ? answers : JSON.stringify(answers);

    const result = await client.execute({
      sql: `INSERT INTO scores (player_name, score, total_questions, answers, duration_ms, session_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        playerName,
        score,
        totalQuestions,
        answersJson,
        duration,
        sessionId,
      ],
    });

    const lid = result.lastInsertRowid;
    return NextResponse.json({
      id: lid != null ? Number(lid) : undefined,
      sessionId,
    });
  } catch (error) {
    console.error('Scores POST error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
