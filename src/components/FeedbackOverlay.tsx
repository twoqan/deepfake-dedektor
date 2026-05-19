'use client';

import { motion } from 'framer-motion';

interface FeedbackOverlayProps {
  isCorrect: boolean;
}

export default function FeedbackOverlay({ isCorrect }: FeedbackOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`w-36 h-36 rounded-full flex items-center justify-center shadow-2xl ${
          isCorrect
            ? 'bg-green-500 shadow-green-500/40'
            : 'bg-red-500 shadow-red-500/40'
        }`}
      >
        {isCorrect ? (
          <svg
            className="w-20 h-20 text-white"
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
            className="w-20 h-20 text-white"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`absolute bottom-[35%] text-2xl font-bold ${
          isCorrect ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {isCorrect ? 'Doğru!' : 'Yanlış!'}
      </motion.p>
    </motion.div>
  );
}
