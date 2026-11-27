import { useEffect, useState } from 'react';
import { Check, Film, HardDriveDownload, UploadCloud, X } from 'lucide-react';
import { RoutePath } from '../types/portfolio';
import {
  checkRecoveryServerAvailable,
  findPendingDiskRestores,
  saveAllBrowserAssetsToProject,
} from '../utils/recoverClient';

export function RecoverAssetsBanner({ onNavigate }: { onNavigate: (route: RoutePath) => void }) {
  const [devServerUp, setDevServerUp] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [missingSlotsCount, setMissingSlotsCount] = useState(0);
  const [needsNotesOrLink, setNeedsNotesOrLink] = useState(false);
  const [needsReelVideo, setNeedsReelVideo] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    checkRecoveryServerAvailable().then(async (available) => {
      if (!active || !available) return;
      setDevServerUp(true);
      const res = await findPendingDiskRestores();
      if (!active) return;
      setPendingCount(res.pendingRecords.length);
      setMissingSlotsCount(res.missingManifestSlots.length);
      setNeedsNotesOrLink(res.needsNotesOrLink);
      setNeedsReelVideo(res.needsReelVideo);

      if (res.pendingRecords.length > 0 || res.needsNotesOrLink) {
        const lastAttempt = Number(
          window.sessionStorage.getItem('krish_last_auto_restore_ts') || '0',
        );
        const now = Date.now();
        if (now - lastAttempt > 15000) {
          window.sessionStorage.setItem('krish_last_auto_restore_ts', String(now));
          setSaving(true);
          setStatus('Auto-restoring your images and links from browser cache...');
          try {
            const result = await saveAllBrowserAssetsToProject(
              (msg) => {
                if (active) setStatus(msg);
              },
              { includeReelVideo: false },
            );
            if (active && (result.savedImages > 0 || result.savedLinks > 0)) {
              setStatus(
                `Restored ${result.savedImages} images and ${result.savedLinks} links to disk. Reloading...`,
              );
              window.setTimeout(() => window.location.reload(), 650);
            }
          } catch (err) {
            if (active) {
              setStatus(
                err instanceof Error
                  ? err.message
                  : 'Auto-restore could not connect. Use button below.',
              );
            }
          } finally {
            if (active) setSaving(false);
          }
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!devServerUp || dismissed) return null;
  const hasAnythingToShow =
    pendingCount > 0 || missingSlotsCount > 0 || needsNotesOrLink || needsReelVideo || Boolean(status);
  if (!hasAnythingToShow) return null;

  const handleRestore = async (includeReelVideo: boolean) => {
    setSaving(true);
    setStatus('Restoring saved images and links to project...');
    try {
      const result = await saveAllBrowserAssetsToProject(
        (progressMsg) => setStatus(progressMsg),
        { includeReelVideo },
      );
      setStatus(
        `Restored ${result.savedImages} images, ${result.savedLinks} links${
          result.savedReel ? ', and the reel video' : ''
        }. Reloading...`,
      );
      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : 'Could not reach preview server. Open /#/recover-assets to upload files.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b-2 border-[#111113] bg-[#D9381E] px-4 py-3 text-[#F3EFE6]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono-tech text-xs font-extrabold uppercase">
            {pendingCount > 0
              ? `RESTORING PORTFOLIO IMAGES (${pendingCount} IN BROWSER CACHE)`
              : `PORTFOLIO IMAGES MISSING FROM DISK (${missingSlotsCount} FILES)`}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#F3EFE6]">
            {status ||
              (pendingCount > 0
                ? 'Container restarted and cleared runtime files from public/assets/portfolio/. Click Restore to write them back.'
                : 'No images were found in this browser cache and public/assets/portfolio/ is empty. Upload files via the uploader or in chat.')}
          </p>
        </div>
        <div className="flex flex-wrap shrink-0 items-center gap-2">
          {pendingCount > 0 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleRestore(false)}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 bg-[#111113] px-3.5 py-2 text-xs font-bold text-[#F3EFE6] uppercase hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <span>Restoring...</span>
              ) : status?.startsWith('Restored') ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Restored!</span>
                </>
              ) : (
                <>
                  <HardDriveDownload className="h-3.5 w-3.5" />
                  <span>Restore Images &amp; Links</span>
                </>
              )}
            </button>
          )}
          {needsReelVideo && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleRestore(true)}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-[#F3EFE6] px-3 py-2 text-[11px] font-bold text-[#111113] uppercase hover:opacity-90 disabled:opacity-50"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Restore + Reel Video</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/recover-assets')}
            className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#F3EFE6] px-3 py-2 text-[11px] font-bold uppercase hover:bg-[#111113]"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{pendingCount > 0 ? 'Inspect / Upload' : 'Upload Images'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss recovery notice"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-[#F3EFE6]/60 hover:bg-[#111113]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
