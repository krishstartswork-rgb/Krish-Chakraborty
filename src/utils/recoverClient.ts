import { SITE_EXPERIMENTS_CONFIG, SITE_MEDIA_ASSETS } from '../data/siteAssets';
import { StoredAssetRecord, getAllStoredAssets } from './assetVault';

export interface ExperimentsBrowserBackup {
  notesText: string;
  reelExternalUrl: string;
  reelBlob: Blob | null;
  reelExt: string;
}

export async function checkRecoveryServerAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/__recover-ping', { method: 'GET', cache: 'no-store' });
    if (!res.ok) return false;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) return false;
    const data = (await res.json()) as { dev?: boolean };
    return Boolean(data?.dev);
  } catch {
    return false;
  }
}

function inferVideoExt(mimeType: string, fileName?: string): string {
  const lower = (mimeType || '').toLowerCase();
  if (lower.includes('webm')) return 'webm';
  if (lower.includes('quicktime') || lower.includes('mov')) return 'mov';
  if (lower.includes('mp4')) return 'mp4';
  const fromName = fileName?.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return 'mp4';
}

export async function readExperimentsFromBrowser(): Promise<ExperimentsBrowserBackup> {
  let notesText = '';
  let reelExternalUrl = '';
  let reelBlob: Blob | null = null;
  let reelExt = 'mp4';

  try {
    notesText = window.localStorage.getItem('krish_experiments_textbox_v1') ?? '';
    reelExternalUrl = window.localStorage.getItem('krish_experiments_reel_url_v1') ?? '';
  } catch {
    // Ignore storage read errors
  }

  try {
    if ('indexedDB' in window) {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = window.indexedDB.open('krish_experiments_reel_db', 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains('reels')) {
            req.result.createObjectStore('reels', { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const rec = await new Promise<{ blob?: Blob; fileName?: string; mimeType?: string } | null>(
        (resolve) => {
          if (!db.objectStoreNames.contains('reels')) {
            resolve(null);
            return;
          }
          const tx = db.transaction('reels', 'readonly');
          const req = tx.objectStore('reels').get('primary-reel');
          req.onsuccess = () =>
            resolve(
              (req.result as { blob?: Blob; fileName?: string; mimeType?: string } | undefined) ??
                null,
            );
          req.onerror = () => resolve(null);
        },
      );
      if (rec?.blob) {
        reelBlob = rec.blob;
        reelExt = inferVideoExt(rec.mimeType || rec.blob.type, rec.fileName);
      }
    }
  } catch {
    // Ignore reel db read errors
  }

  return { notesText, reelExternalUrl, reelBlob, reelExt };
}

export async function checkPublicAssetExists(url?: string): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) return false;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html')) return false;
    return true;
  } catch {
    return false;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export async function postRecoverItem(payload: unknown): Promise<{
  ok: boolean;
  savedImage?: boolean;
  savedLink?: boolean;
  error?: string;
}> {
  const res = await fetch('/__recover-item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    if (res.status === 413) {
      throw new Error('A single file exceeded the server upload size limit.');
    }
    throw new Error(
      `Preview server unavailable (HTTP ${res.status}). Open this inside the Development preview URL.`,
    );
  }
  const data = (await res.json()) as {
    ok: boolean;
    savedImage?: boolean;
    savedLink?: boolean;
    error?: string;
  };
  if (!data.ok) {
    throw new Error(data.error || 'Could not save asset item.');
  }
  return data;
}

export async function findPendingDiskRestores(): Promise<{
  pendingRecords: StoredAssetRecord[];
  missingManifestSlots: string[];
  needsNotesOrLink: boolean;
  needsReelVideo: boolean;
}> {
  const [allMap, exp] = await Promise.all([getAllStoredAssets(), readExperimentsFromBrowser()]);
  const records = Object.values(allMap).filter((r) => Boolean(r.dataUrl || r.linkUrl));

  const manifestEntries = Object.entries(SITE_MEDIA_ASSETS).filter(([, v]) => Boolean(v?.imageUrl));
  const missingChecks = await Promise.all(
    manifestEntries.map(async ([slotId, v]) => {
      const ok = await checkPublicAssetExists(v.imageUrl);
      return ok ? null : slotId;
    }),
  );
  const missingManifestSlots = missingChecks.filter((s): s is string => s !== null);

  const existenceChecks = await Promise.all(
    records.map(async (rec) => {
      const staticRec = SITE_MEDIA_ASSETS[rec.slotId];
      const diskImageOk = rec.dataUrl ? await checkPublicAssetExists(staticRec?.imageUrl) : true;
      const needsImage = Boolean(rec.dataUrl) && !diskImageOk;
      const needsLink = Boolean(rec.linkUrl) && !staticRec?.linkUrl;
      return needsImage || needsLink ? rec : null;
    }),
  );

  const pendingRecords = existenceChecks.filter((r): r is StoredAssetRecord => r !== null);
  const needsNotesOrLink =
    (Boolean(exp.notesText.trim()) && !SITE_EXPERIMENTS_CONFIG.hasCustomNotes) ||
    (Boolean(exp.reelExternalUrl.trim()) && !SITE_EXPERIMENTS_CONFIG.reelExternalUrl);
  const reelOnDisk = exp.reelBlob
    ? await checkPublicAssetExists(SITE_EXPERIMENTS_CONFIG.reelVideoUrl)
    : true;
  const needsReelVideo = Boolean(exp.reelBlob && exp.reelBlob.size > 0) && !reelOnDisk;

  return { pendingRecords, missingManifestSlots, needsNotesOrLink, needsReelVideo };
}

export async function saveAllBrowserAssetsToProject(
  onProgress?: (msg: string) => void,
  options?: { includeReelVideo?: boolean },
): Promise<{ savedImages: number; savedLinks: number; savedReel: boolean }> {
  const allMap = await getAllStoredAssets();
  const records: StoredAssetRecord[] = Object.values(allMap).filter((r) =>
    Boolean(r.dataUrl || r.linkUrl),
  );
  const experiments = await readExperimentsFromBrowser();

  let savedImages = 0;
  let savedLinks = 0;
  let savedReel = false;

  for (let i = 0; i < records.length; i += 1) {
    const rec = records[i];
    const staticRec = SITE_MEDIA_ASSETS[rec.slotId];
    const imageExists = rec.dataUrl ? await checkPublicAssetExists(staticRec?.imageUrl) : true;
    const needsImage = Boolean(rec.dataUrl) && !imageExists;
    const needsLink = Boolean(rec.linkUrl) && !staticRec?.linkUrl;
    const needsLabel = Boolean(rec.linkLabel) && !staticRec?.linkLabel;

    if (!needsImage && !needsLink && !needsLabel) {
      continue;
    }

    onProgress?.(`Saving ${rec.slotId} (${i + 1}/${records.length})...`);
    const payloadRec: Partial<StoredAssetRecord> & { slotId: string } = {
      slotId: rec.slotId,
      ...(needsImage && rec.dataUrl ? { dataUrl: rec.dataUrl } : {}),
      ...(needsLink && rec.linkUrl ? { linkUrl: rec.linkUrl } : {}),
      ...(needsLabel && rec.linkLabel ? { linkLabel: rec.linkLabel } : {}),
    };

    const result = await postRecoverItem({ asset: payloadRec });
    if (result.savedImage) savedImages += 1;
    if (result.savedLink) savedLinks += 1;
  }

  const needsNotes =
    Boolean(experiments.notesText.trim()) && !SITE_EXPERIMENTS_CONFIG.hasCustomNotes;
  const needsExtReel =
    Boolean(experiments.reelExternalUrl.trim()) && !SITE_EXPERIMENTS_CONFIG.reelExternalUrl;

  if (needsNotes || needsExtReel) {
    onProgress?.('Saving Experiments notes and reel link...');
    await postRecoverItem({
      experiments: {
        ...(needsNotes ? { notesText: experiments.notesText } : {}),
        ...(needsExtReel ? { reelExternalUrl: experiments.reelExternalUrl } : {}),
      },
    });
  }

  const shouldUploadReel = options?.includeReelVideo !== false;
  if (shouldUploadReel && experiments.reelBlob && experiments.reelBlob.size > 0) {
    const reelExists = await checkPublicAssetExists(SITE_EXPERIMENTS_CONFIG.reelVideoUrl);
    if (!reelExists) {
      const CHUNK_BYTES = 3 * 1024 * 1024;
      const totalChunks = Math.max(1, Math.ceil(experiments.reelBlob.size / CHUNK_BYTES));
      for (let idx = 0; idx < totalChunks; idx += 1) {
        onProgress?.(`Saving Experiments reel video (${idx + 1}/${totalChunks})...`);
        const slice = experiments.reelBlob.slice(idx * CHUNK_BYTES, (idx + 1) * CHUNK_BYTES);
        const buf = await slice.arrayBuffer();
        const chunkBase64 = arrayBufferToBase64(buf);
        await postRecoverItem({
          experiments: {
            reelChunkBase64: chunkBase64,
            reelExt: experiments.reelExt,
            reelChunkIndex: idx,
            reelTotalChunks: totalChunks,
          },
        });
      }
      savedReel = true;
    }
  }

  return { savedImages, savedLinks, savedReel };
}
