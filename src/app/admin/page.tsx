'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalParticipants: number;
  averageScore: number;
  totalImages: number;
}

interface ImageData {
  id: number;
  name: string;
  real_image: string;
  fake_image: string;
  is_active: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'authenticate', password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !data.success) {
        showMessage(data.error || 'Yanlış şifre veya sunucu hatası.', 'error');
        return;
      }
      setAuthenticated(true);
      await fetchData();
    } catch {
      showMessage('Sunucuya ulaşılamadı.', 'error');
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, imagesRes] = await Promise.all([
        fetch('/api/admin'),
        fetch('/api/images'),
      ]);
      setStats(await statsRes.json());
      setImages(await imagesRes.json());
    } catch {
      showMessage('Veri yüklenemedi', 'error');
    }
  };

  const handleReset = async () => {
    if (!confirm('Tüm skorları silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_scores', password: password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        showMessage(data.error || 'Skor sıfırlama başarısız (şifreyi kontrol edin).', 'error');
        return;
      }
      await fetchData();
      showMessage(data.message || 'Skorlar sıfırlandı!');
    } catch {
      showMessage('İşlem başarısız', 'error');
    }
  };

  const toggleImage = async (id: number, currentActive: number) => {
    try {
      await fetch('/api/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      await fetchData();
    } catch {
      showMessage('İşlem başarısız', 'error');
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Admin Paneli</h1>
            <p className="text-gray-500 mt-1">Yönetim erişimi</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Şifre..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
            autoFocus
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Giriş Yap
          </button>
          {message && (
            <p className={`text-center mt-4 ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          )}
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 text-gray-500 hover:text-gray-300 transition text-sm"
          >
            &larr; Ana Sayfaya Dön
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Paneli</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-700 transition text-sm"
          >
            &larr; Ana Sayfa
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
              messageType === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-cyan-400">
                {stats.totalParticipants}
              </div>
              <div className="text-gray-500 mt-1">Toplam Katılımcı</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-green-400">
                {stats.averageScore?.toFixed(1) || '0'}
              </div>
              <div className="text-gray-500 mt-1">Ortalama Puan</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-blue-400">
                {stats.totalImages}
              </div>
              <div className="text-gray-500 mt-1">Görsel Çifti</div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Görsel Çiftleri</h2>
          {images.length === 0 ? (
            <p className="text-gray-500">Henüz görsel eklenmemiş. Seed scriptini çalıştırın.</p>
          ) : (
            <div className="space-y-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${img.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <div>
                      <span className="font-medium text-white">{img.name}</span>
                      <span className="text-gray-500 text-sm ml-3">
                        #{img.id}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleImage(img.id, img.is_active)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      img.is_active
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                    }`}
                  >
                    {img.is_active ? 'Devre Dışı Bırak' : 'Aktif Et'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Tehlikeli Bölge</h2>
          <p className="text-gray-500 text-sm mb-4">
            Bu işlemler geri alınamaz. Dikkatli olun.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold hover:bg-red-500/20 transition"
          >
            Tüm Skorları Sıfırla
          </button>
        </div>
      </div>
    </main>
  );
}
