'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { fetchAllUsersStats } from '@/hooks/useCollection';
import { UserStats } from '@/types';
import { TOTAL_STICKERS } from '@/lib/stickers-data';

type SortKey = 'percentage' | 'collected' | 'duplicates' | 'missing';

const trophies = ['🥇', '🥈', '🥉'];
const trophyColors = ['#F5A623', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('percentage');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchAllUsersStats().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  const sorted = [...stats].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const myEntry = sorted.find(s => s.uid === user?.uid);
  const myRank = sorted.findIndex(s => s.uid === user?.uid) + 1;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-4">
        {/* Header */}
        <div className="pt-1">
          <h1 className="font-display text-4xl gradient-text-gold">LEADERBOARD</h1>
          <p className="text-sm" style={{ color: '#8899BB' }}>{stats.length} collectors competing</p>
        </div>

        {/* My position card */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(67,97,238,0.15), rgba(114,9,183,0.1))',
              border: '1px solid rgba(67,97,238,0.25)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
              style={{ background: 'radial-gradient(circle, #4361EE, transparent)' }} />
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8899BB' }}>Your Position</p>
            <div className="flex items-center gap-4">
              <div className="font-display text-5xl gradient-text-blue">#{myRank}</div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: '#F0F4FF' }}>{myEntry.displayName}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      className="progress-bar h-1.5"
                      initial={{ width: 0 }}
                      animate={{ width: `${myEntry.percentage}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </div>
                  <span className="font-mono text-sm" style={{ color: '#4361EE' }}>{myEntry.percentage}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Collected', v: myEntry.collected, color: '#06D6A0' },
                { label: 'Missing', v: myEntry.missing, color: '#EF233C' },
                { label: 'Doubles', v: myEntry.duplicates, color: '#F5A623' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="font-display text-xl" style={{ color: item.color }}>{item.v}</p>
                  <p className="text-xs" style={{ color: '#4A5568' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sort controls */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { key: 'percentage', label: '% Complete' },
            { key: 'collected', label: 'Collected' },
            { key: 'missing', label: 'Missing' },
            { key: 'duplicates', label: 'Doubles' },
          ] as { key: SortKey; label: string }[]).map(item => (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleSort(item.key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
              style={{
                background: sortKey === item.key ? 'rgba(67,97,238,0.2)' : 'rgba(255,255,255,0.04)',
                color: sortKey === item.key ? '#4361EE' : '#4A5568',
                border: `1px solid ${sortKey === item.key ? 'rgba(67,97,238,0.3)' : 'transparent'}`,
              }}
            >
              {item.label}
              {sortKey === item.key && <span>{sortAsc ? '↑' : '↓'}</span>}
            </motion.button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))
          ) : (
            <AnimatePresence>
              {sorted.map((u, i) => {
                const isMe = u.uid === user?.uid;
                const rank = i + 1;
                return (
                  <motion.div
                    key={u.uid}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass rounded-2xl px-4 py-3 relative overflow-hidden"
                    style={{
                      border: isMe ? '1px solid rgba(67,97,238,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      background: isMe ? 'rgba(67,97,238,0.08)' : undefined,
                    }}
                  >
                    {rank <= 3 && (
                      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                        style={{ background: trophyColors[rank - 1] }} />
                    )}
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-8 text-center">
                        {rank <= 3 ? (
                          <span className="text-2xl">{trophies[rank - 1]}</span>
                        ) : (
                          <span className="font-display text-lg" style={{ color: '#4A5568' }}>#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-base"
                        style={{
                          background: isMe
                            ? 'linear-gradient(135deg, #4361EE, #7209B7)'
                            : 'rgba(255,255,255,0.06)',
                          color: isMe ? '#fff' : '#8899BB',
                        }}>
                        {u.firstName[0]}{u.lastName[0]}
                      </div>

                      {/* Name + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm truncate" style={{ color: '#F0F4FF' }}>
                            {u.displayName}
                          </p>
                          {isMe && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(67,97,238,0.2)', color: '#4361EE' }}>you</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <motion.div
                              className="progress-bar h-1"
                              initial={{ width: 0 }}
                              animate={{ width: `${u.percentage}%` }}
                              transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-lg" style={{
                          color: rank === 1 ? '#F5A623' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#F0F4FF'
                        }}>
                          {u.percentage}%
                        </p>
                        <p className="text-xs" style={{ color: '#4A5568' }}>{u.collected}/{TOTAL_STICKERS}</p>
                      </div>
                    </div>

                    {/* Expanded stats row */}
                    <div className="flex gap-4 mt-2 pl-11">
                      <span className="text-xs" style={{ color: '#06D6A0' }}>✓ {u.collected}</span>
                      <span className="text-xs" style={{ color: '#EF233C' }}>✗ {u.missing}</span>
                      <span className="text-xs" style={{ color: '#F5A623' }}>⧉ {u.duplicates}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
