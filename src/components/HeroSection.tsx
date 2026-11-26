import { useCallback, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Hand,
  MessageSquareQuote,
  Music,
  RotateCw,
  ThumbsUp,
} from 'lucide-react';
import {
  ACTION_REACTIONS,
  CHARACTER_MODES,
  PROFILE,
} from '../data/portfolioData';
import { CharacterMode } from '../types/portfolio';
import {
  HeroMiniKrish3D,
  MiniKrishActionSignal,
  MiniKrishActionType,
} from './HeroMiniKrish3D';
import { KnockDoorBobblehead } from './KnockDoorBobblehead';

interface HeroSectionProps {
  onExploreWork: () => void;
  onScrollToWork: () => void;
}

export function HeroSection({ onExploreWork, onScrollToWork }: HeroSectionProps) {
  const [modeIndex, setModeIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [toyQuip, setToyQuip] = useState<string | null>(null);
  const [actionSignal, setActionSignal] = useState<MiniKrishActionSignal | null>(null);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [heroHovering, setHeroHovering] = useState(false);
  const lastGreetAtRef = useRef<number>(0);

  const activeMode = CHARACTER_MODES[modeIndex];
  const speechLine = toyQuip || activeMode.lines[lineIndex % activeMode.lines.length];

  const triggerSubtleGreet = useCallback((cooldownMs: number) => {
    const now = Date.now();
    if (now - lastGreetAtRef.current < cooldownMs) return;
    lastGreetAtRef.current = now;
    setActionSignal((prev) => ({ type: 'greet', nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  const handleHeroPointerEnter = () => {
    setHeroHovering(true);
    triggerSubtleGreet(7000);
  };

  const handleHeroPointerLeave = () => {
    setHeroHovering(false);
  };

  const handleHeroInteractClick = (e: React.MouseEvent<HTMLElement>) => {
    // Avoid double-triggering when user directly interacts with the 3D canvas or arcade action row
    const target = e.target as HTMLElement;
    if (target.closest('[data-hero-toy-zone="true"]')) return;
    triggerSubtleGreet(1600);
  };

  const handleSelectMode = (id: CharacterMode) => {
    const idx = CHARACTER_MODES.findIndex((m) => m.id === id);
    if (idx >= 0) {
      setToyQuip(null);
      if (idx === modeIndex) {
        setLineIndex((l) => (l + 1) % activeMode.lines.length);
      } else {
        setModeIndex(idx);
        setLineIndex(0);
      }
    }
  };

  const pickReaction = (type: MiniKrishActionType) => {
    const pool = ACTION_REACTIONS[type];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleToyTap = useCallback((triggeredAction: MiniKrishActionType) => {
    setLineIndex((prev) => prev + 1);
    const pool = ACTION_REACTIONS[triggeredAction];
    setToyQuip(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  const triggerAction = (type: MiniKrishActionType) => {
    setActionSignal((prev) => ({ type, nonce: (prev?.nonce ?? 0) + 1 }));
    setToyQuip(pickReaction(type));
  };

  const nextJoke = () => {
    setToyQuip(null);
    setLineIndex((l) => (l + 1) % activeMode.lines.length);
    setActionSignal((prev) => ({ type: 'thumbsup', nonce: (prev?.nonce ?? 0) + 1 }));
  };

  return (
    <section
      aria-label="Hero introduction"
      onPointerEnter={handleHeroPointerEnter}
      onPointerLeave={handleHeroPointerLeave}
      onClick={handleHeroInteractClick}
      className="relative overflow-hidden border-b border-[#111113]/15 bg-[#F3EFE6] text-[#111113]"
    >
      {/* Top context strip */}
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-b border-[#111113]/12 px-5 py-2.5 sm:px-8 lg:px-12">
        <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-[#111113]/75 uppercase">
          {PROFILE.location}
        </span>
        <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-[#D9381E] uppercase">
          {PROFILE.identity}
        </span>
        <span className="font-mono-tech text-[11px] font-semibold tracking-wider text-[#111113]/75 uppercase">
          {PROFILE.currentRoleLabel}
        </span>
      </div>

      {/* Main Hero Canvas */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-6 px-5 py-7 sm:px-8 lg:min-h-[calc(100vh-112px)] lg:grid-cols-12 lg:gap-6 lg:px-12 lg:py-8">
        {/* Left: Oversized Display Typography + Prop/Mode Selector */}
        <div className="lg:col-span-4">
          <h1 className="font-display text-[clamp(2.9rem,4.9vw,4.5rem)] leading-[0.94] font-extrabold tracking-[-0.035em] uppercase">
            <span className="block text-[#111113]">THINK</span>
            <span className="block text-[#D9381E]">BEYOND</span>
            <span className="block text-[#111113]">THE BRIEF.</span>
          </h1>

          <KnockDoorBobblehead />

          {/* Mode Toggle (Swaps Mini-Krish's 3D Props + Line) */}
          <div className="mt-5 border-t border-[#111113]/15 pt-4">
            <p className="font-mono-tech mb-2 text-[10px] font-semibold tracking-widest text-[#111113]/60 uppercase">
              SWITCH ROLE (SWAPS 3D PROP + LINE)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CHARACTER_MODES.map((m) => {
                const isSelected = m.id === activeMode.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMode(m.id)}
                    className={`font-mono-tech cursor-pointer border px-2.5 py-1.5 text-[11px] font-bold uppercase whitespace-nowrap shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[#111113] bg-[#111113] text-[#F3EFE6]'
                        : 'border-[#111113]/20 bg-white/70 text-[#111113] hover:border-[#D9381E]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Articulated 3D Mini-Krish Figurine + Speech Bubble */}
        <div data-hero-toy-zone="true" className="relative flex flex-col items-center lg:col-span-4">
          <div className="relative z-20 mb-1 w-full max-w-sm border-2 border-[#111113] bg-white px-4 py-3 shadow-[4px_4px_0px_#111113]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-tech text-[10px] font-bold tracking-widest text-[#D9381E] uppercase">
                {activeMode.hatTag}
              </span>
              <span className="font-mono-tech text-[10px] text-[#111113]/50 uppercase">
                MOVE CURSOR · DRAG OR TAP
              </span>
            </div>
            <p className="mt-1 text-sm font-bold leading-snug text-[#111113]">
              “{speechLine}”
            </p>
            <div
              aria-hidden="true"
              className="absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-[#111113] bg-white"
            />
          </div>

          {/* 3D Mini-Krish Canvas */}
          <div className="relative h-[370px] w-full sm:h-[420px] lg:h-[450px]">
            <HeroMiniKrish3D
              mode={activeMode.id}
              actionSignal={actionSignal}
              heroHovering={heroHovering}
              onToyTap={handleToyTap}
            />
          </div>

          {/* Articulated Figurine Actions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => triggerAction('thumbsup')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase whitespace-nowrap shrink-0 shadow-[2px_2px_0px_#111113] transition-transform active:translate-y-0.5 hover:bg-[#D9381E] hover:text-[#F3EFE6]"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Thumbs Up</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction('wave')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase whitespace-nowrap shrink-0 shadow-[2px_2px_0px_#111113] transition-transform active:translate-y-0.5 hover:bg-[#D9381E] hover:text-[#F3EFE6]"
            >
              <Hand className="h-3.5 w-3.5" />
              <span>Wave</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction('jumpspin')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase whitespace-nowrap shrink-0 shadow-[2px_2px_0px_#111113] transition-transform active:translate-y-0.5 hover:bg-[#D9381E] hover:text-[#F3EFE6]"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Jump &amp; Spin</span>
            </button>
            <button
              type="button"
              onClick={() => triggerAction('groove')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase whitespace-nowrap shrink-0 shadow-[2px_2px_0px_#111113] transition-transform active:translate-y-0.5 hover:bg-[#D9381E] hover:text-[#F3EFE6]"
            >
              <Music className="h-3.5 w-3.5" />
              <span>Groove</span>
            </button>
            <button
              type="button"
              onClick={nextJoke}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-[#111113] px-2.5 py-1.5 text-[11px] font-bold text-[#F3EFE6] uppercase whitespace-nowrap shrink-0 shadow-[2px_2px_0px_#D9381E] transition-transform active:translate-y-0.5 hover:bg-[#D9381E]"
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>Speak</span>
            </button>
          </div>
        </div>

        {/* Right: Lean Hook + Toggle-to-Read Intro + CTA */}
        <div className="flex flex-col justify-center lg:col-span-4 lg:pl-4">
          <div className="border-t border-[#111113] pt-5">
            <p className="text-lg leading-snug font-bold text-[#111113] sm:text-xl">
              {PROFILE.heroHook}
            </p>

            <button
              type="button"
              onClick={() => setIntroExpanded((v) => !v)}
              className="font-mono-tech mt-3 inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#D9381E] uppercase hover:underline"
              aria-expanded={introExpanded}
            >
              {introExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span>{introExpanded ? 'Hide full intro' : 'Read full intro'}</span>
            </button>

            {introExpanded && (
              <p className="mt-3 border-t border-[#111113]/15 pt-3 text-sm leading-relaxed text-[#111113]/85">
                {PROFILE.heroFullBio}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-1.5">
              {['BRAND STRATEGY', 'CREATIVE DIRECTION', 'CAMPAIGNS'].map((tag) => (
                <span
                  key={tag}
                  className="font-mono-tech border border-[#111113]/20 bg-[#E7E1D5] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#111113] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-b border-[#111113] py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onExploreWork}
                data-cursor="VIEW"
                className="group inline-flex cursor-pointer items-center gap-3 bg-[#D9381E] px-5 py-3 text-xs font-bold tracking-widest text-[#F3EFE6] uppercase whitespace-nowrap shrink-0 transition-colors hover:bg-[#111113]"
              >
                <span>EXPLORE SELECTED WORK</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onScrollToWork}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase hover:text-[#D9381E]"
              >
                <span>SCROLL</span>
                <ArrowDownRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
