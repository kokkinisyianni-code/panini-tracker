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
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#080C14',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', background: 'linear-gradient(135deg, #4361EE, #7209B7)',
          }}>⚽</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px',
            background: 'linear-gradient(135deg, #F5A623, #FFD166)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>LOADING...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080C14' }}>
      {/* Top header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(15,22,35,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          maxWidth: '640px', margin: '0 auto', padding: '0 16px',
          height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚽</span>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
              background: 'linear-gradient(135deg, #F5A623, #FFD166)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '0.04em',
            }}>PANINI WC 2026</span>
          </div>
          <Link href="/settings" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', borderRadius: '20px', textDecoration: 'none',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #4361EE, #7209B7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff',
            }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#F0F4FF' }}>{user.firstName}</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1, maxWidth: '640px', width: '100%',
        margin: '0 auto', padding: '16px 16px 100px',
      }}>
        {children}
      </main>

      {/* Bottom navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(15,22,35,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '8px 0', gap: '2px', textDecoration: 'none',
                color: isActive ? '#F5A623' : '#4A5568',
                position: 'relative', transition: 'color 0.2s',
              }}>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute', top: 0,
                      left: '50%', transform: 'translateX(-50%)',
                      width: '24px', height: '2px',
                      borderRadius: '1px', background: '#F5A623',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: '9px', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
