'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuizImageProps {
  imageSrc: string;
  onAnswer: (userSaidReal: boolean) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  wasCorrect?: boolean;
  isReal: boolean;
}

export default function QuizImage({
  imageSrc,
  onAnswer,
  disabled = false,
  showFeedback = false,
  wasCorrect = false,
  isReal,
}: QuizImageProps) {
  const [hasError, setHasError] = useState(false);

  const resultLabel = isReal
    ? 'Bu görsel gerçek bir fotoğraftı.'
    : 'Bu görsel yapay zeka ile üretilmişti.';

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <div
        className={`relative rounded-2xl overflow-hidden border-4 transition-colors duration-300 aspect-[4/3] bg-gray-900/80 ${
          showFeedback
            ? wasCorrect
              ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.25)]'
              : 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
            : 'border-gray-700/50'
        }`}
      >
        {hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <span className="text-gray-500 text-lg">Görsel yüklenemedi</span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt="Quiz görseli"
            className="w-full h-full object-cover select-none"
            draggable={false}
            onError={() => setHasError(true)}
          />
        )}

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center backdrop-blur-[2px] ${
              wasCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                wasCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {wasCorrect ? (
                <svg
                  className="w-14 h-14 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-14 h-14 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl font-semibold text-white drop-shadow-lg max-w-md leading-snug"
            >
              {resultLabel}
            </motion.p>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <motion.button
          type="button"
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          onClick={() => !disabled && onAnswer(true)}
          disabled={disabled}
          className="py-5 px-8 rounded-2xl text-xl font-bold border-4 border-green-700/80 bg-green-950/60 text-green-100 hover:bg-green-900/70 hover:border-green-500 disabled:opacity-35 disabled:pointer-events-none transition-colors"
        >
          Gerçek fotoğraf
        </motion.button>
        <motion.button
          type="button"
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          onClick={() => !disabled && onAnswer(false)}
          disabled={disabled}
          className="py-5 px-8 rounded-2xl text-xl font-bold border-4 border-fuchsia-800/70 bg-fuchsia-950/50 text-fuchsia-100 hover:bg-fuchsia-900/65 hover:border-fuchsia-400 disabled:opacity-35 disabled:pointer-events-none transition-colors"
        >
          Yapay zeka
        </motion.button>
      </div>
    </div>
  );
}
