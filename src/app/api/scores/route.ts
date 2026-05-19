import { NextResponse } from 'next/server';
import { ensureDb } from '@/db';
import { rowToScoreEntry } from '@/db/mappers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await ensureDb();

    const scoresResult = await client.execute(
      `SELECT id, player_name, score, total_questions, duration_ms, created_at, session_id
       FROM scores
       ORDER BY score DESC,
                COALESCE(duration_ms, 2147483647) ASC,
                created_at ASC
       LIMIT 100`
    );

    const countResult = await client.execute(
      'SELECT COUNT(*) as count FROM scores'
    );
    const avgResult = await client.execute('SELECT AVG(score) as avg FROM scores');

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
