import { OfflineDraft } from '../types/models';

const LOCAL_STORAGE_KEY = 'seva_sutra_demo_state_v1';
const IDB_NAME = 'SevaSutraOfflineDB';
const IDB_STORE = 'offline_drafts';

export function saveStateToLocalStorage<T>(data: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

export function loadStateFromLocalStorage<T>(): T | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function clearLocalStorageState(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Saves an offline verification draft into IndexedDB (with LocalStorage fallback)
 * for resilient offline recovery.
 */
export async function saveOfflineDraftToIndexedDB(draft: OfflineDraft): Promise<void> {
  try {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return;
    }
    const db = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(draft);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Graceful fallback already handled by localStorage state
  }
}

export async function loadOfflineDraftFromIndexedDB(id: string): Promise<OfflineDraft | null> {
  try {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return null;
    }
    const db = await openOfflineDB();
    const result = await new Promise<OfflineDraft | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as OfflineDraft) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
