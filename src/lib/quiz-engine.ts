import { ImagePairData, QuizQuestion } from '@/types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateQuestions(
  images: ImagePairData[],
  count: number = 10
): QuizQuestion[] {
  const shuffled = shuffleArray(images);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((img) => {
    const showReal = Math.random() > 0.5;
    return {
      id: img.id,
      name: img.name,
      image: showReal ? img.real_image : img.fake_image,
      isReal: showReal,
    };
  });
}
