/** Her isim (trim + lower) için en erken ilk katılım; liderlik sıralaması [/api/scores GET] ile aynı kaynak. */

export const SCORE_LEADERBOARD_SQL = `
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

export const COUNT_DISTINCT_PLAYERS_SQL = `
SELECT COUNT(DISTINCT LOWER(TRIM(player_name))) AS count FROM scores
`;

export const AVG_FIRST_ATTEMPT_SQL = `
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
