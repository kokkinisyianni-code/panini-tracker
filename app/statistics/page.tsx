'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import { fetchAllUsersStats, fetchUserCollection } from '@/hooks/useCollection';
import { STICKERS, TEAMS, getStickersByTeam } from '@/lib/stickers-data';
import { UserStats, CollectionEntry } from '@/types';

export default function StatisticsPage() {
  const { user } = useAuthStore();
  const [allUsers, setAllUsers] = useState<UserStats[]>([]);
  const [allCollections, setAllCollections] = useState<Record<string, Record<string, CollectionEntry>>>({});
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const stats = await fetchAllUsersStats();
      setAllUsers(stats);
      const cols: Record<string, Record<string, CollectionEntry>> = {};
      for (const u of stats) { cols[u.uid] = await fetchUserCollection(u.uid); }
      setAllCollections(cols);
      setLoading(false);
    };
    load();
  }, []);

  const gameTeams = TEAMS.filter(t => t !== 'FIFA');
  const myStats = allUsers.find(u => u.uid === user?.uid);

  const teamStats = useMemo(() => gameTeams.map(team => {
    const ts = getStickersByTeam(team);
    const users = allUsers.map(u => {
      const col = allCollections[u.uid] || {};
      const collected = ts.filter(s => col[s.id]?.collected).length;
      return { uid: u.uid, name: u.displayName, firstName: u.firstName, lastName: u.lastName, collected, pct: Math.round(collected/ts.length*100) };
    }).sort((a,b) => b.pct-a.pct);
    return { team, total: ts.length, users };
  }).sort((a,b) => {
    const myA = a.users.find(u=>u.uid===user?.uid)?.pct??0;
    const myB = b.users.find(u=>u.uid===user?.uid)?.pct??0;
    return myB-myA;
  }), [allUsers, allCollections]);

  return (
    <AppLayout>
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <div style={{ paddingTop:'4px' }}>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', lineHeight:1, background:'linear-gradient(135deg,#F5A623,#FFD166)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>STATISTICS</h1>
          <p style={{ fontSize:'12px', color:'#8899BB' }}>Team-by-team breakdown</p>
        </div>

        {/* Overall */}
        {myStats && (
          <div style={{ background:'rgba(15,22,35,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'14px' }}>
            <p style={{ fontSize:'10px', color:'#8899BB', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'12px' }}>Overall Progress</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', textAlign:'center' }}>
              {[{l:'Total',v:myStats.collected,c:'#F0F4FF'},{l:'Complete',v:`${myStats.percentage}%`,c:'#4361EE'},{l:'Missing',v:myStats.missing,c:'#EF233C'},{l:'Doubles',v:myStats.duplicates,c:'#F5A623'}].map(s=>(
                <div key={s.l}>
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'24px', color:s.c }}>{s.v}</p>
                  <p style={{ fontSize:'10px', color:'#4A5568' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team list */}
        <div>
          <p style={{ fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em', color:'#8899BB', marginBottom:'10px' }}>By Team</p>
          {loading ? [0,1,2,3,4].map(i=><div key={i} style={{ height:'56px', borderRadius:'14px', background:'rgba(255,255,255,0.04)', marginBottom:'6px' }}/>)
          : teamStats.map((ts,idx)=>{
            const myP = ts.users.find(u=>u.uid===user?.uid);
            const pct = myP?.pct??0;
            const done = pct===100;
            const isOpen = expandedTeam===ts.team;
            return (
              <div key={ts.team} style={{ marginBottom:'6px' }}>
                <button onClick={()=>setExpandedTeam(isOpen?null:ts.team)} style={{
                  width:'100%', textAlign:'left', cursor:'pointer', border:'none',
                  background: done ? 'rgba(6,214,160,0.06)' : 'rgba(15,22,35,0.85)',
                  borderRadius: isOpen ? '14px 14px 0 0' : '14px',
                  outline: `1px solid ${done?'rgba(6,214,160,0.25)':'rgba(255,255,255,0.07)'}`,
                  padding:'10px 14px',
                }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      {done && <span style={{ fontSize:'14px' }}>🏆</span>}
                      <span style={{ fontSize:'13px', fontWeight:600, color: done?'#06D6A0':'#F0F4FF' }}>{ts.team}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontFamily:'monospace', fontSize:'10px', color:'#8899BB' }}>{myP?.collected??0}/{ts.total}</span>
                      <span style={{ fontSize:'11px', color:'#4A5568' }}>{isOpen?'▲':'▼'}</span>
                    </div>
                  </div>
                  <div style={{ width:'100%', height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'9px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: done?'linear-gradient(90deg,#06D6A0,#4CC9F0)':'linear-gradient(90deg,#F5A623,#FFD166)', borderRadius:'9px', transition:'width .5s' }}/>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      style={{ overflow:'hidden', background:'rgba(20,28,46,0.6)', border:'1px solid rgba(255,255,255,0.07)', borderTop:'none', borderRadius:'0 0 14px 14px', padding:'10px 14px' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                        {ts.users.map((u,i)=>(
                          <div key={u.uid} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <span style={{ fontSize:'11px', width:'20px' }}>{['🥇','🥈','🥉'][i]||`#${i+1}`}</span>
                            <span style={{ fontSize:'11px', fontWeight:500, width:'60px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: u.uid===user?.uid?'#F5A623':'#8899BB' }}>{u.firstName}</span>
                            <div style={{ flex:1, height:'3px', background:'rgba(255,255,255,0.05)', borderRadius:'9px', overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${u.pct}%`, background: u.uid===user?.uid?'linear-gradient(90deg,#F5A623,#FFD166)':'linear-gradient(90deg,#4361EE,#7209B7)', borderRadius:'9px' }}/>
                            </div>
                            <span style={{ fontFamily:'monospace', fontSize:'10px', color: u.pct===100?'#06D6A0':'#4A5568', width:'30px', textAlign:'right' }}>{u.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
