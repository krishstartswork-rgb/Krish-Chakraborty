import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  Eye,
  Link2,
  Pencil,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ALL_ASSET_SLOTS } from '../data/portfolioData';
import { useAssetVault } from '../context/AssetVaultContext';

export function AssetManagerDrawer() {
  const {
    assets,
    editMode,
    setEditMode,
    drawerOpen,
    setDrawerOpen,
    uploadToSlot,
    removeFromSlot,
    clearVault,
    exportVaultJson,
    importVaultJson,
  } = useAssetVault();

  const importInputRef = useRef<HTMLInputElement>(null);
  const slotInputRef = useRef<HTMLInputElement>(null);
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!drawerOpen) return null;

  const uploadedCount = Object.values(assets).filter((a) => Boolean(a.dataUrl)).length;
  const linkedCount = Object.values(assets).filter((a) => Boolean(a.linkUrl)).length;
  const hasAnyData = uploadedCount > 0 || linkedCount > 0;

  const grouped = ALL_ASSET_SLOTS.reduce<Record<string, typeof ALL_ASSET_SLOTS>>((acc, slot) => {
    acc[slot.section] = acc[slot.section] || [];
    acc[slot.section].push(slot);
    return acc;
  }, {});

  const handleSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingSlotId) {
      await uploadToSlot(pendingSlotId, file);
      setStatusMessage(`Saved "${file.name}" locally.`);
    }
    setPendingSlotId(null);
    e.target.value = '';
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importVaultJson(file);
      setStatusMessage(`Imported ${count} asset(s).`);
    } catch {
      setStatusMessage('Invalid backup JSON file.');
    }
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/65"
      onClick={() => setDrawerOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Asset Vault"
    >
      <div
        className="flex h-full w-full max-w-xl flex-col border-l border-white/15 bg-[#111113] text-[#F3EFE6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-5">
          <div>
            <p className="font-mono-tech text-[11px] font-bold tracking-widest text-[#D9381E] uppercase">
              LOCAL BROWSER STORAGE · INDEXEDDB
            </p>
            <h2 className="font-display mt-1 text-3xl uppercase tracking-tight">
              PORTFOLIO ASSET VAULT
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-[#F3EFE6] hover:border-[#D9381E] hover:text-[#D9381E]"
            aria-label="Close asset drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 bg-[#19191D] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono-tech text-xs tabular-nums text-[#F3EFE6]/85">
                <span className="font-bold text-[#D9381E]">{uploadedCount}</span> of{' '}
                {ALL_ASSET_SLOTS.length} images ·{' '}
                <span className="font-bold text-[#D9381E]">{linkedCount}</span> links saved
              </p>
              <p className="mt-0.5 text-xs text-[#F3EFE6]/60">
                Drop in your TV stills, billboards, awards, or team photos, and attach links right under any card.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={`font-mono-tech inline-flex cursor-pointer items-center gap-2 border px-3 py-2 text-xs font-bold uppercase transition-colors ${
                editMode
                  ? 'border-[#D9381E] bg-[#D9381E] text-[#F3EFE6]'
                  : 'border-white/25 text-[#F3EFE6] hover:border-[#D9381E]'
              }`}
            >
              {editMode ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              <span>{editMode ? 'Edit Bars On' : 'Show Edit Bars'}</span>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportVaultJson}
              disabled={!hasAnyData}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-white/20 px-3 py-1.5 text-[11px] uppercase hover:border-[#D9381E] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Export Backup JSON
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-white/20 px-3 py-1.5 text-[11px] uppercase hover:border-[#D9381E]"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Backup
            </button>
            {hasAnyData && (
              <button
                type="button"
                onClick={() => {
                  void clearVault();
                  setStatusMessage('Cleared all local asset slots and links.');
                }}
                className="font-mono-tech ml-auto inline-flex cursor-pointer items-center gap-1.5 border border-[#D9381E]/50 px-3 py-1.5 text-[11px] text-[#D9381E] uppercase hover:bg-[#D9381E] hover:text-[#F3EFE6]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset All
              </button>
            )}
          </div>

          {statusMessage && (
            <p className="font-mono-tech mt-3 text-[11px] text-[#F3EFE6]">{statusMessage}</p>
          )}
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => void handleImportJson(e)}
        />
        <input
          ref={slotInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleSlotUpload(e)}
        />

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {Object.entries(grouped).map(([sectionName, slots]) => (
            <div key={sectionName}>
              <h3 className="font-mono-tech mb-2.5 border-b border-white/10 pb-1.5 text-[11px] font-bold tracking-widest text-[#D9381E] uppercase">
                {sectionName}
              </h3>
              <div className="divide-y divide-white/10">
                {slots.map((slot) => {
                  const rec = assets[slot.slotId];
                  const hasImg = Boolean(rec?.dataUrl);
                  const hasLink = Boolean(rec?.linkUrl);
                  return (
                    <div
                      key={slot.slotId}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-11 w-14 shrink-0 overflow-hidden border border-white/15 bg-[#19191D]">
                          {hasImg && rec?.dataUrl ? (
                            <img
                              src={rec.dataUrl}
                              alt={slot.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="font-mono-tech flex h-full w-full items-center justify-center text-[9px] text-white/35">
                              {slot.aspect}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#F3EFE6]">
                            {slot.title}
                          </p>
                          <p className="font-mono-tech truncate text-[10px] text-[#F3EFE6]/55">
                            {hasImg ? (
                              <span className="inline-flex items-center gap-1 text-[#D9381E]">
                                <Check className="h-3 w-3" /> {rec?.fileName || 'Saved image'}
                              </span>
                            ) : (
                              slot.mediumTag || 'Empty placeholder slot'
                            )}
                            {hasLink && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[#F3EFE6]/80">
                                <Link2 className="h-2.5 w-2.5 text-[#D9381E]" /> Link attached
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPendingSlotId(slot.slotId);
                            slotInputRef.current?.click();
                          }}
                          className="font-mono-tech cursor-pointer border border-white/20 px-2.5 py-1.5 text-[10px] uppercase hover:border-[#D9381E] hover:text-[#D9381E]"
                        >
                          {hasImg ? 'Swap' : 'Upload'}
                        </button>
                        {hasImg && (
                          <button
                            type="button"
                            onClick={() => void removeFromSlot(slot.slotId)}
                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center border border-white/15 text-white/60 hover:border-[#D9381E] hover:text-[#D9381E]"
                            aria-label={`Remove image from ${slot.title}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
