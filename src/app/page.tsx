'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import OnScreenKeyboard from '@/components/OnScreenKeyboard';

const NAME_MIN = 2;
const NAME_MAX = 12;

/** Ekran klavyesiyle aynı karakter seti: rakam, Türkçe büyük harf ve boşluk. */
const ALLOWED_CHAR = /^[0-9A-ZÇĞİÖŞÜ ]$/;

function toUpperTr(s: string): string {
  return s.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
}

export default function HomePage() {
  const [step, setStep] = useState<'intro' | 'name'>('intro');
  const [name, setName] = useState('');
  const router = useRouter();

  const trimmed = name.trim();
  const canStart = trimmed.length >= NAME_MIN;

  const appendChar = useCallback((char: string) => {
    setName((prev) => {
      if (prev.length >= NAME_MAX) return prev;
      if (char === ' ' && (prev === '' || prev.endsWith(' '))) return prev;
      return prev + char;
    });
  }, []);

  const backspace = useCallback(() => {
    setName((prev) => prev.slice(0, -1));
  }, []);

  const handleStart = useCallback(() => {
    if (!canStart) return;
    sessionStorage.setItem('playerName', trimmed);
    router.push('/quiz');
  }, [canStart, trimmed, router]);

  // Fiziksel klavye desteği (test / harici klavye bağlı kiosk).
  useEffect(() => {
    if (step !== 'name') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStart();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
        return;
      }
      if (e.key === 'Escape') {
        setStep('intro');
        return;
      }
      if (e.key.length === 1) {
        const upper = toUpperTr(e.key);
        if (ALLOWED_CHAR.test(upper)) {
          e.preventDefault();
          appendChar(upper);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, appendChar, backspace, handleStart]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {step === 'intro' ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl w-full"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Yapay Zeka Görsel Testi
              </div>
            </motion.div>

            <h1 className="text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-gradient-subtle">Deepfake</span>
              <br />
              <span className="text-white">Dedektörü</span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 leading-relaxed">
              Tek bir görsel: gerçek fotoğraf mı, yapay zeka ile üretilmiş mi?
              <br />
              Ayırt edebilir misiniz? Kendinizi test edin!
            </p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('name')}
              className="px-14 py-5 text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
            >
              Testi Başlat
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16"
            >
              <button
                onClick={() => router.push('/leaderboard')}
                className="text-gray-500 hover:text-cyan-400 transition-colors text-lg"
              >
                Liderlik Tablosunu Gör &rarr;
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center w-full max-w-7xl"
          >
            <h1 className="text-5xl font-extrabold text-white mb-3">İsminizi Giriniz</h1>
            <p className="text-xl text-gray-400 mb-8">
              Sıralama tablosunda bu isimle görüneceksin. En az {NAME_MIN}, en fazla {NAME_MAX} karakter.
            </p>

            <div
              className="relative mx-auto mb-8 w-full max-w-3xl h-20 rounded-2xl bg-gray-950/80 border border-gray-700/60 backdrop-blur-sm flex items-center justify-center px-6"
              aria-live="polite"
              aria-label="Rumuz"
            >
              <span className="text-3xl font-semibold tracking-[0.2em] text-white whitespace-pre">
                {name}
              </span>
              <span className="w-[3px] h-10 rounded bg-amber-400 animate-pulse" aria-hidden />
              <span className="absolute right-4 bottom-2 text-xs text-gray-500 tabular-nums">
                {name.length}/{NAME_MAX}
              </span>
            </div>

            <OnScreenKeyboard
              onKey={appendChar}
              onBackspace={backspace}
              onSpace={() => appendChar(' ')}
              disabled={name.length >= NAME_MAX}
            />

            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setName('');
                  setStep('intro');
                }}
                className="px-12 py-5 min-w-[14rem] text-xl font-bold bg-gray-900 border border-gray-700 rounded-2xl text-white hover:bg-gray-800 transition-all"
              >
                Geri
              </motion.button>
              <motion.button
                whileHover={canStart ? { scale: 1.03 } : undefined}
                whileTap={canStart ? { scale: 0.97 } : undefined}
                onClick={handleStart}
                disabled={!canStart}
                className="px-12 py-5 min-w-[14rem] text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                Başla
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
