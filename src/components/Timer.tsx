'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  startTime: number | null;
  paused?: boolean;
}

export default function Timer({ startTime, paused = false }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || paused) return;

    const tick = () => setElapsed(Date.now() - startTime);
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [startTime, paused]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 rounded-xl border border-gray-800 tabular-nums">
      <svg
        className="w-5 h-5 text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-amber-400 font-bold text-xl">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

