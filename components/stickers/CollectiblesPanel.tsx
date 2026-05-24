'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollectibles } from '@/hooks/useCollectibles';
import { CollectibleCategory } from '@/types';
import toast from 'react-hot-toast';

const CATEGORY_META: Record<CollectibleCategory, { label: string; icon: string; color: string }> = {
  album:          { label: 'Album',          icon: '📒', color: '#4361EE' },
  tin:            { label: 'Tin Box',         icon: '🥫', color: '#F5A623' },
  multipack:      { label: 'Multipack',       icon: '📦', color: '#06D6A0' },
  limited_edition:{ label: 'Limited Edition', icon: '⭐', color: '#7209B7' },
  display_box:    { label: 'Display Box',     icon: '🗃️', color: '#EF233C' },
  other:          { label: 'Other',           icon: '🎁', color: '#8899BB' },
};

export default function CollectiblesPanel() {
  const { collectibles, loading, addCollectible, toggleOwned, updateNotes, removeCollectible } = useCollectibles();
  const [showAdd, setShowAdd] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<CollectibleCategory>('album');
  const [newOwned, setNewOwned] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Please enter a name'); return; }
    setSaving(true);
    try {
      await addCollectible({ name: newName.trim(), description: newDesc.trim(), category: newCat, owned: newOwned, notes: '' });
      toast.success(`Added "${newName}"!`);
      setNewName(''); setNewDesc(''); setNewCat('album'); setNewOwned(false);
      setShowAdd(false);
    } catch { toast.error('Failed to add collectible'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: string, owned: boolean) => {
    await toggleOwned(id, !owned);
    toast.success(!owned ? 'Marked as owned! 🎉' : 'Marked as not owned');
  };

  const handleSaveNotes = async (id: string) => {
    await updateNotes(id, notesText);
    setEditingNotes(null);
    toast.success('Notes saved');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return;
    await removeCollectible(id);
    toast.success('Removed');
  };

  const owned = collectibles.filter(c => c.owned).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8899BB' }}>
            Collectibles — Not Stickers
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
            Items you keep but don't stick · {owned}/{collectibles.length} owned
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-2 rounded-xl text-sm font-bold"
          style={{
            background: showAdd ? 'rgba(239,35,60,0.15)' : 'linear-gradient(135deg,#4361EE,#7209B7)',
            color: showAdd ? '#EF233C' : '#fff',
          }}
        >
          {showAdd ? '✕ Cancel' : '+ Add'}
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-4 flex flex-col gap-3">
              <p className="font-display text-lg" style={{ color: '#F5A623' }}>NEW COLLECTIBLE</p>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#8899BB' }}>Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Panini WC 2026 Starter Pack" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#8899BB' }}>Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. Includes 4 sticker packs + album" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#8899BB' }}>Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(CATEGORY_META) as [CollectibleCategory, typeof CATEGORY_META[CollectibleCategory]][]).map(([key, meta]) => (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setNewCat(key)}
                      className="py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: newCat === key ? `${meta.color}25` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${newCat === key ? meta.color + '50' : 'rgba(255,255,255,0.06)'}`,
                        color: newCat === key ? meta.color : '#4A5568',
                      }}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNewOwned(!newOwned)}
                  className="w-10 h-6 rounded-full relative transition-all"
                  style={{ background: newOwned ? '#06D6A0' : 'rgba(255,255,255,0.1)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                    style={{ left: newOwned ? '22px' : '4px' }} />
                </motion.button>
                <span className="text-sm" style={{ color: '#F0F4FF' }}>I already own this</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={saving}
                className="w-full py-3 rounded-xl font-display text-xl"
                style={{ background: 'linear-gradient(135deg,#4361EE,#7209B7)', color: '#fff' }}
              >
                {saving ? 'SAVING...' : 'ADD COLLECTIBLE'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        Array(2).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
      ) : collectibles.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <span className="text-4xl">🎁</span>
          <p className="font-semibold text-sm" style={{ color: '#8899BB' }}>No collectibles yet</p>
          <p className="text-xs text-center" style={{ color: '#4A5568' }}>Add albums, tins, limited editions<br/>and other items you keep but don't stick</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {collectibles.map((item, i) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
            const isEditingThis = editingNotes === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-4"
                style={{
                  borderColor: item.owned ? 'rgba(6,214,160,0.25)' : 'rgba(255,255,255,0.06)',
                  background: item.owned ? 'rgba(6,214,160,0.05)' : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Category icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${meta.color}18` }}>
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: item.owned ? '#06D6A0' : '#F0F4FF' }}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                            style={{ background: `${meta.color}18`, color: meta.color }}>
                            {meta.label}
                          </span>
                          {item.description && (
                            <span className="text-xs truncate" style={{ color: '#4A5568' }}>{item.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Own toggle */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggle(item.id!, item.owned)}
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all"
                        style={{
                          background: item.owned ? 'rgba(6,214,160,0.2)' : 'rgba(255,255,255,0.06)',
                          color: item.owned ? '#06D6A0' : '#4A5568',
                        }}
                      >
                        {item.owned ? '✓' : '○'}
                      </motion.button>
                    </div>

                    {/* Notes */}
                    {isEditingThis ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={notesText}
                          onChange={e => setNotesText(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 text-xs py-1.5"
                          style={{ fontSize: '12px', padding: '6px 10px' }}
                          autoFocus
                        />
                        <button onClick={() => handleSaveNotes(item.id!)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: 'rgba(67,97,238,0.2)', color: '#4361EE' }}>
                          Save
                        </button>
                        <button onClick={() => setEditingNotes(null)}
                          className="px-2 py-1.5 rounded-lg text-xs"
                          style={{ color: '#4A5568' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => { setEditingNotes(item.id!); setNotesText(item.notes || ''); }}
                          className="text-xs"
                          style={{ color: item.notes ? '#8899BB' : '#4A5568' }}
                        >
                          {item.notes ? `📝 ${item.notes}` : '+ Add note'}
                        </button>
                        <button onClick={() => handleDelete(item.id!, item.name)}
                          className="ml-auto text-xs px-2 py-0.5 rounded-lg"
                          style={{ color: '#4A5568' }}>
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
