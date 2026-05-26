/**
 * Progress Service — Tracks per-user, per-lesson progress in Firestore.
 * Each user has a doc in `user_progress/{uid}` with a map of playlist keys to status.
 */
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface LessonProgress {
  completed: boolean;
  lastWatched?: string; // ISO date
  timeSpentSeconds?: number;
}

export type UserProgressMap = Record<string, LessonProgress>;

const COLLECTION = 'user_progress';

/**
 * Gets the full progress map for a user.
 */
export async function getUserProgress(uid: string): Promise<UserProgressMap> {
  try {
    const ref = doc(db, COLLECTION, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return (snap.data()?.lessons || {}) as UserProgressMap;
    }
    return {};
  } catch (e) {
    console.warn('Could not fetch progress:', e);
    return {};
  }
}

/**
 * Marks a playlist/lesson as started or completed.
 */
export async function markLessonProgress(
  uid: string,
  playlistKey: string,
  completed: boolean
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, uid);
    const snap = await getDoc(ref);
    const now = new Date().toISOString();

    if (snap.exists()) {
      await updateDoc(ref, {
        [`lessons.${playlistKey}`]: {
          completed,
          lastWatched: now,
        },
      });
    } else {
      await setDoc(ref, {
        uid,
        lessons: {
          [playlistKey]: {
            completed,
            lastWatched: now,
          },
        },
      });
    }
  } catch (e) {
    console.warn('Could not update progress:', e);
  }
}

/**
 * Returns a percentage (0-100) of completed lessons.
 */
export function getCompletionPercentage(
  progress: UserProgressMap,
  totalPlaylists: number
): number {
  if (totalPlaylists === 0) return 0;
  const completed = Object.values(progress).filter(p => p.completed).length;
  return Math.round((completed / totalPlaylists) * 100);
}
