'use client';

import { useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
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
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await auth.signOut();
    logout();
  };

  return { user, isLoading, isInitialized, signIn, signOut };
}
