import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Film,
  Link2,
  Pencil,
  Replace,
  Trash2,
  X,
} from 'lucide-react';

const TEXTBOX_STORAGE_KEY = 'krish_experiments_textbox_v1';
const REEL_URL_STORAGE_KEY = 'krish_experiments_reel_url_v1';
const REEL_DB_NAME = 'krish_experiments_reel_db';
const REEL_STORE_NAME = 'reels';
const REEL_KEY = 'primary-reel';

interface StoredReelBlob {
  id: string;
  blob: Blob;
  fileName: string;
  updatedAt: number;
}

function openReelDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(REEL_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(REEL_STORE_NAME)) {
        db.createObjectStore(REEL_STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadSavedReel(): Promise<StoredReelBlob | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;
  try {
    const db = await openReelDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(REEL_STORE_NAME, 'readonly');
      const store = tx.objectStore(REEL_STORE_NAME);
      const req = store.get(REEL_KEY);
      req.onsuccess = () => resolve((req.result as StoredReelBlob | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveReelBlob(blob: Blob, fileName: string): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  const db = await openReelDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(REEL_STORE_NAME, 'readwrite');
    const store = tx.objectStore(REEL_STORE_NAME);
    store.put({
      id: REEL_KEY,
      blob,
      fileName,
      updatedAt: Date.now(),
    } satisfies StoredReelBlob);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteSavedReel(): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  const db = await openReelDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(REEL_STORE_NAME, 'readwrite');
    const store = tx.objectStore(REEL_STORE_NAME);
    store.delete(REEL_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

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

type ReelUrlTarget =
  | { kind: 'youtube'; embedUrl: string; sourceUrl: string }
  | { kind: 'instagram'; embedUrl: string; sourceUrl: string }
  | { kind: 'video'; sourceUrl: string }
  | { kind: 'link'; sourceUrl: string };

function resolveReelUrl(raw: string): ReelUrlTarget | null {
  const safe = normalizeSafeUrl(raw);
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      let videoId = '';
      if (host === 'youtu.be') {
        videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/').filter(Boolean)[1] ?? '';
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/').filter(Boolean)[1] ?? '';
      } else if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v') ?? '';
      }
      if (/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
        return {
          kind: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          sourceUrl: safe,
        };
      }
    }

    if (host === 'instagram.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'reel' || parts[0] === 'reels' || parts[0] === 'p') && parts[1]) {
        const shortcode = parts[1];
        if (/^[a-zA-Z0-9_-]{4,40}$/.test(shortcode)) {
          return {
            kind: 'instagram',
            embedUrl: `https://www.instagram.com/reel/${shortcode}/embed`,
            sourceUrl: safe,
          };
        }
      }
    }

    if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(parsed.pathname)) {
      return { kind: 'video', sourceUrl: safe };
    }

    return { kind: 'link', sourceUrl: safe };
  } catch {
    return null;
  }
}

export function ExperimentsLabBody() {
  const [noteText, setNoteText] = useState<string>(() => {
    try {
      return window.localStorage.getItem(TEXTBOX_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const [reelUrl, setReelUrl] = useState<string>(() => {
    try {
      return window.localStorage.getItem(REEL_URL_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(TEXTBOX_STORAGE_KEY, noteText);
    } catch {
      // Ignore storage quota errors
    }
  }, [noteText]);

  useEffect(() => {
    try {
      if (reelUrl) {
        window.localStorage.setItem(REEL_URL_STORAGE_KEY, reelUrl);
      } else {
        window.localStorage.removeItem(REEL_URL_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [reelUrl]);

  useEffect(() => {
    let active = true;
    let currentObjUrl: string | null = null;
    loadSavedReel().then((record) => {
      if (!active || !record?.blob) return;
      currentObjUrl = URL.createObjectURL(record.blob);
      setVideoUrl(currentObjUrl);
      setVideoFileName(record.fileName);
    });
    return () => {
      active = false;
      if (currentObjUrl) URL.revokeObjectURL(currentObjUrl);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleVideoFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setVideoError('Please select an MP4, WebM, or MOV video file.');
      return;
    }
    setVideoError(null);
    try {
      await saveReelBlob(file, file.name);
      const nextUrl = URL.createObjectURL(file);
      setVideoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
      setVideoFileName(file.name);
    } catch {
      setVideoError('Could not save video locally.');
    }
  };

  const handleRemoveVideo = async () => {
    await deleteSavedReel();
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setVideoFileName('');
    setVideoError(null);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      setReelUrl('');
      setEditingUrl(false);
      setUrlError(null);
      return;
    }
    const safe = normalizeSafeUrl(trimmed);
    if (!safe) {
      setUrlError('Enter a valid http(s) reel URL.');
      return;
    }
    setReelUrl(safe);
    setEditingUrl(false);
    setUrlError(null);
  };

  const resolvedUrl = reelUrl ? resolveReelUrl(reelUrl) : null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Text Box */}
      <div className="border border-white/15 bg-[#19191D] p-5 sm:p-6 lg:col-span-7">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label
            htmlFor="experiments-text-box"
            className="font-mono-tech text-xs font-bold tracking-widest text-[#D9381E] uppercase"
          >
            NOTES &amp; WRITING
          </label>
          {noteText.length > 0 && (
            <button
              type="button"
              onClick={() => setNoteText('')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1 border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase text-white/75 hover:border-[#D9381E] hover:text-[#D9381E]"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          id="experiments-text-box"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write or paste your thoughts, story excerpt, or notes here..."
          className="min-h-[420px] w-full resize-y border border-white/15 bg-[#111113] p-4 text-sm leading-relaxed text-[#F3EFE6] placeholder:text-white/35 focus:border-[#D9381E] focus:outline-none sm:text-base"
        />
      </div>

      {/* Reel Video Holder (9:16) */}
      <div className="lg:col-span-5">
        <div className="mx-auto w-full max-w-[340px] border border-white/15 bg-[#19191D] p-4 sm:p-5 lg:ml-auto lg:mr-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-mono-tech text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              REEL VIDEO
            </span>
            <span className="font-mono-tech text-[10px] text-white/55 uppercase">9:16</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleVideoFiles(e.target.files)}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleVideoFiles(e.dataTransfer.files);
            }}
            className={`relative aspect-[9/16] w-full overflow-hidden border transition-colors ${
              dragging
                ? 'border-[#D9381E] bg-[#D9381E]/10'
                : 'border-white/15 bg-[#111113]'
            }`}
          >
            {videoUrl ? (
              <>
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-mono-tech inline-flex cursor-pointer items-center gap-1 bg-[#111113]/90 px-2.5 py-1.5 text-[10px] font-bold text-[#F3EFE6] uppercase hover:bg-[#D9381E]"
                    title={videoFileName || 'Replace video'}
                  >
                    <Replace className="h-3 w-3" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemoveVideo()}
                    aria-label="Remove uploaded reel video"
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center bg-[#111113]/90 text-[#F3EFE6] hover:bg-[#D9381E]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : resolvedUrl?.kind === 'youtube' || resolvedUrl?.kind === 'instagram' ? (
              <iframe
                src={resolvedUrl.embedUrl}
                title="Reel Video Embed"
                className="h-full w-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : resolvedUrl?.kind === 'video' ? (
              <video
                src={resolvedUrl.sourceUrl}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center transition-colors hover:bg-white/[0.03]"
              >
                <Film className="mb-3 h-7 w-7 text-[#D9381E]" />
                <span className="font-display text-lg font-bold uppercase tracking-tight text-[#F3EFE6]">
                  UPLOAD REEL VIDEO
                </span>
                <span className="font-mono-tech mt-2 text-[11px] text-white/60 uppercase">
                  Click or drop MP4 / MOV, or paste a reel URL below
                </span>
              </button>
            )}
          </div>

          {videoError && (
            <p className="font-mono-tech mt-2 text-[11px] font-semibold text-[#D9381E]">
              {videoError}
            </p>
          )}

          {/* Reel Link Bar */}
          <div className="mt-3 border border-white/15 bg-[#111113] px-3 py-2">
            {editingUrl ? (
              <form onSubmit={handleSaveUrl} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
                  <input
                    type="text"
                    value={urlDraft}
                    onChange={(e) => {
                      setUrlDraft(e.target.value);
                      if (urlError) setUrlError(null);
                    }}
                    placeholder="https://instagram.com/reel/... or YouTube Shorts URL"
                    autoFocus
                    className="font-mono-tech min-w-0 flex-1 border border-white/20 bg-[#19191D] px-2 py-1 text-[11px] text-[#F3EFE6] focus:border-[#D9381E] focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Save reel URL"
                    className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center bg-[#D9381E] text-[#F3EFE6] hover:opacity-90"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUrl(false);
                      setUrlError(null);
                    }}
                    aria-label="Cancel reel URL edit"
                    className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border border-white/20 text-[#F3EFE6] hover:border-[#D9381E]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {urlError && (
                  <p className="font-mono-tech text-[10px] font-semibold text-[#D9381E]">
                    {urlError}
                  </p>
                )}
              </form>
            ) : resolvedUrl ? (
              <div className="flex items-center justify-between gap-2">
                <a
                  href={resolvedUrl.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-tech inline-flex min-w-0 flex-1 items-center gap-1.5 text-[11px] font-bold text-[#F3EFE6] hover:text-[#D9381E]"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
                  <span className="truncate">
                    {resolvedUrl.sourceUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
                </a>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUrlDraft(reelUrl);
                      setUrlError(null);
                      setEditingUrl(true);
                    }}
                    aria-label="Edit reel URL"
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center border border-white/15 opacity-70 hover:border-[#D9381E] hover:text-[#D9381E] hover:opacity-100"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReelUrl('')}
                    aria-label="Remove reel URL"
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center border border-white/15 opacity-70 hover:border-[#D9381E] hover:text-[#D9381E] hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUrlDraft('');
                  setUrlError(null);
                  setEditingUrl(true);
                }}
                className="font-mono-tech flex w-full cursor-pointer items-center justify-between gap-2 text-left text-[11px] text-white/65 hover:text-[#D9381E]"
              >
                <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
                  <span className="truncate">Add reel URL (Instagram, YouTube, MP4)</span>
                </span>
                <span className="shrink-0 font-bold uppercase">+ URL</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
