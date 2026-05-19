import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import IdleTimer from '@/components/IdleTimer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deepfake Dedektörü',
  description:
    'Gerçek ve yapay zeka ile üretilmiş görselleri ayırt edebilir misiniz?',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <IdleTimer timeout={60000} />
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          {children}
        </div>
      </body>
    </html>
  );
}
