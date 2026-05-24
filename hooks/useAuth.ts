'use client';

import { useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
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

  // Create brand new user with anonymous auth
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in as an existing user by signing in anonymously 
  // then loading their stored profile from Firestore
  // We use localStorage to remember which profile was chosen
  const signInExisting = async (existingUser: User) => {
    setLoading(true);
    try {
      // Sign in anonymously to get a Firebase auth session
      const credential = await signInAnonymously(auth);
      const uid = credential.user.uid;

      // If this is a different UID than the stored one,
      // we store the chosen profile in the user's auth document
      // and save their choice to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('panini_chosen_uid', existingUser.uid);
      }

      // Set the user to the chosen existing profile
      setUser(existingUser);
      return existingUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('panini_chosen_uid');
    }
    await auth.signOut();
    logout();
  };

  return { user, isLoading, isInitialized, signIn, signInExisting, signOut };
}
