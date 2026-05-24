'use client';

import { useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionStore } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import { CollectionEntry, UserStats } from '@/types';
import { STICKERS, TOTAL_STICKERS } from '@/lib/stickers-data';

export function useCollection() {
  const { user } = useAuthStore();
  const { collection: userCollection, setCollection, updateEntry, setLoading } = useCollectionStore();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, 'collections'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: Record<string, CollectionEntry> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CollectionEntry;
        entries[data.stickerId] = { ...data, id: docSnap.id };
      });
      setCollection(entries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleSticker = useCallback(
    async (stickerId: string) => {
      if (!user) return;

      const current = userCollection[stickerId];
      const newCollected = !current?.collected;

      // Optimistic update
      updateEntry(stickerId, {
        userId: user.uid,
        stickerId,
        collected: newCollected,
        duplicates: current?.duplicates ?? 0,
        updatedAt: new Date().toISOString(),
      });

      const docId = `${user.uid}_${stickerId}`;
      await setDoc(
        doc(db, 'collections', docId),
        {
          userId: user.uid,
          stickerId,
          collected: newCollected,
          duplicates: current?.duplicates ?? 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user, userCollection]
  );

  const setDuplicates = useCallback(
    async (stickerId: string, count: number) => {
      if (!user) return;

      const current = userCollection[stickerId];
      updateEntry(stickerId, {
        userId: user.uid,
        stickerId,
        collected: current?.collected ?? false,
        duplicates: count,
        updatedAt: new Date().toISOString(),
      });

      const docId = `${user.uid}_${stickerId}`;
      await setDoc(
        doc(db, 'collections', docId),
        {
          userId: user.uid,
          stickerId,
          collected: current?.collected ?? false,
          duplicates: count,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user, userCollection]
  );

  const getCollectedCount = () =>
    Object.values(userCollection).filter((e) => e.collected).length;

  const getDuplicateCount = () =>
    Object.values(userCollection).reduce((sum, e) => sum + (e.duplicates || 0), 0);

  const getCompletionPct = () =>
    Math.round((getCollectedCount() / TOTAL_STICKERS) * 100);

  return {
    collection: userCollection,
    toggleSticker,
    setDuplicates,
    getCollectedCount,
    getDuplicateCount,
    getCompletionPct,
  };
}

export async function fetchAllUsersStats(): Promise<UserStats[]> {
  const usersSnap = await getDocs(collection(db, 'users'));
  const stats: UserStats[] = [];

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const q = query(
      collection(db, 'collections'),
      where('userId', '==', userDoc.id)
    );
    const colSnap = await getDocs(q);

    let collected = 0;
    let duplicates = 0;
    colSnap.forEach((d) => {
      const data = d.data();
      if (data.collected) collected++;
      duplicates += data.duplicates || 0;
    });

    stats.push({
      uid: userDoc.id,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      collected,
      total: TOTAL_STICKERS,
      percentage: Math.round((collected / TOTAL_STICKERS) * 100),
      duplicates,
      missing: TOTAL_STICKERS - collected,
    });
  }

  return stats.sort((a, b) => b.percentage - a.percentage);
}

export async function fetchUserCollection(userId: string): Promise<Record<string, CollectionEntry>> {
  const q = query(collection(db, 'collections'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const result: Record<string, CollectionEntry> = {};
  snap.forEach((d) => {
    const data = d.data() as CollectionEntry;
    result[data.stickerId] = data;
  });
  return result;
}
