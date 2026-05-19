import type { Row } from '@libsql/core/api';
import type { ImageKind, ImagePairData, ScoreEntry } from '@/types';

function rowImageKind(row: Row): ImageKind {
  const raw = row.image_kind;
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return 'ai';
  }
  const s = String(raw).trim();
  return s === 'real' ? 'real' : 'ai';
}

export function rowToImagePair(row: Row): ImagePairData {
  return {
    id: Number(row.id),
    name: String(row.name),
    real_image: String(row.real_image),
    fake_image: String(row.fake_image),
    image_kind: rowImageKind(row),
    is_active: Number(row.is_active),
    created_at: String(row.created_at),
  };
}

export function rowToScoreEntry(row: Row): ScoreEntry {
  return {
    id: Number(row.id),
    player_name: String(row.player_name),
    score: Number(row.score),
    total_questions: Number(row.total_questions),
    duration_ms:
      row.duration_ms == null ? null : Number(row.duration_ms),
    created_at: String(row.created_at),
    session_id: String(row.session_id),
  };
}
