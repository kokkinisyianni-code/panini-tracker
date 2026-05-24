'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { Collectible, CollectibleCategory } from '@/types';

export function useCollectibles() {
  const { user } = useAuthStore();
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, 'collectibles'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const items: Collectible[] = [];
      snap.forEach(d => items.push({ ...d.data() as Collectible, id: d.id }));
      items.sort((a, b) => a.name.localeCompare(b.name));
      setCollectibles(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const addCollectible = useCallback(async (data: Omit<Collectible, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'collectibles'), {
      ...data,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [user]);

  const toggleOwned = useCallback(async (id: string, owned: boolean) => {
    await updateDoc(doc(db, 'collectibles', id), { owned, updatedAt: serverTimestamp() });
  }, []);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    await updateDoc(doc(db, 'collectibles', id), { notes, updatedAt: serverTimestamp() });
  }, []);

  const removeCollectible = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'collectibles', id));
  }, []);

  return { collectibles, loading, addCollectible, toggleOwned, updateNotes, removeCollectible };
}
