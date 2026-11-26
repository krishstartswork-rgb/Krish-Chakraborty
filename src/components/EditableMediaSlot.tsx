import { useState } from 'react';
import { ArrowUpRight, Image as ImageIcon, Link2, Maximize2, X } from 'lucide-react';
import { SITE_MEDIA_ASSETS } from '../data/siteAssets';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const staticEntry = SITE_MEDIA_ASSETS[slot.slotId];
  const imageUrl = slot.imageUrl || staticEntry?.imageUrl || '';
  const rawLinkUrl = slot.linkUrl || staticEntry?.linkUrl || '';
  const linkLabel = slot.linkLabel || staticEntry?.linkLabel;
  const savedLink = rawLinkUrl ? normalizeSafeUrl(rawLinkUrl) : null;
  const hasImage = Boolean(imageUrl);

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
          data-cursor={hasImage ? 'VIEW' : undefined}
          className={`group relative overflow-hidden border transition-colors duration-200 ${ASPECT_CLASS[slot.aspect]} ${surfaceStyles}`}
        >
          {hasImage ? (
            <>
              <img
                src={imageUrl}
                alt={slot.title}
                loading="lazy"
                onClick={() => setLightboxOpen(true)}
                className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[#111113]/90 px-3 py-2 text-[#F3EFE6] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{slot.title}</p>
                  {slot.mediumTag && (
                    <p className="font-mono-tech truncate text-[10px] text-[#D9381E] uppercase">
                      {slot.mediumTag}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-white/20 text-white hover:border-[#D9381E] hover:text-[#D9381E]"
                  title="Inspect full size"
                  aria-label={`Inspect ${slot.title} full size`}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col justify-between p-4 text-left sm:p-5">
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
                  {slot.aspect}
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
                  <p className={`mt-2 max-w-md text-xs sm:text-sm ${mutedText}`}>
                    {slot.section}
                  </p>
                )}
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3 border-t border-current/15 pt-2.5">
                <span className="font-mono-tech inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase opacity-65">
                  <ImageIcon className="h-3.5 w-3.5 text-[#D9381E]" />
                  <span>Showcase Visual</span>
                </span>
                <span className="font-mono-tech text-[10px] opacity-55">
                  {slot.slotId.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Link Place directly under card when a permanent link is configured */}
        {savedLink && (
          <div className={`border-x border-b px-2.5 py-1.5 ${linkBarStyles}`}>
            <a
              href={savedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-tech inline-flex w-full items-center gap-1.5 text-[11px] font-semibold hover:text-[#D9381E]"
              title={savedLink}
            >
              <Link2 className="h-3 w-3 shrink-0 text-[#D9381E]" />
              <span className="min-w-0 flex-1 truncate underline underline-offset-2">
                {formatLinkText(savedLink, linkLabel)}
              </span>
              <ArrowUpRight className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      {lightboxOpen && hasImage && (
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
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-white/20 text-[#F3EFE6] hover:border-[#D9381E] hover:text-[#D9381E]"
                  aria-label="Close lightbox"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto p-4">
              <img
                src={imageUrl}
                alt={slot.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
