'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < current
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-600'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
