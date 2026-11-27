import { useEffect, useState } from 'react';
import { ArrowUpRight, Film, Link2 } from 'lucide-react';
import { SITE_EXPERIMENTS_CONFIG } from '../data/siteAssets';

function normalizeSafeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/')) return trimmed;
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
  if (safe.startsWith('/')) {
    return { kind: 'video', sourceUrl: safe };
  }
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
  const { notesTitle, notesText, reelVideoUrl, reelExternalUrl } = SITE_EXPERIMENTS_CONFIG;
  const resolvedVideo = reelVideoUrl ? resolveReelUrl(reelVideoUrl) : null;
  const externalLink = reelExternalUrl ? normalizeSafeUrl(reelExternalUrl) : null;
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [reelVideoUrl]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Text Box */}
      <div className="border border-white/15 bg-[#19191D] p-5 sm:p-6 lg:col-span-7">
        <p className="font-mono-tech mb-3 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
          {notesTitle}
        </p>

        <div className="min-h-[360px] w-full border border-white/15 bg-[#111113] p-5 text-sm leading-relaxed whitespace-pre-line text-[#F3EFE6]/90 sm:text-base">
          {notesText}
        </div>
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

          <div className="relative aspect-[9/16] w-full overflow-hidden border border-white/15 bg-[#111113]">
            {resolvedVideo?.kind === 'youtube' || resolvedVideo?.kind === 'instagram' ? (
              <iframe
                src={resolvedVideo.embedUrl}
                title="Reel Video Embed"
                className="h-full w-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : resolvedVideo?.kind === 'video' && !videoFailed ? (
              <video
                src={resolvedVideo.sourceUrl}
                controls
                playsInline
                onError={() => setVideoFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <Film className="mb-3 h-7 w-7 text-[#D9381E]" />
                <span className="font-display text-lg font-bold uppercase tracking-tight text-[#F3EFE6]">
                  REEL SHOWCASE
                </span>
                <span className="font-mono-tech mt-2 text-[11px] text-white/60 uppercase">
                  Permanent 9:16 video asset slot
                </span>
              </div>
            )}
          </div>

          {externalLink && (
            <div className="mt-3 border border-white/15 bg-[#111113] px-3 py-2">
              <a
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-tech inline-flex w-full items-center gap-1.5 text-[11px] font-bold text-[#F3EFE6] hover:text-[#D9381E]"
              >
                <Link2 className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
                <span className="min-w-0 flex-1 truncate">
                  {externalLink.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#D9381E]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
