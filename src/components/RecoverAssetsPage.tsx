import { ChangeEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Download,
  FileJson,
  Film,
  HardDriveDownload,
  Upload,
} from 'lucide-react';
import { ALL_ASSET_SLOTS } from '../data/portfolioData';
import { SITE_MEDIA_ASSETS } from '../data/siteAssets';
import { RoutePath } from '../types/portfolio';
import { StoredAssetRecord, getAllStoredAssets } from '../utils/assetVault';
import {
  checkPublicAssetExists,
  postRecoverItem,
  saveAllBrowserAssetsToProject,
} from '../utils/recoverClient';

function inferExtFromDataUrl(dataUrl: string, fileName?: string): string {
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);/);
  if (match?.[1]) {
    const sub = match[1].toLowerCase();
    if (sub === 'jpeg') return 'jpg';
    if (sub === 'svg+xml') return 'svg';
    return sub;
  }
  const fromName = fileName?.split('.').pop()?.toLowerCase();
  return fromName || 'png';
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.readAsDataURL(file);
  });
}

export function RecoverAssetsPage({ onNavigate }: { onNavigate: (route: RoutePath) => void }) {
  const [records, setRecords] = useState<StoredAssetRecord[]>([]);
  const [diskStatus, setDiskStatus] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<string>('');
  const [reelUrl, setReelUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingToDisk, setSavingToDisk] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const refreshDiskStatus = async () => {
    const entries = await Promise.all(
      ALL_ASSET_SLOTS.map(async (slot) => {
        const url = SITE_MEDIA_ASSETS[slot.slotId]?.imageUrl;
        const ok = await checkPublicAssetExists(url);
        return [slot.slotId, ok] as const;
      }),
    );
    setDiskStatus(Object.fromEntries(entries));
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAllStoredAssets(), refreshDiskStatus()]).then(([map]) => {
      if (!active) return;
      setRecords(Object.values(map).filter((r) => Boolean(r.dataUrl || r.linkUrl)));
      try {
        setNotes(window.localStorage.getItem('krish_experiments_textbox_v1') ?? '');
        setReelUrl(window.localStorage.getItem('krish_experiments_reel_url_v1') ?? '');
      } catch {
        setNotes('');
        setReelUrl('');
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveAllToProject = async (includeReelVideo: boolean) => {
    setSavingToDisk(true);
    setSaveMessage('Starting upload to project folder...');
    try {
      const result = await saveAllBrowserAssetsToProject(
        (progressMsg) => setSaveMessage(progressMsg),
        { includeReelVideo },
      );
      setSaveMessage(
        `Saved ${result.savedImages} images, ${result.savedLinks} links${
          result.savedReel ? ', and reel video' : ''
        } into public/assets/portfolio/. Reloading...`,
      );
      window.setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSavingToDisk(false);
    }
  };

  const handleDirectSlotUpload = async (slotId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingSlot(slotId);
    setSaveMessage(`Uploading ${slotId} directly to public/assets/portfolio/...`);
    try {
      const dataUrl = await fileToDataUrl(file);
      await postRecoverItem({ asset: { slotId, dataUrl } });
      await refreshDiskStatus();
      setSaveMessage(`Saved ${slotId} permanently into public/assets/portfolio/!`);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleExportJson = () => {
    const assetsMap: Record<string, StoredAssetRecord> = {};
    for (const r of records) {
      assetsMap[r.slotId] = r;
    }
    const payload = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        notes,
        reelUrl,
        assets: assetsMap,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krish-recovered-assets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingle = (rec: StoredAssetRecord) => {
    if (!rec.dataUrl) return;
    const ext = inferExtFromDataUrl(rec.dataUrl, rec.fileName);
    const a = document.createElement('a');
    a.href = rec.dataUrl;
    a.download = `${rec.slotId}.${ext}`;
    a.click();
  };

  return (
    <div className="bg-[#111113] text-[#F3EFE6]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="font-mono-tech inline-flex cursor-pointer items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-[#D9381E]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO PORTFOLIO</span>
        </button>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <p className="font-mono-tech text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              PROJECT DISK ASSET MANAGER (DEV ONLY)
            </p>
            <h1 className="font-display mt-2 text-3xl font-extrabold uppercase sm:text-4xl">
              RECOVER OR UPLOAD ASSETS TO PROJECT
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#F3EFE6]/75">
              Restore images from browser cache or drop files directly into{' '}
              <code>public/assets/portfolio/</code> so they deploy permanently on Vercel.
            </p>
          </div>
          {records.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={savingToDisk}
                onClick={() => void handleSaveAllToProject(false)}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-2 bg-[#D9381E] px-4 py-2.5 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#F3EFE6] hover:text-[#111113] disabled:opacity-50"
              >
                {saveMessage?.startsWith('Saved') ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <HardDriveDownload className="h-4 w-4" />
                )}
                <span>
                  {savingToDisk ? 'SAVING...' : `RESTORE IMAGES & LINKS (${records.length})`}
                </span>
              </button>
              <button
                type="button"
                disabled={savingToDisk}
                onClick={() => void handleSaveAllToProject(true)}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-2 border border-[#D9381E] px-4 py-2.5 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#D9381E] disabled:opacity-50"
              >
                <Film className="h-4 w-4" />
                <span>INCLUDE REEL VIDEO</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-2 border border-white/25 px-4 py-2.5 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:border-[#D9381E]"
              >
                <FileJson className="h-4 w-4" />
                <span>DOWNLOAD JSON</span>
              </button>
            </div>
          )}
        </div>

        {saveMessage && (
          <div className="mt-4 border border-[#D9381E] bg-[#19191D] p-4 text-sm text-[#F3EFE6]">
            {saveMessage}
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="mt-8">
            <h2 className="font-mono-tech mb-4 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              FOUND IN BROWSER CACHE ({records.length})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {records.map((rec) => (
                <div key={rec.slotId} className="border border-white/15 bg-[#19191D] p-4">
                  {rec.dataUrl && (
                    <img
                      src={rec.dataUrl}
                      alt={rec.slotId}
                      className="aspect-video w-full border border-white/10 object-cover"
                    />
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono-tech truncate text-xs font-bold text-[#D9381E]">
                        {rec.slotId}
                      </p>
                      {rec.linkUrl && (
                        <p className="font-mono-tech truncate text-[11px] text-white/65">
                          {rec.linkUrl}
                        </p>
                      )}
                    </div>
                    {rec.dataUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(rec)}
                        className="font-mono-tech inline-flex shrink-0 cursor-pointer items-center gap-1 border border-white/25 px-2.5 py-1.5 text-[11px] font-bold uppercase hover:border-[#D9381E] hover:text-[#D9381E]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="font-mono-tech mb-4 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
            ALL PORTFOLIO SLOTS ({Object.values(diskStatus).filter(Boolean).length} /{' '}
            {ALL_ASSET_SLOTS.length} PRESENT ON DISK)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_ASSET_SLOTS.map((slot) => {
              const ok = diskStatus[slot.slotId];
              const staticUrl = SITE_MEDIA_ASSETS[slot.slotId]?.imageUrl;
              return (
                <div key={slot.slotId} className="border border-white/15 bg-[#19191D] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono-tech text-xs font-bold text-[#F3EFE6]">
                      {slot.slotId}
                    </p>
                    <span
                      className={`font-mono-tech text-[10px] font-bold uppercase ${
                        ok ? 'text-emerald-400' : 'text-[#D9381E]'
                      }`}
                    >
                      {ok ? 'ON DISK' : staticUrl ? 'MISSING ON DISK' : 'EMPTY'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-white/65">{slot.title}</p>
                  {ok && staticUrl && (
                    <img
                      src={staticUrl}
                      alt={slot.title}
                      className="mt-3 aspect-video w-full border border-white/10 object-cover"
                    />
                  )}
                  <label className="font-mono-tech mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-white/25 px-3 py-2 text-[11px] font-bold uppercase hover:border-[#D9381E] hover:text-[#D9381E]">
                    <Upload className="h-3.5 w-3.5 text-[#D9381E]" />
                    <span>
                      {uploadingSlot === slot.slotId
                        ? 'UPLOADING...'
                        : ok
                          ? 'REPLACE FILE ON DISK'
                          : 'UPLOAD TO PROJECT DISK'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleDirectSlotUpload(slot.slotId, e)}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
