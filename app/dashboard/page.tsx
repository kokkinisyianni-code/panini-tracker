'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { fetchAllUsersStats } from '@/hooks/useCollection';
import { TOTAL_STICKERS, TEAMS } from '@/lib/stickers-data';
import { UserStats } from '@/types';
import Link from 'next/link';

function StatCard({ label, value, sub, color, icon, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8899BB' }}>{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="font-display text-4xl" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: '#4A5568' }}>{sub}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { collection, getCollectedCount, getDuplicateCount, getCompletionPct } = useCollection();
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

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <p className="text-sm" style={{ color: '#8899BB' }}>Welcome back,</p>
          <h1 className="font-display text-4xl gradient-text-gold">{user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}</h1>
        </motion.div>

        {/* Progress hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1A0B2E 100%)', border: '1px solid rgba(67,97,238,0.2)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 opacity-10"
            style={{ background: 'radial-gradient(circle, #4361EE, transparent)' }} />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8899BB' }}>My Collection</p>
              <p className="font-display text-6xl gradient-text-blue">{pct}%</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl" style={{ color: '#F0F4FF' }}>{collected}</p>
              <p className="text-sm" style={{ color: '#8899BB' }}>of {TOTAL_STICKERS}</p>
              {myRank > 0 && (
                <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>
                  #{myRank} RANKED
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: '#4A5568' }}>
            <span>{missing} missing</span>
            <span>{duplicates} duplicates</span>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Collected" value={collected} icon="✅" color="#06D6A0" delay={0.15} sub={`${pct}% complete`} />
          <StatCard label="Missing" value={missing} icon="❌" color="#EF233C" delay={0.2} sub="stickers left" />
          <StatCard label="Duplicates" value={duplicates} icon="📦" color="#F5A623" delay={0.25} sub="to trade away" />
          <StatCard label="Teams" value={TEAMS.length - 1} icon="🌍" color="#4361EE" delay={0.3} sub="nations" />
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8899BB' }}>Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/collection', label: 'My Stickers', icon: '📋', color: '#4361EE' },
              { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', color: '#F5A623' },
              { href: '/trades', label: 'Find Trades', icon: '🔄', color: '#06D6A0' },
              { href: '/statistics', label: 'Team Stats', icon: '📊', color: '#7209B7' },
            ].map((item, i) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${item.color}20` }}>
                    {item.icon}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: '#F0F4FF' }}>{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mini leaderboard */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8899BB' }}>Top Collectors</p>
            <Link href="/leaderboard" className="text-xs" style={{ color: '#4361EE' }}>See all →</Link>
          </div>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-2xl" />
            ))
          ) : (
            leaderboard.slice(0, 3).map((u, i) => (
              <motion.div
                key={u.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <span className="text-xl">{['🥇', '🥈', '🥉'][i]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#F0F4FF' }}>{u.displayName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="progress-bar h-1" style={{ width: `${u.percentage}%` }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#8899BB' }}>{u.percentage}%</span>
                  </div>
                </div>
                <span className="font-display text-lg" style={{ color: u.uid === user?.uid ? '#F5A623' : '#4A5568' }}>
                  {u.collected}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
