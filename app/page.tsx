'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, isInitialized]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080C14' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-float"
          style={{ background: 'linear-gradient(135deg, #4361EE, #7209B7)' }}>
          ⚽
        </div>
        <div className="font-display text-2xl gradient-text-gold">LOADING...</div>
      </div>
    </div>
  );
}
