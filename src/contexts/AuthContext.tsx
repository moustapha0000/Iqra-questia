import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { SubscriptionTier } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: SubscriptionTier;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateSubscription: (plan: SubscriptionTier) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: 'free',
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionTier>('free');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user document exists, if not create it
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              email: currentUser.email || '',
              role: 'user',
              subscription: 'free',
              subscriptionStartDate: null,
              subscriptionEndDate: null,
              isAnnual: false,
              createdAt: serverTimestamp(),
            });
            setSubscription('free');
          } else {
            const data = userSnap.data();
            setSubscription((data?.subscription as SubscriptionTier) || 'free');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setSubscription('free');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updateSubscription = async (plan: SubscriptionTier) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    try {
      await updateDoc(userRef, {
        subscription: plan,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        updatedAt: serverTimestamp(),
      });
      setSubscription(plan);
    } catch (error) {
      // If document doesn't exist yet, create it
      try {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          email: user.email || '',
          role: 'user',
          subscription: plan,
          subscriptionStartDate: now.toISOString(),
          subscriptionEndDate: endDate.toISOString(),
          isAnnual: false,
          createdAt: serverTimestamp(),
        });
        setSubscription(plan);
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, subscription, signInWithGoogle, logout, updateSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};
