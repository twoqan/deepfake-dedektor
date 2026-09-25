'use client';

import { useEffect, useRef, useState } from 'react';
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
  // Görselin gerçek oranı; yüklenene kadar 4/3.
  const [ratio, setRatio] = useState(4 / 3);
  // Kullanılabilir alan (px). Çerçeve = alana sığan en büyük, orana sadık kutu.
  const areaRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () =>
      setArea({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frameStyle = area
    ? (() => {
        const w = Math.min(area.w, area.h * ratio);
        return { width: Math.floor(w), height: Math.floor(w / ratio) };
      })()
    : { width: '100%', maxHeight: '100%', aspectRatio: ratio };

  const resultLabel = isReal
    ? 'Bu görsel gerçek bir fotoğraftı.'
    : 'Bu görsel yapay zeka ile üretilmişti.';

  return (
    <div
      ref={areaRef}
      className="h-full w-full max-w-5xl mx-auto flex items-center justify-center"
    >
      <div
        style={frameStyle}
        className={`relative rounded-2xl overflow-hidden border-4 transition-colors duration-300 bg-neutral-950 flex items-center justify-center p-1 sm:p-2 ${
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
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                setRatio(naturalWidth / naturalHeight);
              }
            }}
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
              className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center ${
                wasCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {wasCorrect ? (
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-3xl font-extrabold drop-shadow-lg ${
                wasCorrect ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {wasCorrect ? 'Doğru!' : 'Yanlış!'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
