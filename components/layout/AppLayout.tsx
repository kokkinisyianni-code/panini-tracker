'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/collection', icon: '📋', label: 'Collection' },
  { href: '/leaderboard', icon: '🏆', label: 'Rankings' },
  { href: '/trades', icon: '🔄', label: 'Trades' },
  { href: '/statistics', icon: '📊', label: 'Stats' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login');
    }
  }, [user, isInitialized]);

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080C14' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl animate-float"
            style={{ background: 'linear-gradient(135deg, #4361EE, #7209B7)' }}>⚽</div>
          <div className="font-display text-xl gradient-text-gold">LOADING...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080C14' }}>
      {/* Top header */}
      <header className="sticky top-0 z-40 glass border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-display text-lg gradient-text-gold">PANINI 2026</span>
          </div>
          <Link href="/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8899BB' }}>
            <span className="text-base">👤</span>
            <span className="font-medium">{user.firstName}</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-safe pt-4">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-all"
                style={{ color: isActive ? '#F5A623' : '#4A5568' }}>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: '#F5A623' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
