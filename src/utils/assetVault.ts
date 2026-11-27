export interface StoredAssetRecord {
  slotId: string;
  dataUrl?: string;
  fileName?: string;
  linkUrl?: string;
  linkLabel?: string;
  updatedAt: number;
}

const DB_NAME = 'krish_portfolio_assets_v1';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'slotId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getAllStoredAssets(): Promise<Record<string, StoredAssetRecord>> {
  const db = await openDb();
  if (!db) return {};
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const map: Record<string, StoredAssetRecord> = {};
        for (const item of req.result as StoredAssetRecord[]) {
          if (item?.slotId) map[item.slotId] = item;
        }
        resolve(map);
      };
      req.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
}
