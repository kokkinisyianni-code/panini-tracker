'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import StickerCard from '@/components/stickers/StickerCard';
import CollectiblesPanel from '@/components/stickers/CollectiblesPanel';
import { useCollection } from '@/hooks/useCollection';
import {
  STICKERS, TEAMS, TOTAL_STICKERS,
  CATEGORY_LABELS, CATEGORY_ICONS, ALL_CATEGORIES,
  getStickersByTeam,
} from '@/lib/stickers-data';
import { StickerCategory } from '@/types';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// ── Tab types ────────────────────────────────────────────────
type MainTab = 'stickers' | 'collectibles';
type StatusFilter = 'all' | 'collected' | 'missing' | 'duplicates';

function fireConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#F5A623','#4361EE','#06D6A0','#7209B7','#EF233C'] });
}

// ── Helpers ──────────────────────────────────────────────────
const GROUP_LABELS: Record<string, string> = {
  'FIFA': 'FIFA / Official',
  ...Object.fromEntries(TEAMS.map(t => [t, t])),
};

export default function CollectionPage() {
  const { collection, toggleSticker, setDuplicates, getCollectedCount, getCompletionPct } = useCollection();

  // Main tab
  const [mainTab, setMainTab] = useState<MainTab>('stickers');

  // Sticker filters
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<StickerCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const handleToggle = async (id: string) => {
    const sticker = STICKERS.find(s => s.id === id)!;
    const wasCollected = collection[id]?.collected;
    await toggleSticker(id);
    if (!wasCollected) {
      toast.success(`Got #${sticker.number} — ${sticker.name}! 🎉`);
      const teamStickers = getStickersByTeam(sticker.team);
      const allGot = teamStickers.every(s => s.id === id ? true : collection[s.id]?.collected);
      if (allGot) {
        setTimeout(() => { fireConfetti(); toast.success(`🏆 ${sticker.team} complete!`, { duration: 4000 }); }, 300);
      }
    }
  };

  const handleDuplicateChange = async (id: string, count: number) => {
    await setDuplicates(id, count);
  };

  // ── Filtered sticker list ─────────────────────────────────
  const filteredStickers = useMemo(() => {
    let list = STICKERS;

    // Team filter
    if (selectedTeam !== 'All') {
      list = list.filter(s => s.team === selectedTeam);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(s => s.category === selectedCategory);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.team.toLowerCase().includes(q) ||
        s.number.toString().includes(q)
      );
    }

    // Status
    switch (statusFilter) {
      case 'collected': list = list.filter(s => collection[s.id]?.collected); break;
      case 'missing':   list = list.filter(s => !collection[s.id]?.collected); break;
      case 'duplicates':list = list.filter(s => (collection[s.id]?.duplicates ?? 0) > 0); break;
    }

    return list;
  }, [search, selectedTeam, selectedCategory, statusFilter, collection]);

  // ── Team progress (when team selected) ───────────────────
  const teamProgress = useMemo(() => {
    if (selectedTeam === 'All') return null;
    const ts = getStickersByTeam(selectedTeam);
    const got = ts.filter(s => collection[s.id]?.collected).length;
    return { collected: got, total: ts.length, pct: Math.round((got / ts.length) * 100) };
  }, [selectedTeam, collection]);

  const pct = getCompletionPct();
  const collected = getCollectedCount();

  // ── Available categories for current team filter ──────────
  const availableCategories = useMemo(() => {
    const base = selectedTeam === 'All' ? STICKERS : STICKERS.filter(s => s.team === selectedTeam);
    const cats = [...new Set(base.map(s => s.category))] as StickerCategory[];
    return cats;
  }, [selectedTeam]);

  // Teams list — put FIFA at end
  const teamList = ['All', ...TEAMS.filter(t => t !== 'FIFA'), 'FIFA'];

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="font-display text-3xl gradient-text-gold">MY COLLECTION</h1>
            <p className="text-sm" style={{ color: '#8899BB' }}>{collected} / {TOTAL_STICKERS} stickers</p>
          </div>
          {/* Circular progress */}
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5"/>
              <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#cprog)" strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              <defs>
                <linearGradient id="cprog" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4361EE"/>
                  <stop offset="100%" stopColor="#7209B7"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-sm" style={{ color: '#F0F4FF' }}>{pct}%</span>
            </div>
          </div>
        </div>

        {/* ── Main tabs: Stickers / Collectibles ───────────── */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {([['stickers','📋','Stickers'],['collectibles','🎁','Collectibles']] as const).map(([tab, icon, label]) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMainTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: mainTab === tab ? 'linear-gradient(135deg,#4361EE,#7209B7)' : 'transparent',
                color: mainTab === tab ? '#fff' : '#4A5568',
                boxShadow: mainTab === tab ? '0 0 20px rgba(67,97,238,0.3)' : 'none',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>

        {/* ── STICKERS TAB ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {mainTab === 'stickers' && (
            <motion.div
              key="stickers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              {/* Team selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8899BB' }}>Filter by Team</p>
                <div className="overflow-x-auto -mx-4 px-4">
                  <div className="flex gap-2 w-max pb-1">
                    {teamList.map(team => (
                      <motion.button
                        key={team}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => { setSelectedTeam(team); setSelectedCategory('all'); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                        style={{
                          background: selectedTeam === team ? 'linear-gradient(135deg,#4361EE,#7209B7)' : 'rgba(255,255,255,0.05)',
                          color: selectedTeam === team ? '#fff' : '#8899BB',
                          boxShadow: selectedTeam === team ? '0 0 15px rgba(67,97,238,0.3)' : 'none',
                        }}
                      >
                        {team}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8899BB' }}>Filter by Type</p>
                <div className="overflow-x-auto -mx-4 px-4">
                  <div className="flex gap-2 w-max pb-1">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSelectedCategory('all')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                      style={{
                        background: selectedCategory === 'all' ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.05)',
                        color: selectedCategory === 'all' ? '#F5A623' : '#8899BB',
                        border: `1px solid ${selectedCategory === 'all' ? 'rgba(245,166,35,0.4)' : 'transparent'}`,
                      }}
                    >
                      ✦ All Types
                    </motion.button>
                    {availableCategories.map(cat => (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setSelectedCategory(cat)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5"
                        style={{
                          background: selectedCategory === cat ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.05)',
                          color: selectedCategory === cat ? '#F5A623' : '#8899BB',
                          border: `1px solid ${selectedCategory === cat ? 'rgba(245,166,35,0.4)' : 'transparent'}`,
                        }}
                      >
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span>{CATEGORY_LABELS[cat]}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team progress bar */}
              <AnimatePresence>
                {teamProgress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass rounded-2xl px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>{selectedTeam}</span>
                      <span className="font-mono text-sm" style={{ color: '#8899BB' }}>
                        {teamProgress.collected}/{teamProgress.total}
                        {teamProgress.pct === 100 && ' 🏆'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        className="progress-bar h-1.5"
                        initial={{ width: 0 }}
                        animate={{ width: `${teamProgress.pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: '#4A5568' }}>{teamProgress.pct}% complete</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search */}
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, number, or team..."
              />

              {/* Status pills */}
              <div className="flex gap-2">
                {(['all','missing','collected','duplicates'] as StatusFilter[]).map(mode => (
                  <motion.button
                    key={mode}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setStatusFilter(mode)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                    style={{
                      background: statusFilter === mode ? 'rgba(67,97,238,0.2)' : 'rgba(255,255,255,0.04)',
                      color: statusFilter === mode ? '#4361EE' : '#4A5568',
                      border: `1px solid ${statusFilter === mode ? 'rgba(67,97,238,0.3)' : 'transparent'}`,
                    }}
                  >
                    {mode}
                  </motion.button>
                ))}
              </div>

              {/* Count */}
              <p className="text-xs" style={{ color: '#4A5568' }}>{filteredStickers.length} stickers shown</p>

              {/* Grid */}
              <motion.div layout className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {filteredStickers.map(sticker => (
                    <StickerCard
                      key={sticker.id}
                      sticker={sticker}
                      entry={collection[sticker.id]}
                      onToggle={handleToggle}
                      onDuplicateChange={handleDuplicateChange}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredStickers.length === 0 && (
                <div className="flex flex-col items-center py-16 gap-3">
                  <span className="text-5xl">🔍</span>
                  <p className="font-semibold" style={{ color: '#8899BB' }}>No stickers found</p>
                  <p className="text-sm" style={{ color: '#4A5568' }}>Try different filters</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── COLLECTIBLES TAB ─────────────────────────────── */}
          {mainTab === 'collectibles' && (
            <motion.div
              key="collectibles"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <CollectiblesPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
