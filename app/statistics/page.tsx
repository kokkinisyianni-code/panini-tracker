'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { fetchAllUsersStats, fetchUserCollection } from '@/hooks/useCollection';
import { STICKERS, TEAMS, getStickersByTeam } from '@/lib/stickers-data';
import { UserStats, CollectionEntry } from '@/types';

interface TeamStat {
  team: string;
  total: number;
  users: { uid: string; name: string; collected: number; pct: number }[];
}

export default function StatisticsPage() {
  const { user } = useAuthStore();
  const [allUsers, setAllUsers] = useState<UserStats[]>([]);
  const [allCollections, setAllCollections] = useState<Record<string, Record<string, CollectionEntry>>>({});
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const stats = await fetchAllUsersStats();
      setAllUsers(stats);
      const cols: Record<string, Record<string, CollectionEntry>> = {};
      for (const u of stats) {
        cols[u.uid] = await fetchUserCollection(u.uid);
      }
      setAllCollections(cols);
      setLoading(false);
    };
    load();
  }, []);

  const teamStats = useMemo((): TeamStat[] => {
    const gameTeams = TEAMS.filter(t => t !== 'FIFA');
    return gameTeams.map(team => {
      const teamStickers = getStickersByTeam(team);
      const teamIds = teamStickers.map(s => s.id);
      const users = allUsers.map(u => {
        const col = allCollections[u.uid] || {};
        const collected = teamIds.filter(id => col[id]?.collected).length;
        return {
          uid: u.uid,
          name: u.displayName,
          collected,
          pct: Math.round((collected / teamStickers.length) * 100),
        };
      }).sort((a, b) => b.pct - a.pct);

      return { team, total: teamStickers.length, users };
    }).sort((a, b) => {
      const myA = a.users.find(u => u.uid === user?.uid)?.pct ?? 0;
      const myB = b.users.find(u => u.uid === user?.uid)?.pct ?? 0;
      return myB - myA;
    });
  }, [allUsers, allCollections]);

  const myOverallStats = useMemo(() => {
    if (!user) return null;
    return allUsers.find(u => u.uid === user.uid) || null;
  }, [allUsers, user]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-4">
        <div className="pt-1">
          <h1 className="font-display text-4xl gradient-text-gold">STATISTICS</h1>
          <p className="text-sm" style={{ color: '#8899BB' }}>Team-by-team progress breakdown</p>
        </div>

        {/* My overall */}
        {myOverallStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8899BB' }}>Overall Progress</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: myOverallStats.collected, color: '#F0F4FF' },
                { label: 'Complete', value: `${myOverallStats.percentage}%`, color: '#4361EE' },
                { label: 'Missing', value: myOverallStats.missing, color: '#EF233C' },
                { label: 'Doubles', value: myOverallStats.duplicates, color: '#F5A623' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs" style={{ color: '#4A5568' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Team list */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8899BB' }}>By Team</p>
          {loading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)
          ) : (
            teamStats.map((ts, idx) => {
              const myProgress = ts.users.find(u => u.uid === user?.uid);
              const isExpanded = expandedTeam === ts.team;
              const pct = myProgress?.pct ?? 0;
              const isComplete = pct === 100;

              return (
                <motion.div
                  key={ts.team}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <motion.button
                    onClick={() => setExpandedTeam(isExpanded ? null : ts.team)}
                    className="w-full glass rounded-2xl px-4 py-3 text-left transition-all"
                    style={{
                      borderColor: isComplete ? 'rgba(6,214,160,0.3)' : 'rgba(255,255,255,0.06)',
                      background: isComplete ? 'rgba(6,214,160,0.06)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {isComplete && <span className="text-base">🏆</span>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-semibold text-sm" style={{ color: isComplete ? '#06D6A0' : '#F0F4FF' }}>
                            {ts.team}
                          </p>
                          <span className="font-mono text-xs" style={{ color: '#8899BB' }}>
                            {myProgress?.collected ?? 0}/{ts.total}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: isComplete
                                ? 'linear-gradient(90deg, #06D6A0, #4CC9F0)'
                                : 'linear-gradient(90deg, #4361EE, #7209B7)',
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: '#4A5568' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="glass-light rounded-b-2xl px-4 py-3 -mt-2 pt-4 flex flex-col gap-2">
                          {ts.users.map((u, i) => (
                            <div key={u.uid} className="flex items-center gap-2">
                              <span className="text-sm w-5">{['🥇','🥈','🥉'][i] || `#${i+1}`}</span>
                              <p className="text-xs font-medium w-20 truncate"
                                style={{ color: u.uid === user?.uid ? '#F5A623' : '#8899BB' }}>
                                {u.name.split(' ')[0]}
                              </p>
                              <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-1 rounded-full transition-all"
                                  style={{
                                    width: `${u.pct}%`,
                                    background: u.uid === user?.uid
                                      ? 'linear-gradient(90deg, #F5A623, #FFD166)'
                                      : 'linear-gradient(90deg, #4361EE, #7209B7)',
                                  }}
                                />
                              </div>
                              <span className="font-mono text-xs w-8 text-right"
                                style={{ color: u.pct === 100 ? '#06D6A0' : '#4A5568' }}>
                                {u.pct}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
