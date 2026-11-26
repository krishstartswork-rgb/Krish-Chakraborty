import React, { useEffect, useState } from 'react';
import { DoorClosed, DoorOpen, Sparkles } from 'lucide-react';

const BOBBLEHEAD_SRC = '/assets/aistudio/Smiling_South_Asian_Bobblehead_Figurine_8efd44ba.png';

const DOOR_QUIPS = [
  "Hey! You knocked, so here's the face behind the decks.",
  'Open for brand strategy, social direction, and big launches.',
  'Yes, the floral shirt and thumbs-up are permanent.',
  'Come on in. Coffee is virtual, ideas are real.',
];

function playSubtleKnockSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const triggerTap = (delay: number, pitch: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + delay + 0.065);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.09);
    };

    triggerTap(0, 175);
    triggerTap(0.12, 190);
    window.setTimeout(() => {
      void ctx.close();
    }, 360);
  } catch {
    // Ignore audio errors if browser blocks AudioContext
  }
}

function useCutoutBobblehead(src: string): string {
  const [cutoutSrc, setCutoutSrc] = useState<string>(src);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      try {
        const maxWidth = 600;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const isNeutralLightBg = (idx: number) => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          // Matches achromatic grey/white checkerboard squares without touching warm skin/shirt/shoes
          return min >= 192 && max - min <= 7;
        };

        const total = w * h;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        const trySeed = (x: number, y: number) => {
          const p = y * w + x;
          if (visited[p]) return;
          if (isNeutralLightBg(p * 4)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        for (let x = 0; x < w; x++) {
          trySeed(x, 0);
          trySeed(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          trySeed(0, y);
          trySeed(w - 1, y);
        }

        while (head < tail) {
          const p = queue[head++];
          const px = p % w;
          const py = (p - px) / w;

          data[p * 4 + 3] = 0;

          if (px > 0) {
            const np = p - 1;
            if (!visited[np] && isNeutralLightBg(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (px + 1 < w) {
            const np = p + 1;
            if (!visited[np] && isNeutralLightBg(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (py > 0) {
            const np = p - w;
            if (!visited[np] && isNeutralLightBg(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
          if (py + 1 < h) {
            const np = p + w;
            if (!visited[np] && isNeutralLightBg(np * 4)) {
              visited[np] = 1;
              queue[tail++] = np;
            }
          }
        }

        // Feather 1px edge fringe touching cleared background pixels
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            if (visited[p]) continue;
            const touchesBg =
              visited[p - 1] || visited[p + 1] || visited[p - w] || visited[p + w];
            if (touchesBg) {
              const idx = p * 4;
              const max = Math.max(data[idx], data[idx + 1], data[idx + 2]);
              const min = Math.min(data[idx], data[idx + 1], data[idx + 2]);
              if (min >= 165 && max - min <= 14) {
                data[idx + 3] = 75;
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const result = canvas.toDataURL('image/png');
        if (!cancelled) setCutoutSrc(result);
      } catch {
        // Keep original image fallback
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return cutoutSrc;
}

export function KnockDoorBobblehead() {
  const [isOpen, setIsOpen] = useState(false);
  const [isKnocking, setIsKnocking] = useState(false);
  const [wobbleCount, setWobbleCount] = useState(0);
  const [quipIndex, setQuipIndex] = useState(0);
  const bobbleSrc = useCutoutBobblehead(BOBBLEHEAD_SRC);

  const handleKnock = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSubtleKnockSound();

    if (!isOpen) {
      setIsKnocking(true);
      window.setTimeout(() => {
        setIsKnocking(false);
        setIsOpen(true);
        setWobbleCount((c) => c + 1);
      }, 240);
    } else {
      setWobbleCount((c) => c + 1);
      setQuipIndex((i) => (i + 1) % DOOR_QUIPS.length);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleBobbleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWobbleCount((c) => c + 1);
    setQuipIndex((i) => (i + 1) % DOOR_QUIPS.length);
  };

  return (
    <div
      data-hero-toy-zone="true"
      className="mt-7 flex items-center gap-4 border border-[#111113] bg-[#E7E1D5]/80 p-3.5 shadow-[3px_3px_0px_#111113]"
    >
      {/* Interactive Architectural Doorway */}
      <div className="relative h-[142px] w-[104px] shrink-0 overflow-visible select-none">
        {/* Knock Burst Badge */}
        {isKnocking && (
          <span className="font-mono-tech pointer-events-none absolute -top-3 -right-3 z-40 border border-[#111113] bg-[#F3EFE6] px-1.5 py-0.5 text-[10px] font-bold text-[#D9381E] uppercase shadow-[2px_2px_0px_#111113]">
            KNOCK!
          </span>
        )}

        {/* Outer Door Frame */}
        <div
          className={`relative h-full w-full border-2 border-[#111113] bg-[#111113] shadow-[3px_3px_0px_#111113] ${
            isKnocking ? 'animate-door-knock' : ''
          }`}
          style={{ perspective: '720px' }}
        >
          {/* Warm Studio Interior Behind Door */}
          <div className="absolute inset-1 overflow-hidden bg-gradient-to-b from-[#232329] via-[#1B1B20] to-[#111113]">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-14 bg-[#D9381E]/18 blur-md"
            />
          </div>

          {/* Popping Bobblehead Cutout (springs up & slightly above the frame when door opens) */}
          {isOpen && (
            <button
              type="button"
              onClick={handleBobbleTap}
              aria-label="Bobblehead popped out of doorway. Click to bobble."
              className="animate-bobble-pop absolute -top-6 left-1/2 z-30 h-[164px] w-[134px] -translate-x-1/2 cursor-pointer focus:outline-none"
            >
              <img
                key={wobbleCount}
                src={bobbleSrc}
                alt="Krish Chakraborty bobblehead popping out of door"
                className="animate-bobble-wobble h-full w-full object-contain object-top drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
                draggable={false}
              />
            </button>
          )}

          {/* Swinging Door Leaf */}
          <button
            type="button"
            onClick={isOpen ? handleClose : handleKnock}
            aria-label={isOpen ? 'Close studio door' : 'Knock on door to meet Krish'}
            style={{
              transformOrigin: 'left center',
              transform: isOpen ? 'rotateY(-108deg)' : 'rotateY(0deg)',
            }}
            className="absolute inset-1 z-20 flex cursor-pointer flex-col justify-between border border-[#111113] bg-[#D9381E] p-2 text-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-105"
          >
            {/* Top Recessed Panel + Nameplate */}
            <div className="border border-[#111113]/35 bg-[#C02E17] p-1.5 text-center">
              <span className="font-mono-tech block border border-[#111113]/50 bg-[#F3EFE6] px-1 py-0.5 text-[8px] font-bold tracking-widest text-[#111113] uppercase">
                KRISH
              </span>
            </div>

            {/* Door Knocker & Brass Knob */}
            <div className="relative flex items-center justify-end pr-0.5">
              <div className="mx-auto flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#F3EFE6] bg-[#111113]/20">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F3EFE6]" />
              </div>
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full border border-[#111113] bg-[#F3EFE6] shadow-xs"
              />
            </div>

            {/* Bottom Recessed Panel */}
            <div className="h-9 border border-[#111113]/35 bg-[#C02E17]" />
          </button>
        </div>
      </div>

      {/* Door Prompt / Controls */}
      <div className="min-w-0 flex-1">
        <p className="font-mono-tech text-[10px] font-bold tracking-widest text-[#D9381E] uppercase">
          {isOpen ? 'DOOR OPEN · BOBBLEHEAD' : 'KNOCK KNOCK'}
        </p>

        {isOpen ? (
          <>
            <p className="mt-1 text-xs font-bold leading-snug text-[#111113]">
              “{DOOR_QUIPS[quipIndex]}”
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleBobbleTap}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-1 bg-[#D9381E] px-2.5 py-1 text-[10px] font-bold text-[#F3EFE6] uppercase hover:bg-[#111113]"
              >
                <Sparkles className="h-3 w-3" />
                <span>Bobble</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-1 border border-[#111113]/30 bg-white px-2.5 py-1 text-[10px] font-bold text-[#111113] uppercase hover:border-[#111113]"
              >
                <DoorClosed className="h-3 w-3" />
                <span>Shut Door</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm font-extrabold leading-snug text-[#111113]">
              Knock to see who&apos;s behind the brief.
            </p>
            <button
              type="button"
              onClick={handleKnock}
              className="font-mono-tech mt-2.5 inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-[#111113] px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#F3EFE6] uppercase transition-colors hover:bg-[#D9381E]"
            >
              <DoorOpen className="h-3.5 w-3.5" />
              <span>Knock Door</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
