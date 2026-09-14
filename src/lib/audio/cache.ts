"use client";

const DB_NAME = "siira-audio";
const STORE_NAME = "audio";
const DB_VERSION = 1;
export const MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50MB blueprint default

export interface CachedAudio {
  key: string;
  blob: Blob;
  size: number;
  createdAt: number;
  lastAccessedAt: number;
  language: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

export function audioCacheKey(text: string, language: string, voice?: string): string {
  const normalized = text.trim().toLowerCase();
  return `${language}:${voice ?? "default"}:${normalized}`;
}

async function getUsage(db: IDBDatabase): Promise<{ bytes: number; count: number }> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result ?? []) as CachedAudio[];
      resolve({
        bytes: items.reduce((acc, i) => acc + (i.size || 0), 0),
        count: items.length,
      });
    };
    req.onerror = () => reject(req.error);
  });
}

async function evictLRU(db: IDBDatabase, bytesNeeded: number): Promise<void> {
  const usage = await getUsage(db);
  if (usage.bytes + bytesNeeded <= MAX_CACHE_BYTES) return;

  const all: CachedAudio[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result ?? []) as CachedAudio[]);
    req.onerror = () => reject(req.error);
  });

  all.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

  let freed = 0;
  const target = usage.bytes + bytesNeeded - MAX_CACHE_BYTES;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const item of all) {
      if (freed >= target) break;
      store.delete(item.key);
      freed += item.size || 0;
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const item = req.result as CachedAudio | undefined;
        if (!item?.blob) {
          resolve(null);
          return;
        }
        item.lastAccessedAt = Date.now();
        store.put(item);
        resolve(item.blob);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function putCachedAudio(
  key: string,
  blob: Blob,
  language: string
): Promise<void> {
  try {
    const db = await openDB();
    await evictLRU(db, blob.size);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const now = Date.now();
      tx.objectStore(STORE_NAME).put({
        key,
        blob,
        size: blob.size,
        createdAt: now,
        lastAccessedAt: now,
        language,
      } satisfies CachedAudio);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("[AudioCache] put failed:", e);
  }
}

export async function getAudioCacheStats(): Promise<{ bytes: number; count: number; maxBytes: number }> {
  try {
    const db = await openDB();
    const usage = await getUsage(db);
    return { ...usage, maxBytes: MAX_CACHE_BYTES };
  } catch {
    return { bytes: 0, count: 0, maxBytes: MAX_CACHE_BYTES };
  }
}

export async function clearAudioCache(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("[AudioCache] clear failed:", e);
  }
}
