'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    sessionStorage.setItem('playerName', trimmed);
    router.push('/quiz');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
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
          Gerçek ve yapay zeka ile üretilmiş görselleri
          <br />
          ayırt edebilir misiniz? Kendinizi test edin!
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              placeholder="Adınızı girin..."
              maxLength={30}
              className="w-full px-6 py-5 text-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all"
              autoFocus
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            disabled={!name.trim()}
            className="px-14 py-5 text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            Testi Başlat
          </motion.button>
        </motion.div>

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
    </main>
  );
}
