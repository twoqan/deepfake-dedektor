/** Her deneme ayrı satır; liderlik sıralaması [/api/scores GET] ve admin CSV ile aynı kaynak. */

export const SCORE_LEADERBOARD_SQL = `
SELECT id, player_name, score, total_questions, duration_ms, created_at, session_id
FROM scores
ORDER BY score DESC,
         COALESCE(duration_ms, 2147483647) ASC,
         created_at ASC
LIMIT 100
`;

/** Toplam deneme sayısı (her oyun ayrı sayılır). */
export const COUNT_ENTRIES_SQL = `
SELECT COUNT(*) AS count FROM scores
`;

/** Tüm denemelerin puan ortalaması. */
export const AVG_SCORE_SQL = `
SELECT AVG(score) AS avg FROM scores
`;
