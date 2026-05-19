'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScoreEntry } from '@/types';
import LeaderboardTable from '@/components/LeaderboardTable';

interface LeaderboardData {
  scores: ScoreEntry[];
  totalParticipants: number;
  averageScore: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/scores')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm mb-3">
            Önce puana, eşitlikte süreye göre sıralanır
          </p>
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Liderlik Tablosu
            </span>
          </h1>

          <div className="flex justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-xl">
                  {data?.totalParticipants || 0}
                </span>
                <span className="ml-1">Katılımcı</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-xl">
                  {data?.averageScore?.toFixed(1) || '0'}
                </span>
                <span className="ml-1">Ort. Puan</span>
              </div>
            </div>
          </div>
        </div>

        <LeaderboardTable scores={data?.scores || []} />

        <div className="mt-10 text-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sessionStorage.clear();
              router.push('/');
            }}
            className="px-10 py-5 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
          >
            Yeni Test Başlat
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
