'use client';

import { useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

const STORAGE_KEY = 'panini_user_profile';

export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized, logout } = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as User;
          setUser(parsed);
          setLoading(false);
          setInitialized(true);
          return;
        } catch {}
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            }
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const credential = await signInAnonymously(auth);
      const uid = credential.user.uid;
      const displayName = `${firstName} ${lastName}`;
      const userData: User = {
        uid,
        firstName,
        lastName,
        displayName,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      }
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInExisting = async (existingUser: User) => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', existingUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      const userData = userDoc.data() as User;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      }
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    await auth.signOut();
    logout();
  };

  return { user, isLoading, isInitialized, signIn, signInExisting, signOut };
}
