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
import toast from 'react-hot-toast';

const S = {
  card: { background:'rgba(15,22,35,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'16px' },
  label: { fontSize:'10px', fontWeight:600 as const, textTransform:'uppercase' as const, letterSpacing:'.1em', color:'#8899BB', display:'block' as const, marginBottom:'6px' },
};

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, setUser } = useAuthStore();
  const { collection: myCollection } = useCollection();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: displayName.trim() });
      setUser({ ...user, displayName: displayName.trim() });
      toast.success('Display name updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleExport = () => {
    const data = { user: { displayName: user?.displayName }, exportedAt: new Date().toISOString(), collection: Object.values(myCollection) };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`panini-${user?.firstName?.toLowerCase()}.json`; a.click();
    URL.revokeObjectURL(url); toast.success('Exported!');
  };

  const handleReset = async () => {
    if (!user) return;
    try {
      const q = query(collection(db,'collections'),where('userId','==',user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach(d=>batch.delete(d.ref));
      await batch.commit();
      toast.success('Collection reset!');
      setShowResetConfirm(false);
    } catch { toast.error('Failed to reset'); }
  };

  const collected = Object.values(myCollection).filter(e=>e.collected).length;

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <div style={{ paddingTop:'4px' }}>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', lineHeight:1, background:'linear-gradient(135deg,#F5A623,#FFD166)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>SETTINGS</h1>
        </div>

        {/* Profile */}
        <div style={S.card}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px' }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#4361EE,#7209B7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'20px', color:'#fff' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p style={{ fontWeight:600, color:'#F0F4FF', marginBottom:'2px' }}>{user?.displayName}</p>
              <p style={{ fontSize:'11px', color:'#8899BB' }}>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <label style={S.label}>Display Name</label>
          <div style={{ display:'flex', gap:'8px' }}>
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} style={{ flex:1, background:'#080C14', border:'1px solid rgba(255,255,255,0.1)', color:'#F0F4FF', borderRadius:'10px', padding:'10px 14px', fontSize:'14px', fontFamily:"'DM Sans',sans-serif", outline:'none' }} />
            <motion.button whileTap={{scale:0.95}} onClick={handleSave} disabled={saving} style={{ padding:'10px 16px', borderRadius:'10px', background:'linear-gradient(135deg,#4361EE,#7209B7)', color:'#fff', border:'none', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              {saving?'...':'Save'}
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div style={S.card}>
          <p style={{ ...S.label, marginBottom:'12px' }}>Collection Stats</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', textAlign:'center' }}>
            <div>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'32px', background:'linear-gradient(135deg,#4361EE,#7209B7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{collected}</p>
              <p style={{ fontSize:'11px', color:'#4A5568' }}>Collected</p>
            </div>
            <div>
              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'32px', background:'linear-gradient(135deg,#F5A623,#FFD166)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{Object.values(myCollection).reduce((s,e)=>s+(e.duplicates||0),0)}</p>
              <p style={{ fontSize:'11px', color:'#4A5568' }}>Duplicates</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <motion.button whileTap={{scale:0.97}} onClick={handleExport} style={{ ...S.card, display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.07)', width:'100%', textAlign:'left' as const }}>
          <span style={{ fontSize:'24px' }}>📤</span>
          <div>
            <p style={{ fontWeight:600, fontSize:'14px', color:'#F0F4FF' }}>Export Collection</p>
            <p style={{ fontSize:'11px', color:'#4A5568' }}>Download as JSON</p>
          </div>
        </motion.button>

        {!showResetConfirm ? (
          <motion.button whileTap={{scale:0.97}} onClick={()=>setShowResetConfirm(true)} style={{ ...S.card, display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', border:'1px solid rgba(239,35,60,0.15)', width:'100%', textAlign:'left' as const }}>
            <span style={{ fontSize:'24px' }}>🗑️</span>
            <div>
              <p style={{ fontWeight:600, fontSize:'14px', color:'#EF233C' }}>Reset Collection</p>
              <p style={{ fontSize:'11px', color:'#4A5568' }}>Delete all stickers</p>
            </div>
          </motion.button>
        ) : (
          <div style={{ background:'rgba(239,35,60,0.08)', border:'1px solid rgba(239,35,60,0.3)', borderRadius:'16px', padding:'16px' }}>
            <p style={{ fontWeight:600, color:'#EF233C', marginBottom:'6px' }}>⚠️ Are you sure?</p>
            <p style={{ fontSize:'12px', color:'#8899BB', marginBottom:'14px' }}>This will delete all {collected} stickers. Cannot be undone.</p>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={()=>setShowResetConfirm(false)} style={{ flex:1, padding:'10px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', color:'#8899BB', border:'none', cursor:'pointer', fontWeight:600 }}>Cancel</button>
              <button onClick={handleReset} style={{ flex:1, padding:'10px', borderRadius:'10px', background:'#EF233C', color:'#fff', border:'none', cursor:'pointer', fontWeight:700 }}>Reset</button>
            </div>
          </div>
        )}

        <motion.button whileTap={{scale:0.97}} onClick={async()=>{await signOut();router.push('/login');}}
          style={{ padding:'16px', borderRadius:'16px', background:'rgba(255,255,255,0.04)', color:'#4A5568', border:'1px solid rgba(255,255,255,0.06)', fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', letterSpacing:'.05em', cursor:'pointer', width:'100%' }}>
          SIGN OUT
        </motion.button>
      </div>
    </AppLayout>
  );
}
