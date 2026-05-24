'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { fetchAllUsersStats } from '@/hooks/useCollection';
import { UserStats } from '@/types';
import { TOTAL_STICKERS } from '@/lib/stickers-data';

type SortKey = 'percentage' | 'collected' | 'duplicates' | 'missing';
const trophies = ['🥇','🥈','🥉'];
const trophyColors = ['#F5A623','#C0C0C0','#CD7F32'];

const S = {
  card: { background:'rgba(15,22,35,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'12px 14px' },
  pill: (on:boolean) => ({
    padding:'6px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:600 as const,
    cursor:'pointer' as const, border:'none', whiteSpace:'nowrap' as const, transition:'all .15s',
    background: on ? 'linear-gradient(135deg,#4361EE,#7209B7)' : 'rgba(255,255,255,0.05)',
    color: on ? '#fff' : '#8899BB',
  }),
};

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('percentage');

  useEffect(() => {
    fetchAllUsersStats().then(s => { setStats(s); setLoading(false); });
  }, []);

  const sorted = [...stats].sort((a,b) => sortKey==='missing' ? a[sortKey]-b[sortKey] : b[sortKey as keyof UserStats] as number - (a[sortKey as keyof UserStats] as number));
  const myEntry = sorted.find(s => s.uid === user?.uid);
  const myRank = sorted.findIndex(s => s.uid === user?.uid) + 1;
  const myPct = myEntry?.percentage ?? 0;

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <div style={{ paddingTop:'4px' }}>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', lineHeight:1, background:'linear-gradient(135deg,#F5A623,#FFD166)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>LEADERBOARD</h1>
          <p style={{ fontSize:'12px', color:'#8899BB' }}>{stats.length} collectors competing</p>
        </div>

        {/* My card */}
        {myEntry && (
          <div style={{ background:'linear-gradient(135deg,rgba(67,97,238,0.12),rgba(114,9,183,0.08))', border:'1px solid rgba(67,97,238,0.2)', borderRadius:'16px', padding:'16px' }}>
            <p style={{ fontSize:'10px', color:'#8899BB', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'10px' }}>Your Position</p>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'52px', lineHeight:1, background:'linear-gradient(135deg,#4361EE,#7209B7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>#{myRank}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'14px', fontWeight:600, color:'#F0F4FF', marginBottom:'6px' }}>{myEntry.displayName}</p>
                <div style={{ width:'100%', height:'5px', background:'rgba(255,255,255,0.05)', borderRadius:'9px', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${myPct}%` }} transition={{ delay:0.3, duration:0.8 }}
                    style={{ height:'100%', background:'linear-gradient(90deg,#4361EE,#7209B7)', borderRadius:'9px' }} />
                </div>
                <p style={{ fontSize:'11px', color:'#4361EE', marginTop:'4px' }}>{myPct}% complete</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'24px', marginTop:'12px' }}>
              {[{l:'Collected',v:myEntry.collected,c:'#06D6A0'},{l:'Missing',v:myEntry.missing,c:'#EF233C'},{l:'Doubles',v:myEntry.duplicates,c:'#F5A623'}].map(s=>(
                <div key={s.l} style={{ textAlign:'center' }}>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:s.c }}>{s.v}</p>
                  <p style={{ fontSize:'10px', color:'#4A5568' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort pills */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {([['percentage','% Complete'],['collected','Collected'],['missing','Missing'],['duplicates','Doubles']] as [SortKey,string][]).map(([k,l])=>(
            <button key={k} style={S.pill(sortKey===k)} onClick={()=>setSortKey(k)}>{l}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {loading ? [0,1,2,3].map(i=><div key={i} style={{ height:'72px', borderRadius:'14px', background:'rgba(255,255,255,0.04)' }}/>)
          : sorted.map((u,i)=>{
            const isMe = u.uid === user?.uid;
            const rank = i+1;
            return (
              <motion.div key={u.uid} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                style={{
                  ...S.card, display:'flex', alignItems:'center', gap:'10px', position:'relative',
                  background: isMe ? 'rgba(67,97,238,0.08)' : 'rgba(15,22,35,0.85)',
                  borderColor: isMe ? 'rgba(67,97,238,0.3)' : 'rgba(255,255,255,0.07)',
                }}>
                {rank<=3 && <div style={{ position:'absolute', top:0, left:0, width:'3px', height:'100%', borderRadius:'14px 0 0 14px', background:trophyColors[rank-1] }}/>}
                <div style={{ width:'28px', textAlign:'center', fontSize: rank<=3 ? '20px' : '13px', fontFamily: rank>3 ? "'Bebas Neue',sans-serif" : 'inherit', color: rank>3 ? '#4A5568' : 'inherit' }}>
                  {rank<=3 ? trophies[rank-1] : `#${rank}`}
                </div>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', background: isMe ? 'linear-gradient(135deg,#4361EE,#7209B7)' : 'rgba(255,255,255,0.07)' }}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'#F0F4FF' }}>{u.displayName}</p>
                    {isMe && <span style={{ fontSize:'9px', background:'rgba(67,97,238,0.2)', color:'#4361EE', padding:'1px 6px', borderRadius:'4px' }}>you</span>}
                  </div>
                  <div style={{ width:'100%', height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'9px', overflow:'hidden' }}>
                    <motion.div initial={{width:0}} animate={{width:`${u.percentage}%`}} transition={{delay:0.2+i*0.05,duration:0.6}}
                      style={{ height:'100%', background:'linear-gradient(90deg,#4361EE,#7209B7)', borderRadius:'9px' }}/>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', color: rank===1?'#F5A623':rank===2?'#C0C0C0':rank===3?'#CD7F32':'#4A5568' }}>{u.percentage}%</p>
                  <p style={{ fontSize:'10px', color:'#4A5568' }}>{u.collected}/{TOTAL_STICKERS}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
