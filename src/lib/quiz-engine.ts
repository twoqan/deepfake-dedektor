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
    const realOnLeft = Math.random() > 0.5;
    return {
      id: img.id,
      name: img.name,
      leftImage: realOnLeft ? img.real_image : img.fake_image,
      rightImage: realOnLeft ? img.fake_image : img.real_image,
      realSide: realOnLeft ? ('left' as const) : ('right' as const),
    };
  });
}
