/**
 * Lightweight analytics tracker — stores session and page-view data in Firestore.
 * No external services. Data shown directly in the Admin Dashboard.
 */
import { db } from '../firebase';
import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';

// Returns today's date as "YYYY-MM-DD"
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Prevents duplicate counts in same session
const SESSION_KEY = 'iq_session_started';
let sessionRecorded = false;

/**
 * Call once on app load. Records one session per browser tab per day.
 */
export async function recordSession(): Promise<void> {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');

    const dateKey = today();
    const ref = doc(db, 'analytics_sessions', dateKey);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { count: increment(1) }, { merge: true });
    } else {
      await setDoc(ref, { date: dateKey, count: 1, createdAt: serverTimestamp() });
    }
    sessionRecorded = true;
  } catch (e) {
    // Fail silently — analytics must never break the app
  }
}

/**
 * Call on every page navigation with the page name.
 */
export async function recordPageView(page: string): Promise<void> {
  try {
    const dateKey = today();
    const docId = `${dateKey}_${page}`;
    const ref = doc(db, 'analytics_pageviews', docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { views: increment(1) }, { merge: true });
    } else {
      await setDoc(ref, { date: dateKey, page, views: 1, createdAt: serverTimestamp() });
    }
  } catch (e) {
    // Fail silently
  }
}

/**
 * Records how long (seconds) the user spent on a page.
 * Call this before navigating away.
 */
export function startPageTimer(): () => number {
  const start = Date.now();
  return () => Math.round((Date.now() - start) / 1000);
}
