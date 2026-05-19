'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuizImageProps {
  imageSrc: string;
  showFeedback?: boolean;
  wasCorrect?: boolean;
  isReal: boolean;
}

export default function QuizImage({
  imageSrc,
  showFeedback = false,
  wasCorrect = false,
  isReal,
}: QuizImageProps) {
  const [hasError, setHasError] = useState(false);

  const resultLabel = isReal
    ? 'Bu görsel gerçek bir fotoğraftı.'
    : 'Bu görsel yapay zeka ile üretilmişti.';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        className={`relative rounded-2xl overflow-hidden border-4 transition-colors duration-300 aspect-[4/3] bg-neutral-950 flex items-center justify-center p-1 sm:p-2 ${
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
            decoding="async"
            fetchPriority="high"
            className="max-h-full max-w-full h-auto w-auto object-contain object-center select-none"
            draggable={false}
            onError={() => setHasError(true)}
          />
        )}

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-6 text-center backdrop-blur-[2px] ${
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
    </div>
  );
}
