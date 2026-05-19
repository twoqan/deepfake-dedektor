export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || ms <= 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
  return `${seconds} sn`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getResultMessage(score: number, total: number) {
  const ratio = score / total;
  if (ratio <= 0.3) return { message: 'Yapay zeka sizi kandırdı!', emoji: '🤖' };
  if (ratio <= 0.6) return { message: 'Fena değil, ama dikkatli olun!', emoji: '🤔' };
  if (ratio < 1) return { message: "Harika! Deepfake'leri iyi tanıyorsunuz!", emoji: '🎯' };
  return { message: 'Mükemmel! Sizi kandırmak imkansız!', emoji: '🏆' };
}
