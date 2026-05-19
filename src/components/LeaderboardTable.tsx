'use client';

import { motion } from 'framer-motion';
import { ScoreEntry } from '@/types';
import { formatDuration } from '@/lib/utils';

interface LeaderboardTableProps {
  scores: ScoreEntry[];
}

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardTable({ scores }: LeaderboardTableProps) {
  if (scores.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16 text-xl">
        Henüz kimse teste katılmamış. İlk sen ol!
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[60px_1fr_100px_90px] gap-4 px-6 py-3 text-sm text-gray-500 font-medium uppercase tracking-wider border-b border-gray-800">
        <div>Sıra</div>
        <div>İsim</div>
        <div className="text-center">Puan</div>
        <div className="text-right">Süre</div>
      </div>

      <div className="space-y-2 mt-2">
        {scores.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`grid grid-cols-[60px_1fr_100px_90px] gap-4 px-6 py-4 rounded-xl transition-colors ${
              index === 0
                ? 'bg-yellow-500/10 border border-yellow-500/30'
                : index === 1
                  ? 'bg-gray-400/5 border border-gray-400/20'
                  : index === 2
                    ? 'bg-orange-500/5 border border-orange-500/20'
                    : 'bg-gray-900/50 border border-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-1">
              <span
                className={`text-lg font-bold ${
                  index === 0
                    ? 'text-yellow-400'
                    : index === 1
                      ? 'text-gray-300'
                      : index === 2
                        ? 'text-orange-400'
                        : 'text-gray-600'
                }`}
              >
                {index < 3 ? medals[index] : `#${index + 1}`}
              </span>
            </div>
            <div className="text-white font-medium truncate flex items-center">
              {entry.player_name}
            </div>
            <div className="text-center flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-lg">
                {entry.score}
              </span>
              <span className="text-gray-600">/{entry.total_questions}</span>
            </div>
            <div className="text-right text-amber-400/90 text-sm font-medium flex items-center justify-end tabular-nums">
              {formatDuration(entry.duration_ms)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
