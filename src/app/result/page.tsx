'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QuizResult } from '@/types';
import { getResultMessage, formatDuration } from '@/lib/utils';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem('quizResult');
    if (!data) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(data) as QuizResult;
    setResult(parsed);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDisplayScore(current);
      if (current >= parsed.score) clearInterval(interval);
    }, 150);

    return () => clearInterval(interval);
  }, [router]);

  if (!result) return null;

  const { message, emoji } = getResultMessage(result.score, result.totalQuestions);
  const percentage = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="text-center max-w-2xl w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-9xl mb-8"
        >
          {emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                className="text-gray-800"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 54 * (1 - result.score / result.totalQuestions),
                }}
                transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-white">
                {displayScore}
              </span>
              <span className="text-gray-500 text-lg">
                / {result.totalQuestions}
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3">
            %{percentage} Başarı
          </h1>
          <p className="text-lg text-amber-400/90 mb-2 tabular-nums">
            Süre: {formatDuration(result.durationMs ?? null)}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Aynı puanda daha hızlı olan sıralamada üstte yer alır
          </p>
          <p className="text-xl text-gray-400 mb-12">{message}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/leaderboard')}
            className="px-10 py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
          >
            Liderlik Tablosu
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sessionStorage.removeItem('quizResult');
              router.push('/');
            }}
            className="px-10 py-5 text-lg font-bold bg-gray-900 border border-gray-700 rounded-2xl text-white hover:bg-gray-800 transition-all"
          >
            Tekrar Dene
          </motion.button>
        </motion.div>
      </motion.div>
    </main>
  );
}
