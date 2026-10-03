import type { Story } from '../hooks/useStoryGenerator';

/**
 * Keeps the bookshelf in the browser's IndexedDB.
 * localStorage is too small: an illustrated story holds ~2 MB of image data URLs.
 * Every call quietly does nothing when IndexedDB is unavailable (private mode, tests).
 */
const DB_NAME = 'storyteller';
const STORE = 'stories';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
};

const run = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> => {
  if (typeof indexedDB === 'undefined') return undefined;
  try {
    const db = await openDb();
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Story storage unavailable:', error);
    return undefined;
  }
};

/** Saved stories, newest first */
export const loadStories = async (): Promise<Story[]> => {
  const stories = (await run<Story[]>('readonly', store => store.getAll())) ?? [];
  return stories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const saveStory = async (story: Story): Promise<void> => {
  await run('readwrite', store => store.put(story));
};

export const deleteStory = async (id: number): Promise<void> => {
  await run('readwrite', store => store.delete(id));
};
