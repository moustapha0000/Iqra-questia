import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  role: 'user' | 'admin';
  xp: number;
  streak: number;
  lastActiveDate?: string;
  badges: string[];
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  earnXP: (amount: number) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  earnXP: async () => {},
  unlockBadge: async () => {},
  updateStreak: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Setup profile for a logged-in user
  const setupUserProfile = useCallback(async (currentUser: User) => {
    const userRef = doc(db, 'users', currentUser.uid);

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // Create new user profile in Firestore
        const initialProfile: any = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Anonyme',
          photoURL: currentUser.photoURL || '',
          email: currentUser.email || '',
          role: 'user',
          xp: 0,
          streak: 0,
          badges: ['welcome'],
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, initialProfile);
      }
    } catch (error: any) {
      console.error('Firestore profile setup error:', error?.message || error);
      // Even if Firestore fails, the user is still authenticated.
      // We build a local fallback profile so the app remains usable.
      const fallbackProfile: UserProfile = {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonyme',
        photoURL: currentUser.photoURL || '',
        email: currentUser.email || '',
        role: 'user',
        xp: 0,
        streak: 0,
        badges: ['welcome'],
        createdAt: new Date(),
      };
      setProfile(fallbackProfile);
      return null; // Signal that we couldn't connect to Firestore
    }

    // Setup real-time listener for user profile
    try {
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      }, (error) => {
        console.error('Profile snapshot error:', error);
        // Don't crash on snapshot errors
      });
      return unsubscribe;
    } catch (error) {
      console.error('Failed to setup profile listener:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Clean up previous profile listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setUser(currentUser);

      if (currentUser) {
        setAuthError(null);
        const unsub = await setupUserProfile(currentUser);
        if (unsub) {
          unsubscribeProfile = unsub;
        }
      } else {
        setProfile(null);
      }

      // ALWAYS set loading to false, regardless of any errors above
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [setupUserProfile]);

  // Auto trigger streak update on login
  useEffect(() => {
    if (user && profile && profile.uid) {
      updateStreak();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, profile?.uid]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError(null);

    try {
      // Use popup for all platforms to resolve missing initial state issues from session storage partitioning
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);

      if (error?.code === 'auth/popup-blocked') {
        setAuthError(
          "La fenêtre de connexion a été bloquée par votre navigateur. " +
          "Veuillez autoriser les fenêtres contextuelles (popups) pour ce site."
        );
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setAuthError("Connexion annulée par l'utilisateur (fenêtre fermée).");
      } else if (error?.code === 'auth/unauthorized-domain') {
        setAuthError(
          "Ce domaine n'est pas autorisé dans la console Firebase. " +
          "Ajoutez ce domaine dans Authentication > Settings > Authorized domains."
        );
      } else if (error?.code === 'auth/network-request-failed') {
        setAuthError("Erreur réseau. Vérifiez votre connexion internet.");
      } else if (error?.code === 'auth/internal-error') {
        setAuthError(
          "Erreur interne Firebase. Vérifiez que le fournisseur Google est activé " +
          "dans Firebase Console > Authentication > Sign-in method."
        );
      } else {
        setAuthError(`Erreur de connexion : ${error.code || error.message}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setAuthError(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const earnXP = async (amount: number) => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      const newXP = (profile.xp || 0) + amount;
      await updateDoc(userRef, { xp: newXP });

      // Auto unlock badges based on XP levels
      if (newXP >= 500 && !profile.badges?.includes('xp_500')) {
        await unlockBadge('xp_500');
      }
      if (newXP >= 1000 && !profile.badges?.includes('xp_1000')) {
        await unlockBadge('xp_1000');
      }
    } catch (error) {
      console.error("Error updating XP:", error);
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (!user || !profile) return;
    if (profile.badges?.includes(badgeId)) return;

    const userRef = doc(db, 'users', user.uid);
    try {
      const updatedBadges = [...(profile.badges || []), badgeId];
      await updateDoc(userRef, { badges: updatedBadges });

      // Create a visual toast notification
      const event = new CustomEvent('show-badge-notification', { detail: { badgeId } });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error unlocking badge:", error);
    }
  };

  const updateStreak = async () => {
    if (!user || !profile) return;
    const todayStr = getLocalDateString();
    const yesterdayStr = getYesterdayDateString();
    const userRef = doc(db, 'users', user.uid);

    try {
      let newStreak = profile.streak || 0;

      if (!profile.lastActiveDate) {
        newStreak = 1;
        await updateDoc(userRef, { streak: newStreak, lastActiveDate: todayStr });
      } else if (profile.lastActiveDate === yesterdayStr) {
        newStreak = (profile.streak || 0) + 1;
        await updateDoc(userRef, { streak: newStreak, lastActiveDate: todayStr });

        // Earn XP bonus for maintaining streak
        await earnXP(10);

        // Auto unlock streak badges
        if (newStreak >= 3 && !profile.badges?.includes('streak_3')) {
          await unlockBadge('streak_3');
        }
        if (newStreak >= 7 && !profile.badges?.includes('streak_7')) {
          await unlockBadge('streak_7');
        }
      } else if (profile.lastActiveDate !== todayStr) {
        // Streak is broken
        newStreak = 1;
        await updateDoc(userRef, { streak: newStreak, lastActiveDate: todayStr });
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, signInWithGoogle, logout, earnXP, unlockBadge, updateStreak }}>
      {children}
    </AuthContext.Provider>
  );
};
