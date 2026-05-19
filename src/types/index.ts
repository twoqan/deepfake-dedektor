export interface ImagePairData {
  id: number;
  name: string;
  real_image: string;
  fake_image: string;
  is_active: number;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  name: string;
  leftImage: string;
  rightImage: string;
  realSide: 'left' | 'right';
}

export interface QuizAnswer {
  questionId: number;
  selectedSide: 'left' | 'right';
  isCorrect: boolean;
}

export interface ScoreEntry {
  id: number;
  player_name: string;
  score: number;
  total_questions: number;
  duration_ms: number | null;
  created_at: string;
  session_id: string;
}

export interface QuizResult {
  playerName: string;
  score: number;
  totalQuestions: number;
  durationMs: number;
}
