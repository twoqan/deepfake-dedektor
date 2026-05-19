'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ImagePairProps {
  leftImage: string;
  rightImage: string;
  onSelect: (side: 'left' | 'right') => void;
  disabled?: boolean;
  correctSide?: 'left' | 'right';
}

function ImageCard({
  src,
  side,
  label,
  disabled,
  correctSide,
  onSelect,
}: {
  src: string;
  side: 'left' | 'right';
  label: string;
  disabled?: boolean;
  correctSide?: 'left' | 'right';
  onSelect: (side: 'left' | 'right') => void;
}) {
  const [hasError, setHasError] = useState(false);
  const isCorrect = correctSide === side;
  const isWrong = correctSide != null && correctSide !== side;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={() => !disabled && onSelect(side)}
      className={`relative flex-1 aspect-[4/3] rounded-2xl overflow-hidden border-4 transition-colors duration-300 ${
        isCorrect
          ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
          : isWrong
            ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
            : 'border-gray-700/50 hover:border-gray-500'
      } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {hasError ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <span className="text-gray-500 text-lg">Görsel Yüklenemedi</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`${label} görsel`}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          draggable={false}
        />
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-sm rounded-full text-lg font-bold tracking-wider">
        {label}
      </div>

      {isCorrect && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-[1px]"
        >
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
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
          </div>
        </motion.div>
      )}

      {isWrong && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-[1px]"
        >
          <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center">
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
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}

export default function ImagePair({
  leftImage,
  rightImage,
  onSelect,
  disabled,
  correctSide,
}: ImagePairProps) {
  return (
    <div className="flex gap-6 w-full max-w-6xl mx-auto">
      <ImageCard
        src={leftImage}
        side="left"
        label="A"
        disabled={disabled}
        correctSide={correctSide}
        onSelect={onSelect}
      />
      <div className="flex items-center">
        <span className="text-2xl font-bold text-gray-600">VS</span>
      </div>
      <ImageCard
        src={rightImage}
        side="right"
        label="B"
        disabled={disabled}
        correctSide={correctSide}
        onSelect={onSelect}
      />
    </div>
  );
}
