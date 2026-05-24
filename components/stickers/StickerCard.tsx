'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sticker, CollectionEntry } from '@/types';

interface StickerCardProps {
  sticker: Sticker;
  entry?: CollectionEntry;
  onToggle: (id: string) => void;
  onDuplicateChange: (id: string, count: number) => void;
}

const categoryColors: Record<string, string> = {
  player: '#4361EE',
  team_badge: '#F5A623',
  stadium: '#06D6A0',
  special: '#7209B7',
  cover: '#EF233C',
  group: '#4CC9F0',
};

const categoryLabels: Record<string, string> = {
  player: 'Player',
  team_badge: 'Badge',
  stadium: 'Stadium',
  special: 'Special',
  cover: 'Cover',
  group: 'Squad',
};

export default function StickerCard({ sticker, entry, onToggle, onDuplicateChange }: StickerCardProps) {
  const collected = entry?.collected ?? false;
  const duplicates = entry?.duplicates ?? 0;
  const color = categoryColors[sticker.category] || '#4361EE';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl p-3 border transition-all ${collected ? 'sticker-collected' : ''}`}
      style={{
        background: collected ? undefined : 'rgba(15,22,35,0.8)',
        borderColor: collected ? 'rgba(6,214,160,0.3)' : 'rgba(255,255,255,0.06)',
        boxShadow: collected ? '0 0 15px rgba(6,214,160,0.08)' : 'none',
      }}
    >
      {/* Number + category badge */}
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
          style={{ background: `${color}20`, color }}>
          #{sticker.number}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: '#4A5568' }}>
          {categoryLabels[sticker.category]}
        </span>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold leading-tight mb-1 line-clamp-2"
        style={{ color: collected ? '#06D6A0' : '#F0F4FF' }}>
        {sticker.name}
      </p>

      {/* Team */}
      <p className="text-xs mb-3" style={{ color: '#4A5568' }}>{sticker.team}</p>

      {/* Collect button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onToggle(sticker.id)}
        className="w-full py-2 rounded-xl text-sm font-bold transition-all"
        style={{
          background: collected
            ? 'linear-gradient(135deg, rgba(6,214,160,0.2), rgba(6,214,160,0.08))'
            : 'rgba(255,255,255,0.05)',
          color: collected ? '#06D6A0' : '#8899BB',
          border: `1px solid ${collected ? 'rgba(6,214,160,0.3)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={collected ? 'yes' : 'no'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {collected ? '✓ Got it!' : '+ Collect'}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Duplicate counter - only show if collected */}
      {collected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 flex items-center justify-between"
        >
          <span className="text-xs" style={{ color: '#4A5568' }}>Duplicates:</span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onDuplicateChange(sticker.id, Math.max(0, duplicates - 1))}
              className="w-6 h-6 rounded-lg text-sm flex items-center justify-center"
              style={{ background: 'rgba(239,35,60,0.15)', color: '#EF233C' }}
            >−</motion.button>
            <span className="font-mono text-sm w-4 text-center" style={{ color: '#F0F4FF' }}>{duplicates}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onDuplicateChange(sticker.id, duplicates + 1)}
              className="w-6 h-6 rounded-lg text-sm flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}
            >+</motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
