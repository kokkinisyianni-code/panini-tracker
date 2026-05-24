'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { fetchAllUsersStats, fetchUserCollection } from '@/hooks/useCollection';
import { STICKERS, TOTAL_STICKERS } from '@/lib/stickers-data';
import { UserStats, CollectionEntry, PossibleTrade, Sticker } from '@/types';
import toast from 'react-hot-toast';

interface TradeMatch {
  sticker: Sticker;
  theyHaveDuplicate: boolean;
  iNeedIt: boolean;
  iHaveDuplicate: boolean;
  theyNeedIt: boolean;
  user: UserStats;
}

export default function TradesPage() {
  const { user } = useAuthStore();
  const [allUsers, setAllUsers] = useState<UserStats[]>([]);
  const [myCollection, setMyCollection] = useState<Record<string, CollectionEntry>>({});
  const [otherCollections, setOtherCollections] = useState<Record<string, Record<string, CollectionEntry>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      const stats = await fetchAllUsersStats();
      setAllUsers(stats.filter(u => u.uid !== user?.uid));

      // Fetch my collection
      if (user) {
        const mine = await fetchUserCollection(user.uid);
        setMyCollection(mine);

        // Fetch others
        const others: Record<string, Record<string, CollectionEntry>> = {};
        for (const u of stats) {
          if (u.uid !== user.uid) {
            others[u.uid] = await fetchUserCollection(u.uid);
          }
        }
        setOtherCollections(others);
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const tradeMatches = useMemo(() => {
    if (!user) return [];
    const matches: TradeMatch[] = [];
    const users = selectedUser === 'all' ? allUsers : allUsers.filter(u => u.uid === selectedUser);

    for (const otherUser of users) {
      const theirCol = otherCollections[otherUser.uid] || {};

      for (const sticker of STICKERS) {
        const myEntry = myCollection[sticker.id];
        const theirEntry = theirCol[sticker.id];

        const iHaveDuplicate = (myEntry?.duplicates ?? 0) > 0;
        const theyNeedIt = !theirEntry?.collected;
        const theyHaveDuplicate = (theirEntry?.duplicates ?? 0) > 0;
        const iNeedIt = !myEntry?.collected;

        if ((iHaveDuplicate && theyNeedIt) || (theyHaveDuplicate && iNeedIt)) {
          matches.push({
            sticker,
            theyHaveDuplicate,
            iNeedIt,
            iHaveDuplicate,
            theyNeedIt,
            user: otherUser,
          });
        }
      }
    }

    return matches;
  }, [myCollection, otherCollections, allUsers, selectedUser]);

  // Perfect trades = I have what they need AND they have what I need (different stickers)
  const perfectTrades = useMemo(() => {
    const result: { me: TradeMatch; them: TradeMatch; user: UserStats }[] = [];
    const users = selectedUser === 'all' ? allUsers : allUsers.filter(u => u.uid === selectedUser);

    for (const u of users) {
      const iCanGive = tradeMatches.filter(m => m.user.uid === u.uid && m.iHaveDuplicate && m.theyNeedIt);
      const iCanGet = tradeMatches.filter(m => m.user.uid === u.uid && m.theyHaveDuplicate && m.iNeedIt);
      if (iCanGive.length > 0 && iCanGet.length > 0) {
        result.push({ me: iCanGive[0], them: iCanGet[0], user: u });
      }
    }
    return result;
  }, [tradeMatches, allUsers, selectedUser]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-4">
        {/* Header */}
        <div className="pt-1">
          <h1 className="font-display text-4xl gradient-text-gold">TRADES</h1>
          <p className="text-sm" style={{ color: '#8899BB' }}>Find the perfect swaps with friends</p>
        </div>

        {/* User filter */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 w-max pb-1">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedUser('all')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: selectedUser === 'all' ? 'linear-gradient(135deg, #4361EE, #7209B7)' : 'rgba(255,255,255,0.05)',
                color: selectedUser === 'all' ? '#fff' : '#8899BB',
              }}
            >
              All Friends
            </motion.button>
            {allUsers.map(u => (
              <motion.button
                key={u.uid}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedUser(u.uid)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: selectedUser === u.uid ? 'linear-gradient(135deg, #4361EE, #7209B7)' : 'rgba(255,255,255,0.05)',
                  color: selectedUser === u.uid ? '#fff' : '#8899BB',
                }}
              >
                {u.firstName}
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Perfect trades */}
            {perfectTrades.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#06D6A0' }}>
                    Perfect Trades ({perfectTrades.length})
                  </p>
                </div>
                {perfectTrades.map((trade, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,214,160,0.1), rgba(6,214,160,0.04))',
                      border: '1px solid rgba(6,214,160,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display text-sm"
                        style={{ background: 'rgba(6,214,160,0.2)', color: '#06D6A0' }}>
                        {trade.user.firstName[0]}{trade.user.lastName[0]}
                      </div>
                      <p className="font-semibold text-sm" style={{ color: '#06D6A0' }}>{trade.user.displayName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 glass-light rounded-xl p-2 text-center">
                        <p className="text-xs mb-1" style={{ color: '#8899BB' }}>You give</p>
                        <p className="font-mono text-xs font-bold" style={{ color: '#F5A623' }}>#{trade.me.sticker.number}</p>
                        <p className="text-xs truncate" style={{ color: '#F0F4FF' }}>{trade.me.sticker.name}</p>
                      </div>
                      <span className="text-xl">⇄</span>
                      <div className="flex-1 glass-light rounded-xl p-2 text-center">
                        <p className="text-xs mb-1" style={{ color: '#8899BB' }}>You get</p>
                        <p className="font-mono text-xs font-bold" style={{ color: '#06D6A0' }}>#{trade.them.sticker.number}</p>
                        <p className="text-xs truncate" style={{ color: '#F0F4FF' }}>{trade.them.sticker.name}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toast.success(`Trade with ${trade.user.firstName} noted! 📱`)}
                      className="w-full mt-3 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(6,214,160,0.2)', color: '#06D6A0' }}
                    >
                      Arrange Trade
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* I can give */}
            {(() => {
              const iCanGive = tradeMatches.filter(m => m.iHaveDuplicate && m.theyNeedIt);
              if (!iCanGive.length) return null;
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📤</span>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#F5A623' }}>
                      I Can Give ({iCanGive.length})
                    </p>
                  </div>
                  {iCanGive.slice(0, 10).map((m, i) => (
                    <motion.div
                      key={`${m.sticker.id}-${m.user.uid}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                      <span className="font-mono text-sm font-bold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>
                        #{m.sticker.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#F0F4FF' }}>{m.sticker.name}</p>
                        <p className="text-xs" style={{ color: '#4A5568' }}>{m.sticker.team}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs" style={{ color: '#8899BB' }}>{m.user.firstName} needs it</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}

            {/* I can get */}
            {(() => {
              const iCanGet = tradeMatches.filter(m => m.theyHaveDuplicate && m.iNeedIt);
              if (!iCanGet.length) return null;
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📥</span>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4361EE' }}>
                      I Can Get ({iCanGet.length})
                    </p>
                  </div>
                  {iCanGet.slice(0, 10).map((m, i) => (
                    <motion.div
                      key={`${m.sticker.id}-${m.user.uid}-get`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                      <span className="font-mono text-sm font-bold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(67,97,238,0.15)', color: '#4361EE' }}>
                        #{m.sticker.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#F0F4FF' }}>{m.sticker.name}</p>
                        <p className="text-xs" style={{ color: '#4A5568' }}>{m.sticker.team}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs" style={{ color: '#8899BB' }}>{m.user.firstName} has spare</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}

            {tradeMatches.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <span className="text-5xl">🤷</span>
                <p className="font-semibold" style={{ color: '#8899BB' }}>No trades available</p>
                <p className="text-sm text-center" style={{ color: '#4A5568' }}>
                  Mark your duplicates in My Collection to unlock trades
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
