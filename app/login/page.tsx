'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '500px', height: '500px', borderRadius: '50%', opacity: 0.2,
          background: 'radial-gradient(circle, #4361EE, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '400px', height: '400px', borderRadius: '50%', opacity: 0.15,
          background: 'radial-gradient(circle, #7209B7, transparent 70%)',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
            style={{
              width: '80px', height: '80px', borderRadius: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', marginBottom: '20px',
              background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)',
              boxShadow: '0 0 40px rgba(67,97,238,0.4)',
            }}
          >⚽</motion.div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '52px', lineHeight: 1,
            background: 'linear-gradient(135deg, #F5A623, #FFD166)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}>PANINI</h1>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '18px', color: '#8899BB',
            letterSpacing: '0.04em', marginTop: '4px',
          }}>WORLD CUP 2026</p>
          <p style={{ fontSize: '13px', color: '#4A5568', marginTop: '10px', textAlign: 'center' }}>
            Track stickers with your friends
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(15,22,35,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '32px',
          }}
        >
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '26px', color: '#F0F4FF', marginBottom: '4px',
          }}>JOIN THE CREW</h2>
          <p style={{ fontSize: '13px', color: '#8899BB', marginBottom: '24px' }}>
            No password needed — just your name
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#8899BB', display: 'block', marginBottom: '8px',
              }}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Cristiano"
                autoComplete="given-name"
                disabled={loading}
                style={{
                  width: '100%', background: '#080C14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0F4FF', borderRadius: '10px',
                  padding: '12px 14px', fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif", outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#8899BB', display: 'block', marginBottom: '8px',
              }}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Ronaldo"
                autoComplete="family-name"
                disabled={loading}
                style={{
                  width: '100%', background: '#080C14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0F4FF', borderRadius: '10px',
                  padding: '12px 14px', fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif", outline: 'none',
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: '8px', width: '100%', padding: '14px',
                borderRadius: '14px', border: 'none', cursor: 'pointer',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '22px', letterSpacing: '0.05em', color: '#fff',
                background: loading ? '#1a2340' : 'linear-gradient(135deg, #4361EE, #7209B7)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(67,97,238,0.4)',
              }}
            >
              {loading ? 'JOINING...' : 'START COLLECTING'}
            </motion.button>
          </form>
        </motion.div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#2D3748', marginTop: '20px' }}>
          Private app for friends only · No data sold
        </p>
      </motion.div>
    </div>
  );
}
