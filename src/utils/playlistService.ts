/**
 * Playlist Service — Manages playlists in Firestore.
 * Replaces the old /api/playlists SQLite backend that only worked locally.
 * 
 * On first load, seeds Firestore with the hardcoded playlists from data.ts
 * if the collection is empty. After that, Firestore is the single source of truth.
 */
import { db } from '../firebase';
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot
} from 'firebase/firestore';
import { playlists as defaultPlaylists } from '../data';
import { PlaylistInfo } from '../types';

const COLLECTION = 'playlists';

export interface PlaylistDoc {
  key: string;
  id: string;
  title: string;
  desc: string;
  thumbnail?: string;
  order?: number;
}

/**
 * Seeds Firestore with the default playlists from data.ts if the collection is empty.
 * Called once on app startup.
 */
export async function seedPlaylistsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    if (snap.empty) {
      console.log('Seeding playlists collection from data.ts...');
      const entries = Object.entries(defaultPlaylists);
      for (let i = 0; i < entries.length; i++) {
        const [key, info] = entries[i];
        await setDoc(doc(db, COLLECTION, key), {
          key,
          id: info.id,
          title: info.title,
          desc: info.desc,
          thumbnail: '',
          order: i,
        });
      }
      console.log(`Seeded ${entries.length} playlists.`);
    }
  } catch (e) {
    console.warn('Could not seed playlists (may lack permissions):', e);
  }
}

/**
 * Fetches all playlists from Firestore, sorted by order.
 * Falls back to data.ts playlists if Firestore is unavailable.
 */
export async function fetchPlaylists(): Promise<PlaylistDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    if (snap.empty) {
      // Return defaults
      return Object.entries(defaultPlaylists).map(([key, info], i) => ({
        key,
        id: info.id,
        title: info.title,
        desc: info.desc,
        order: i,
      }));
    }
    const docs = snap.docs.map(d => d.data() as PlaylistDoc);
    docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return docs;
  } catch (e) {
    console.warn('Firestore playlist fetch failed, using defaults:', e);
    return Object.entries(defaultPlaylists).map(([key, info], i) => ({
      key, id: info.id, title: info.title, desc: info.desc, order: i,
    }));
  }
}

/**
 * Converts playlist docs to the Record format used by App.tsx routing.
 */
export function playlistsToMap(docs: PlaylistDoc[]): Record<string, PlaylistInfo> {
  const map: Record<string, PlaylistInfo> = {};
  docs.forEach(p => {
    map[p.key] = { id: p.id, title: p.title, desc: p.desc };
  });
  return map;
}

/**
 * Creates or updates a playlist in Firestore.
 */
export async function savePlaylist(data: PlaylistDoc): Promise<void> {
  const ref = doc(db, COLLECTION, data.key);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      id: data.id,
      title: data.title,
      desc: data.desc,
      thumbnail: data.thumbnail || '',
      order: data.order ?? 99,
    });
  } else {
    await setDoc(ref, {
      key: data.key,
      id: data.id,
      title: data.title,
      desc: data.desc,
      thumbnail: data.thumbnail || '',
      order: data.order ?? 99,
    });
  }
}

/**
 * Deletes a playlist from Firestore.
 */
export async function deletePlaylistDoc(key: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, key));
}

/**
 * Subscribes to real-time playlist updates.
 */
export function onPlaylistsChanged(callback: (docs: PlaylistDoc[]) => void): () => void {
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const docs = snap.docs.map(d => d.data() as PlaylistDoc);
    docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    callback(docs);
  }, (error) => {
    console.error('Playlist snapshot error:', error);
  });
}
