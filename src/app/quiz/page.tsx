'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion, QuizAnswer } from '@/types';
import QuizImage from '@/components/QuizImage';
import ProgressBar from '@/components/ProgressBar';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import Timer from '@/components/Timer';

export default function QuizPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const quizStartRef = useRef<number | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem('playerName');
    if (!name) {
      router.push('/');
      return;
    }
    setPlayerName(name);

    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          const start = Date.now();
          quizStartRef.current = start;
          setQuizStartTime(start);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleAnswer = (userSaidReal: boolean) => {
    if (showFeedback || saving) return;

    const question = questions[currentIndex];
    const isCorrect = userSaidReal === question.isReal;

    const newAnswer: QuizAnswer = {
      questionId: question.id,
      userSaidReal,
      isCorrect,
    };

    const newAnswers = [...answers, newAnswer];
    const newScore = isCorrect ? score + 1 : score;

    setAnswers(newAnswers);
    setScore(newScore);
    setLastCorrect(isCorrect);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);

      if (currentIndex + 1 >= questions.length) {
        setSaving(true);
        const durationMs = quizStartRef.current
          ? Date.now() - quizStartRef.current
          : 0;

        sessionStorage.setItem(
          'quizResult',
          JSON.stringify({
            playerName,
            score: newScore,
            totalQuestions: questions.length,
            durationMs,
          })
        );

        fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName,
            score: newScore,
            totalQuestions: questions.length,
            answers: newAnswers,
            durationMs,
          }),
        })
          .finally(() => {
            router.push('/result');
          });
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-2xl text-gray-400">Sorular yükleniyor...</p>
        </motion.div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-6">
            Henüz görsel eklenmemiş.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gray-800 rounded-xl text-white hover:bg-gray-700 transition"
          >
            Ana Sayfa
          </button>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <main className="min-h-screen flex flex-col p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg text-gray-400">
          <span className="text-white font-bold">{playerName}</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="text-lg text-gray-400">
            Soru{' '}
            <span className="text-white font-bold">{currentIndex + 1}</span>/
            {questions.length}
          </div>
          <Timer startTime={quizStartTime} paused={showFeedback || saving} />
          <div className="px-4 py-2 bg-gray-900/80 rounded-xl border border-gray-800">
            <span className="text-gray-400">Skor: </span>
            <span className="text-cyan-400 font-bold text-xl">{score}</span>
          </div>
        </div>
      </div>

      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.h2
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-gray-200 text-center px-2"
        >
          Bu görsel <span className="text-cyan-400">gerçek fotoğraf mı,</span>{' '}
          <span className="text-fuchsia-300">yapay zeka mı?</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <QuizImage
              imageSrc={currentQuestion.image}
              onAnswer={handleAnswer}
              disabled={showFeedback || saving}
              showFeedback={showFeedback}
              wasCorrect={lastCorrect}
              isReal={currentQuestion.isReal}
            />
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-gray-500 text-lg text-center px-4"
        >
          Görseli inceleyin ve seçiminizi yapın.
        </motion.p>
      </div>

      <AnimatePresence>
        {showFeedback && <FeedbackOverlay isCorrect={lastCorrect} />}
      </AnimatePresence>
    </main>
  );
}
