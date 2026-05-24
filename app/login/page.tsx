'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInExisting } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingInAs, setLoggingInAs] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        const list: User[] = [];
        snap.forEach(d => list.push(d.data() as User));
        setUsers(list);
        if (list.length === 0) setShowNewForm(true);
      } catch (e) {
        setShowNewForm(true);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = async (user: User) => {
    setLoggingInAs(user.uid);
    try {
      await signInExisting(user);
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      router.push('/dashboard');
    } catch (err) {
      toast.error('Could not sign in. Please try again.');
    } finally {
      setLoggingInAs(null);
    }
  };

  const handleNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your first and last name');
      return;
    }
    setLoading(true);
    try {
      await signIn(firstName.trim(), lastName.trim());
      toast.success(`Welcome, ${firstName}! 🎉`);
      router.push('/dashboard');
    } catch (err) {
      toast.error('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const avatarColors = [
    'linear-gradient(135deg,#4361EE,#7209B7)',
    'linear-gradient(135deg,#06D6A0,#4361EE)',
    'linear-gradient(135deg,#F5A623,#EF233C)',
    'linear-gradient(135deg,#7209B7,#EF233C)',
    'linear-gradient(135deg,#06D6A0,#7209B7)',
    'linear-gradient(135deg,#4361EE,#06D6A0)',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: '#080C14',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', opacity:0.2, background:'radial-gradient(circle,#4361EE,transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'400px', height:'400px', borderRadius:'50%', opacity:0.15, background:'radial-gradient(circle,#7209B7,transparent 70%)' }}/>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'28px' }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            style={{ width:'72px', height:'72px', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', marginBottom:'16px', background:'linear-gradient(135deg,#4361EE,#7209B7)', boxShadow:'0 0 40px rgba(67,97,238,0.4)' }}
          >⚽</motion.div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'48px', lineHeight:1, background:'linear-gradient(135deg,#F5A623,#FFD166)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'.05em', textAlign:'center' }}>PANINI</h1>
          <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'17px', color:'#8899BB', letterSpacing:'.04em' }}>WORLD CUP 2026 TRACKER</p>
        </div>

        {/* Main card */}
        <div style={{ background:'rgba(15,22,35,0.9)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'24px' }}>

          {loadingUsers ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ height:'64px', borderRadius:'14px', background:'rgba(255,255,255,0.04)' }}/>
              ))}
            </div>
          ) : (
            <>
              {/* Existing users */}
              {users.length > 0 && !showNewForm && (
                <div>
                  <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#F0F4FF', marginBottom:'4px' }}>WHO ARE YOU?</h2>
                  <p style={{ fontSize:'12px', color:'#8899BB', marginBottom:'18px' }}>Pick your profile to continue</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {users.map((u, i) => (
                      <motion.button
                        key={u.uid}
                        initial={{ opacity:0, x:-10 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectUser(u)}
                        disabled={loggingInAs !== null}
                        style={{
                          width:'100%', display:'flex', alignItems:'center', gap:'14px',
                          padding:'12px 14px', borderRadius:'14px', cursor:'pointer', border:'none',
                          background: loggingInAs===u.uid ? 'rgba(67,97,238,0.15)' : 'rgba(255,255,255,0.05)',
                          transition:'all .15s', textAlign:'left',
                        }}
                      >
                        <div style={{ width:'44px', height:'44px', borderRadius:'12px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', color:'#fff', background: avatarColors[i % avatarColors.length] }}>
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:'15px', fontWeight:600, color:'#F0F4FF', marginBottom:'2px' }}>{u.displayName}</p>
                          <p style={{ fontSize:'11px', color:'#4A5568' }}>Tap to continue</p>
                        </div>
                        {loggingInAs === u.uid ? (
                          <div style={{ fontSize:'18px' }}>⏳</div>
                        ) : (
                          <div style={{ fontSize:'18px', color:'#4A5568' }}>→</div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Add new person */}
                  <div style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowNewForm(true)}
                      style={{
                        width:'100%', padding:'12px', borderRadius:'14px', cursor:'pointer',
                        border:'1px dashed rgba(255,255,255,0.15)', background:'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                        color:'#8899BB', fontSize:'13px', fontWeight:600,
                      }}
                    >
                      <span style={{ fontSize:'18px' }}>+</span>
                      New person? Add your name
                    </motion.button>
                  </div>
                </div>
              )}

              {/* New user form */}
              <AnimatePresence>
                {showNewForm && (
                  <motion.div
                    initial={{ opacity:0, y:10 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-10 }}
                  >
                    {users.length > 0 && (
                      <button onClick={()=>setShowNewForm(false)} style={{ background:'none', border:'none', color:'#8899BB', fontSize:'12px', cursor:'pointer', marginBottom:'14px', display:'flex', alignItems:'center', gap:'4px' }}>
                        ← Back to profiles
                      </button>
                    )}
                    <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'#F0F4FF', marginBottom:'4px' }}>JOIN THE CREW</h2>
                    <p style={{ fontSize:'12px', color:'#8899BB', marginBottom:'20px' }}>No password — just your name</p>

                    <form onSubmit={handleNewUser} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      <div>
                        <label style={{ fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em', color:'#8899BB', display:'block', marginBottom:'6px' }}>First Name</label>
                        <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Nikos" autoComplete="given-name" disabled={loading}
                          style={{ width:'100%', background:'#080C14', border:'1px solid rgba(255,255,255,0.1)', color:'#F0F4FF', borderRadius:'10px', padding:'12px 14px', fontSize:'15px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em', color:'#8899BB', display:'block', marginBottom:'6px' }}>Last Name</label>
                        <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Papadopoulos" autoComplete="family-name" disabled={loading}
                          style={{ width:'100%', background:'#080C14', border:'1px solid rgba(255,255,255,0.1)', color:'#F0F4FF', borderRadius:'10px', padding:'12px 14px', fontSize:'15px', fontFamily:"'DM Sans',sans-serif", outline:'none' }}/>
                      </div>
                      <motion.button type="submit" disabled={loading} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                        style={{ padding:'14px', borderRadius:'14px', border:'none', cursor:'pointer', fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', letterSpacing:'.05em', color:'#fff', background: loading?'#1a2340':'linear-gradient(135deg,#4361EE,#7209B7)', boxShadow: loading?'none':'0 0 30px rgba(67,97,238,0.4)' }}>
                        {loading ? 'JOINING...' : 'START COLLECTING'}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#2D3748', marginTop:'16px' }}>
          Private app for friends only · No data sold
        </p>
      </motion.div>
    </div>
  );
}
