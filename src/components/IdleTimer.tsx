'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function IdleTimer({ timeout = 60000 }: { timeout?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pathname === '/result' || pathname === '/leaderboard') {
      timerRef.current = setTimeout(() => {
        sessionStorage.clear();
        router.push('/');
      }, timeout);
    }
  }, [router, pathname, timeout]);

  useEffect(() => {
    const events = ['touchstart', 'click', 'mousemove', 'keydown'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return null;
}
