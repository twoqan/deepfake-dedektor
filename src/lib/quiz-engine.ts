import {
  QUIZ_AI_PER_SESSION,
  QUIZ_REAL_PER_SESSION,
} from '@/lib/quiz-config';
import type { ImagePairData, QuizQuestion } from '@/types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const INSUFFICIENT_POOL_MESSAGE =
  'Yetersiz yapay veya gerçek görsel havuzu; en az 7 yapay ve 3 gerçek aktif satır gerekli.';

export type GenerateQuizResult =
  | { ok: true; questions: QuizQuestion[] }
  | { ok: false; message: string };

/**
 * Aktif görsel havuzundan (oturum içinde tekrar yok): 7 yapay (`image_kind === 'ai'`)
 * + 3 gerçek (`image_kind === 'real'`), sıra iki aşamada karıştırılır.
 */
export function generateQuestions(
  images: ImagePairData[]
): GenerateQuizResult {
  const aiPool = images.filter((i) => i.image_kind === 'ai');
  const realPool = images.filter((i) => i.image_kind === 'real');

  if (
    aiPool.length < QUIZ_AI_PER_SESSION ||
    realPool.length < QUIZ_REAL_PER_SESSION
  ) {
    return { ok: false, message: INSUFFICIENT_POOL_MESSAGE };
  }

  const shuffledAi = shuffleArray([...aiPool]);
  const shuffledReal = shuffleArray([...realPool]);

  const pickAi = shuffledAi.slice(0, QUIZ_AI_PER_SESSION);
  const pickReal = shuffledReal.slice(0, QUIZ_REAL_PER_SESSION);

  const fromAi: QuizQuestion[] = pickAi.map((img) => ({
    id: img.id,
    name: img.name,
    image: img.fake_image,
    isReal: false,
  }));

  const fromReal: QuizQuestion[] = pickReal.map((img) => ({
    id: img.id,
    name: img.name,
    image: img.real_image,
    isReal: true,
  }));

  const questions = shuffleArray([...fromAi, ...fromReal]);
  return { ok: true, questions };
}
