import { useEffect, useRef, useState } from 'react';

export function KineticCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || reducedMotion) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setVisible(true);

      const target = e.target as HTMLElement | null;
      const cursorTarget = target?.closest('[data-cursor]') as HTMLElement | null;
      const nextLabel = cursorTarget?.getAttribute('data-cursor') || '';
      setLabel(nextLabel);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const handleLeave = () => setVisible(false);

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  const hasLabel = label.length > 0;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[90] -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color,opacity] duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${
          hasLabel
            ? 'flex h-16 w-16 items-center justify-center rounded-full border border-[#111113] bg-[#D9381E] text-[#F3EFE6]'
            : 'h-7 w-7 rounded-full border border-[#D9381E]/75 bg-transparent'
        }`}
      >
        {hasLabel && (
          <span className="font-mono-tech text-[10px] font-bold tracking-wider uppercase">
            {label}
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[91] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D9381E] transition-opacity duration-150 ${
          visible && !hasLabel ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
}
