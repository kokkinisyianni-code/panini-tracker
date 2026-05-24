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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#080C14' }}>
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4361EE, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7209B7, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 animate-float"
            style={{ background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)', boxShadow: '0 0 40px rgba(67,97,238,0.4)' }}
          >
            ⚽
          </motion.div>
          <h1 className="font-display text-5xl gradient-text-gold tracking-wider text-center">PANINI</h1>
          <p className="font-display text-xl mt-1" style={{ color: '#8899BB' }}>WORLD CUP 2026</p>
          <p className="text-sm mt-3 text-center" style={{ color: '#4A5568' }}>Track stickers with your friends</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-3xl p-8"
        >
          <h2 className="font-display text-2xl mb-1" style={{ color: '#F0F4FF' }}>JOIN THE CREW</h2>
          <p className="text-sm mb-6" style={{ color: '#8899BB' }}>No password needed — just your name</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: '#8899BB' }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Cristiano"
                autoComplete="given-name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: '#8899BB' }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Ronaldo"
                autoComplete="family-name"
                disabled={loading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 w-full py-4 rounded-2xl font-display text-xl tracking-wider text-white relative overflow-hidden"
              style={{
                background: loading ? '#1a2340' : 'linear-gradient(135deg, #4361EE, #7209B7)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(67,97,238,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  JOINING...
                </span>
              ) : 'START COLLECTING'}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-center text-xs mt-6" style={{ color: '#2D3748' }}>
          Private app for friends only · No data sold
        </p>
      </motion.div>
    </div>
  );
}
