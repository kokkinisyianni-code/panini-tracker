'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { doc, updateDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useCollection } from '@/hooks/useCollection';
import { STICKERS } from '@/lib/stickers-data';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, setUser } = useAuthStore();
  const { collection: myCollection } = useCollection();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: displayName.trim() });
      setUser({ ...user, displayName: displayName.trim() });
      toast.success('Display name updated!');
    } catch (e) {
      toast.error('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const data = {
      user: { displayName: user?.displayName, uid: user?.uid },
      exportedAt: new Date().toISOString(),
      collection: Object.values(myCollection),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panini-collection-${user?.firstName?.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Collection exported!');
  };

  const handleReset = async () => {
    if (!user) return;
    setResetting(true);
    try {
      const q = query(collection(db, 'collections'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      toast.success('Collection reset successfully');
      setShowResetConfirm(false);
      router.refresh();
    } catch (e) {
      toast.error('Failed to reset collection');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const collectedCount = Object.values(myCollection).filter(e => e.collected).length;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-4">
        <div className="pt-1">
          <h1 className="font-display text-4xl gradient-text-gold">SETTINGS</h1>
          <p className="text-sm" style={{ color: '#8899BB' }}>Manage your account</p>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-5"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-2xl"
              style={{ background: 'linear-gradient(135deg, #4361EE, #7209B7)', color: '#fff' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#F0F4FF' }}>{user?.displayName}</p>
              <p className="text-sm" style={{ color: '#8899BB' }}>
                Collecting since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>UID: {user?.uid?.slice(0, 8)}...</p>
            </div>
          </div>

          <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: '#8899BB' }}>
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="flex-1"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveDisplayName}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #4361EE, #7209B7)', color: '#fff' }}
            >
              {saving ? '...' : 'Save'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#8899BB' }}>Collection Stats</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="font-display text-3xl gradient-text-blue">{collectedCount}</p>
              <p className="text-xs" style={{ color: '#4A5568' }}>Stickers collected</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl gradient-text-gold">
                {Object.values(myCollection).reduce((s, e) => s + (e.duplicates || 0), 0)}
              </p>
              <p className="text-xs" style={{ color: '#4A5568' }}>Duplicates</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8899BB' }}>Data</p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="glass rounded-2xl px-4 py-4 flex items-center gap-3 text-left"
          >
            <span className="text-2xl">📤</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#F0F4FF' }}>Export Collection</p>
              <p className="text-xs" style={{ color: '#4A5568' }}>Download as JSON file</p>
            </div>
          </motion.button>

          {!showResetConfirm ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowResetConfirm(true)}
              className="glass rounded-2xl px-4 py-4 flex items-center gap-3 text-left"
              style={{ borderColor: 'rgba(239,35,60,0.15)' }}
            >
              <span className="text-2xl">🗑️</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#EF233C' }}>Reset Collection</p>
                <p className="text-xs" style={{ color: '#4A5568' }}>Delete all collected stickers</p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(239,35,60,0.1)', border: '1px solid rgba(239,35,60,0.3)' }}
            >
              <p className="font-semibold text-sm mb-1" style={{ color: '#EF233C' }}>⚠️ Are you sure?</p>
              <p className="text-xs mb-3" style={{ color: '#8899BB' }}>
                This will delete all {collectedCount} collected stickers. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#8899BB' }}>
                  Cancel
                </button>
                <button onClick={handleReset} disabled={resetting}
                  className="flex-1 py-2 rounded-xl text-sm font-bold"
                  style={{ background: '#EF233C', color: '#fff' }}>
                  {resetting ? 'Resetting...' : 'Yes, Reset'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-display text-xl tracking-wider"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#4A5568', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            SIGN OUT
          </motion.button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
