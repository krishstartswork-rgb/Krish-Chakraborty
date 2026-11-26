import React, { useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  Link2,
  Maximize2,
  Pencil,
  Replace,
  Trash2,
  X,
} from 'lucide-react';
import { useAssetVault } from '../context/AssetVaultContext';
import { AssetSlotSpec } from '../types/portfolio';

interface EditableMediaSlotProps {
  slot: AssetSlotSpec;
  tone?: 'dark' | 'light';
  className?: string;
  compact?: boolean;
}

const ASPECT_CLASS: Record<AssetSlotSpec['aspect'], string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
};

function normalizeSafeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function formatLinkText(url: string, label?: string): string {
  if (label && label.trim()) return label.trim();
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    return `${host}${path}`;
  } catch {
    return url;
  }
}

export function EditableMediaSlot({
  slot,
  tone = 'dark',
  className = '',
  compact = false,
}: EditableMediaSlotProps) {
  const {
    assets,
    editMode,
    uploadToSlot,
    removeFromSlot,
    updateSlotLink,
    removeSlotLink,
  } = useAssetVault();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingLink, setEditingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const record = assets[slot.slotId];
  const hasImage = Boolean(record?.dataUrl);
  const savedLink = record?.linkUrl ? normalizeSafeUrl(record.linkUrl) : null;

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a JPG, PNG, WebP, or GIF image.');
      return;
    }
    setError(null);
    try {
      await uploadToSlot(slot.slotId, file);
    } catch {
      setError('Could not save asset locally.');
    }
  };

  const triggerPicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    inputRef.current?.click();
  };

  const openLinkEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkDraft(record?.linkUrl ?? '');
    setLinkError(null);
    setEditingLink(true);
  };

  const handleSaveLink = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = linkDraft.trim();
    if (!trimmed) {
      await removeSlotLink(slot.slotId);
      setEditingLink(false);
      setLinkError(null);
      return;
    }
    const safeUrl = normalizeSafeUrl(trimmed);
    if (!safeUrl) {
      setLinkError('Enter a valid http(s) URL.');
      return;
    }
    await updateSlotLink(slot.slotId, safeUrl);
    setEditingLink(false);
    setLinkError(null);
  };

  const surfaceStyles =
    tone === 'light'
      ? 'bg-[#E7E1D5] border-[#111113]/20 text-[#111113]'
      : 'bg-[#19191D] border-[#F3EFE6]/15 text-[#F3EFE6]';

  const linkBarStyles =
    tone === 'light'
      ? 'border-[#111113]/20 bg-[#F3EFE6]/85 text-[#111113]'
      : 'border-[#F3EFE6]/15 bg-[#111113]/85 text-[#F3EFE6]';

  const mutedText = tone === 'light' ? 'text-[#111113]/65' : 'text-[#F3EFE6]/60';

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        <div
          data-cursor={hasImage ? 'VIEW' : 'UPLOAD'}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`group relative overflow-hidden border transition-colors duration-200 ${ASPECT_CLASS[slot.aspect]} ${surfaceStyles} ${
            dragging ? 'border-[#D9381E] ring-2 ring-[#D9381E]' : ''
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label={`Upload asset for ${slot.title}`}
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />

          {hasImage && record?.dataUrl ? (
            <>
              <img
                src={record.dataUrl}
                alt={slot.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onClick={() => setLightboxOpen(true)}
                className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />

              <div
                className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[#111113]/90 px-3 py-2 text-[#F3EFE6] transition-opacity duration-200 ${
                  editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{slot.title}</p>
                  <p className="font-mono-tech truncate text-[10px] text-[#D9381E]">
                    {record.fileName || 'Uploaded image'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="inline-flex h-8 w-8 items-center justify-center border border-white/20 text-white hover:border-[#D9381E] hover:text-[#D9381E]"
                    title="Inspect full size"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={triggerPicker}
                    className="inline-flex h-8 items-center gap-1 border border-white/20 px-2 text-[11px] font-medium text-white hover:border-[#D9381E] hover:text-[#D9381E]"
                    title="Replace image"
                  >
                    <Replace className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Swap</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void removeFromSlot(slot.slotId);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center border border-white/20 text-white hover:border-[#D9381E] hover:text-[#D9381E]"
                    title="Clear image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={triggerPicker}
              className="relative flex h-full w-full flex-col justify-between p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#D9381E] sm:p-5"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    tone === 'light'
                      ? 'linear-gradient(to right, rgba(17,17,19,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,19,0.14) 1px, transparent 1px)'
                      : 'linear-gradient(to right, rgba(243,239,230,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(243,239,230,0.1) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-[#D9381E] uppercase">
                  {slot.mediumTag || slot.section}
                </span>
                <span className={`font-mono-tech text-[11px] tabular-nums ${mutedText}`}>
                  {slot.aspect} · SLOT
                </span>
              </div>

              <div className="relative z-10 my-auto py-2">
                <p
                  className={`font-display uppercase leading-[0.95] tracking-tight ${
                    compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                  }`}
                >
                  {slot.title}
                </p>
                {!compact && (
                  <p className={`mt-2 max-w-md text-xs sm:text-sm ${mutedText}`}>{slot.subtitle}</p>
                )}
                {error && <p className="mt-2 text-xs font-semibold text-[#D9381E]">{error}</p>}
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3 border-t border-current/15 pt-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                  <ImagePlus className="h-3.5 w-3.5 text-[#D9381E]" />
                  Click or drop image
                </span>
                <span className="font-mono-tech text-[10px] opacity-55">LOCAL VAULT</span>
              </div>
            </button>
          )}
        </div>

        {/* Link Place directly under every image slot */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`border-x border-b px-2.5 py-1.5 ${linkBarStyles}`}
        >
          {editingLink ? (
            <form onSubmit={(e) => void handleSaveLink(e)} className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
                <input
                  type="text"
                  autoFocus
                  value={linkDraft}
                  onChange={(e) => {
                    setLinkDraft(e.target.value);
                    if (linkError) setLinkError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingLink(false);
                      setLinkError(null);
                    }
                  }}
                  placeholder="https://behance.net/... or video/post URL"
                  aria-label={`Link URL for ${slot.title}`}
                  className={`font-mono-tech min-w-0 flex-1 border px-2 py-1 text-[11px] focus:border-[#D9381E] focus:outline-none ${
                    tone === 'light'
                      ? 'border-[#111113]/25 bg-white text-[#111113]'
                      : 'border-white/20 bg-[#19191D] text-[#F3EFE6]'
                  }`}
                />
                <button
                  type="submit"
                  className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center bg-[#D9381E] text-[#F3EFE6] hover:opacity-90"
                  title="Save link"
                  aria-label="Save link"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(false);
                    setLinkError(null);
                  }}
                  className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border border-current/20 opacity-75 hover:opacity-100"
                  title="Cancel"
                  aria-label="Cancel link edit"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {linkError && (
                <p className="font-mono-tech text-[10px] font-semibold text-[#D9381E]">
                  {linkError}
                </p>
              )}
            </form>
          ) : savedLink ? (
            <div className="flex items-center justify-between gap-2">
              <a
                href={savedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-tech inline-flex min-w-0 flex-1 items-center gap-1.5 text-[11px] font-semibold hover:text-[#D9381E]"
                title={savedLink}
              >
                <Link2 className="h-3 w-3 shrink-0 text-[#D9381E]" />
                <span className="truncate underline underline-offset-2">
                  {formatLinkText(savedLink, record?.linkLabel)}
                </span>
                <ArrowUpRight className="h-3 w-3 shrink-0" />
              </a>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={openLinkEditor}
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center opacity-65 hover:text-[#D9381E] hover:opacity-100"
                  title="Edit link"
                  aria-label={`Edit link for ${slot.title}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => void removeSlotLink(slot.slotId)}
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center opacity-65 hover:text-[#D9381E] hover:opacity-100"
                  title="Remove link"
                  aria-label={`Remove link for ${slot.title}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLinkEditor}
              className="font-mono-tech flex w-full cursor-pointer items-center justify-between gap-2 py-0.5 text-left text-[11px] opacity-75 transition-opacity hover:text-[#D9381E] hover:opacity-100"
            >
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Link2 className="h-3 w-3 shrink-0 text-[#D9381E]" />
                <span className="truncate">Add link (reel, deck, live post)</span>
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase">+ URL</span>
            </button>
          )}
        </div>
      </div>

      {lightboxOpen && hasImage && record?.dataUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111113]/95 p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={slot.title}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col border border-white/15 bg-[#19191D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div>
                <p className="font-mono-tech text-[11px] tracking-wider text-[#D9381E] uppercase">
                  {slot.section} · {slot.mediumTag || slot.aspect}
                </p>
                <h3 className="text-sm font-semibold text-[#F3EFE6]">{slot.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {savedLink && (
                  <a
                    href={savedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono-tech inline-flex items-center gap-1.5 border border-[#D9381E] px-3 py-1.5 text-[11px] font-bold text-[#F3EFE6] uppercase hover:bg-[#D9381E]"
                  >
                    <span>Open Link</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/20 text-[#F3EFE6] hover:border-[#D9381E] hover:text-[#D9381E]"
                  aria-label="Close lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto p-4">
              <img
                src={record.dataUrl}
                alt={slot.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
