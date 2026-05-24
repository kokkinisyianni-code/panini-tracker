'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { fetchAllUsersStats } from '@/hooks/useCollection';
import { TOTAL_STICKERS } from '@/lib/stickers-data';
import { UserStats } from '@/types';
import Link from 'next/link';

const S = {
  card: {
    background: 'rgba(15,22,35,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '12px 14px',
  },
  label: { fontSize: '11px', color: '#8899BB', marginBottom: '4px' },
  sectionTitle: {
    fontSize: '10px', fontWeight: 600 as const,
    textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#8899BB',
  },
};

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#8899BB', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: '22px' }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { getCollectedCount, getDuplicateCount, getCompletionPct } = useCollection();
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  const collected = getCollectedCount();
  const duplicates = getDuplicateCount();
  const pct = getCompletionPct();
  const missing = TOTAL_STICKERS - collected;

  useEffect(() => {
    fetchAllUsersStats().then(stats => {
      setLeaderboard(stats.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const myRank = leaderboard.findIndex(u => u.uid === user?.uid) + 1;

  const quickActions = [
    { href: '/collection', label: 'My Stickers', icon: '📋', color: '#4361EE' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', color: '#F5A623' },
    { href: '/trades', label: 'Find Trades', icon: '🔄', color: '#06D6A0' },
    { href: '/statistics', label: 'Team Stats', icon: '📊', color: '#7209B7' },
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Welcome */}
        <div style={{ paddingTop: '4px' }}>
          <p style={{ fontSize: '13px', color: '#8899BB' }}>Welcome back,</p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '38px', lineHeight: 1,
            background: 'linear-gradient(135deg, #F5A623, #FFD166)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}</h1>
        </div>

        {/* Hero progress */}
        <div style={{
          background: 'linear-gradient(135deg, #0F1B3D, #1A0B2E)',
          border: '1px solid rgba(67,97,238,0.2)',
          borderRadius: '18px', padding: '18px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '160px', height: '160px',
            opacity: 0.1, background: 'radial-gradient(circle, #4361EE, transparent)',
          }} />
          <p style={{ fontSize: '10px', color: '#8899BB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>My Collection</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '56px', lineHeight: 1,
              background: 'linear-gradient(135deg, #4361EE, #7209B7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{pct}%</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#F0F4FF' }}>{collected}</div>
              <div style={{ fontSize: '12px', color: '#8899BB' }}>of {TOTAL_STICKERS}</div>
              {myRank > 0 && (
                <div style={{
                  marginTop: '6px', background: 'rgba(245,166,35,0.15)', color: '#F5A623',
                  fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px',
                }}>#{myRank} RANKED</div>
              )}
            </div>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '9px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '9px', background: 'linear-gradient(90deg, #4361EE, #7209B7)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#4A5568' }}>
            <span>{missing} missing</span>
            <span>{duplicates} duplicates</span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatCard label="Collected" value={collected} icon="✅" color="#06D6A0" />
          <StatCard label="Missing" value={missing} icon="❌" color="#EF233C" />
          <StatCard label="Duplicates" value={duplicates} icon="📦" color="#F5A623" />
          <StatCard label="Teams" value="49" icon="🌍" color="#4361EE" />
        </div>

        {/* Quick actions */}
        <div>
          <p style={{ ...S.sectionTitle, marginBottom: '10px' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {quickActions.map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    ...S.card, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', background: `${item.color}20`, flexShrink: 0,
                  }}>{item.icon}</div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF' }}>{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mini leaderboard */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={S.sectionTitle}>Top Collectors</p>
            <Link href="/leaderboard" style={{ fontSize: '12px', color: '#4361EE', textDecoration: 'none' }}>See all →</Link>
          </div>
          {loading ? (
            [0,1,2].map(i => <div key={i} style={{ height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }} />)
          ) : (
            leaderboard.slice(0, 3).map((u, i) => (
              <motion.div
                key={u.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}
              >
                <span style={{ fontSize: '20px' }}>{['🥇','🥈','🥉'][i]}</span>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                  background: u.uid === user?.uid ? 'linear-gradient(135deg,#4361EE,#7209B7)' : 'rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#fff',
                }}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF', marginBottom: '4px' }}>{u.displayName}</p>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '9px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${u.percentage}%`, background: 'linear-gradient(90deg,#4361EE,#7209B7)', borderRadius: '9px' }} />
                  </div>
                </div>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
                  color: u.uid === user?.uid ? '#F5A623' : '#4A5568',
                }}>{u.percentage}%</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
