import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, FolderUp } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { useAssetVault } from '../context/AssetVaultContext';
import { RoutePath } from '../types/portfolio';
import { EditableMediaSlot } from './EditableMediaSlot';

interface CaseStudyPageProps {
  slug: string;
  onNavigate: (route: RoutePath) => void;
}

export function CaseStudyPage({ slug, onNavigate }: CaseStudyPageProps) {
  const { setDrawerOpen } = useAssetVault();
  const projectIndex = PROJECTS.findIndex((p) => p.slug === slug);
  const project = PROJECTS[projectIndex >= 0 ? projectIndex : 0];
  const prevProject = PROJECTS[(projectIndex - 1 + PROJECTS.length) % PROJECTS.length];
  const nextProject = PROJECTS[(projectIndex + 1) % PROJECTS.length];

  const [activeTrackId, setActiveTrackId] = useState(
    project.campaignTracks?.[0]?.id ?? '',
  );
  const [showOverviewText, setShowOverviewText] = useState(false);
  const [showResponsibilities, setShowResponsibilities] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const activeTrack =
    project.campaignTracks?.find((t) => t.id === activeTrackId) ??
    project.campaignTracks?.[0];

  return (
    <article className="bg-[#111113] text-[#F3EFE6]">
      {/* Header */}
      <div className="border-b border-[#111113]/15 bg-[#F3EFE6] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/work')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-[#D9381E]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>BACK TO ALL WORK</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-2 bg-[#111113] px-3.5 py-2 text-[11px] font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#D9381E]"
            >
              <FolderUp className="h-3.5 w-3.5" />
              <span>UPLOAD CASE ASSETS</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="font-mono-tech flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
                <span className="bg-[#D9381E] px-2 py-0.5 text-[#F3EFE6]">
                  PROJECT {project.number}
                </span>
                <span>·</span>
                <span>{project.name}</span>
                <span>·</span>
                <span className="text-[#111113]/70">{project.category}</span>
              </div>
              <h1 className="font-display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase [text-wrap:balance]">
                {project.title}
              </h1>
            </div>

            <div className="border-t border-[#111113] pt-4 lg:col-span-4">
              {project.role && (
                <div className="mb-3">
                  <p className="font-mono-tech text-[10px] font-bold uppercase opacity-65">ROLE</p>
                  <p className="text-base font-bold">{project.role}</p>
                </div>
              )}
              <div>
                <p className="font-mono-tech text-[10px] font-bold uppercase opacity-65">
                  TIMELINE
                </p>
                <p className="font-mono-tech text-sm font-bold tabular-nums">{project.period}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual-First Body */}
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <EditableMediaSlot slot={project.coverSlot} tone="dark" />
          </div>
          <div className="border border-white/15 bg-[#19191D] p-5 lg:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-tech text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                CASE BRIEF
              </p>
              <button
                type="button"
                onClick={() => setShowOverviewText((v) => !v)}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold uppercase text-white/80 hover:text-[#D9381E]"
              >
                {showOverviewText ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>{showOverviewText ? 'Hide' : 'Read'}</span>
              </button>
            </div>

            {project.wittyNote && (
              <p className="mt-3 text-sm font-semibold text-[#F3EFE6]">{project.wittyNote}</p>
            )}

            {showOverviewText && (
              <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-[#F3EFE6]/80">
                {project.summary}
              </p>
            )}

            {project.verifiedHighlights && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="font-mono-tech mb-2 text-[10px] font-bold text-[#D9381E] uppercase">
                  VERIFIED HIGHLIGHTS
                </p>
                <ul className="space-y-1.5">
                  {project.verifiedHighlights.map((hl) => (
                    <li key={hl} className="font-mono-tech text-xs font-bold text-[#F3EFE6]">
                      + {hl}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.pillars && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="font-mono-tech mb-2 text-[10px] font-bold text-white/55 uppercase">
                  SCOPE
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.pillars.map((pillar) => (
                    <span
                      key={pillar}
                      className="border border-white/15 bg-[#111113] px-2.5 py-1 text-[11px] font-semibold"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Testimonial */}
        {project.testimonial && (
          <div className="mt-12 border border-white/15 bg-[#19191D] p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-4">
                <p className="font-mono-tech text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                  CLIENT &amp; LEADERSHIP ENDORSEMENT
                </p>
                <h2 className="font-display mt-2 text-2xl uppercase tracking-tight">
                  {project.testimonial.author}
                </h2>
                <p className="font-mono-tech mt-1 text-xs leading-relaxed text-white/65">
                  {project.testimonial.role}
                </p>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-[#F3EFE6]/90 sm:text-base lg:col-span-8">
                {project.testimonial.fullParagraphs.map((para, idx) => (
                  <p key={idx}>
                    {idx === 0 ? `“${para}` : para}
                    {idx === project.testimonial!.fullParagraphs.length - 1 ? '”' : ''}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Adbabu Expanded Agency Timeline (Toggleable) */}
        {project.agencyTimeline && (
          <div className="mt-12 border-t border-white/15 pt-8">
            <button
              type="button"
              onClick={() => setShowTimeline((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="font-mono-tech text-xs font-bold text-[#D9381E] uppercase">
                  AGENCY TIMELINE (JULY 2023 TO JUNE 2024)
                </p>
                <h2 className="font-display mt-1 text-2xl leading-[1.02] font-extrabold tracking-[-0.025em] uppercase sm:text-3xl">
                  HOW ADBABU GREW TO A 6-PERSON STUDIO
                </h2>
              </div>
              <span className="font-mono-tech inline-flex items-center gap-1 border border-white/20 px-3 py-1.5 text-xs uppercase">
                {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{showTimeline ? 'Collapse' : 'Expand'}</span>
              </span>
            </button>

            {showTimeline && (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {project.agencyTimeline.map((phase) => (
                  <div
                    key={phase.phase}
                    className="flex flex-col justify-between border border-white/15 bg-[#19191D] p-5"
                  >
                    <div>
                      <span className="font-mono-tech text-xs font-bold text-[#D9381E] tabular-nums">
                        {phase.phase}
                      </span>
                      <h3 className="mt-2 text-lg font-extrabold">{phase.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#F3EFE6]/75">
                        {phase.summary}
                      </p>
                    </div>
                    <p className="mt-4 border-t border-white/10 pt-3 font-mono-tech text-[11px] italic text-white/55">
                      Reality check: {phase.realityCheck}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Adbabu 6-Member Team Workflow (Toggleable) */}
        {project.teamWorkflow && (
          <div className="mt-10 border-t border-white/15 pt-8">
            <button
              type="button"
              onClick={() => setShowWorkflow((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="font-mono-tech text-xs font-bold text-[#D9381E] uppercase">
                  6-MEMBER TEAM WORKFLOW
                </p>
                <h2 className="font-display mt-1 text-2xl leading-[1.02] font-extrabold tracking-[-0.025em] uppercase sm:text-3xl">
                  FROM MESSY BRIEF TO LAUNCH KIT
                </h2>
              </div>
              <span className="font-mono-tech inline-flex items-center gap-1 border border-white/20 px-3 py-1.5 text-xs uppercase">
                {showWorkflow ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{showWorkflow ? 'Collapse' : 'Expand'}</span>
              </span>
            </button>

            {showWorkflow && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {project.teamWorkflow.map((item) => (
                  <div key={item.step} className="border border-white/15 bg-[#19191D] p-5">
                    <span className="font-mono-tech text-xs font-bold text-[#D9381E] tabular-nums">
                      STEP {item.step}
                    </span>
                    <h3 className="mt-2 text-base font-extrabold">{item.role}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#F3EFE6]/75">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alt DRX Responsibilities (Toggleable) */}
        {project.responsibilities && (
          <div className="mt-12 border-t border-white/15 pt-8">
            <button
              type="button"
              onClick={() => setShowResponsibilities((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
            >
              <div>
                <p className="font-mono-tech text-xs font-bold text-[#D9381E] uppercase">
                  WHAT THIS ROLE COVERS
                </p>
                <h2 className="font-display mt-1 text-2xl leading-[1.02] font-extrabold tracking-[-0.025em] uppercase sm:text-3xl">
                  9 CORE RESPONSIBILITIES AT ALT DRX
                </h2>
              </div>
              <span className="font-mono-tech inline-flex items-center gap-1 border border-white/20 px-3 py-1.5 text-xs uppercase">
                {showResponsibilities ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>{showResponsibilities ? 'Hide List' : 'Read List'}</span>
              </span>
            </button>

            {showResponsibilities && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.responsibilities.map((resp, idx) => (
                  <div key={resp} className="border border-white/15 bg-[#19191D] p-4">
                    <span className="font-mono-tech text-xs font-bold text-[#D9381E] tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-1 text-sm font-medium text-[#F3EFE6]">{resp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alt DRX Digital vs Traditional */}
        {project.digitalVsTraditional && (
          <div className="mt-14 border-t border-white/15 pt-10">
            <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              MEDIA CONTRAST
            </p>
            <h2 className="font-display mb-8 text-3xl leading-[1.0] font-extrabold uppercase tracking-[-0.025em] sm:text-4xl">
              TRADITIONAL SCALE MEETS DIGITAL PRECISION.
            </h2>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="border border-[#D9381E]/40 bg-[#19191D] p-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-display text-2xl text-[#D9381E] uppercase">
                    TRADITIONAL / ATL &amp; BTL
                  </span>
                  <span className="font-mono-tech text-[11px] text-white/60 uppercase">
                    TV · BILLBOARDS · PRINT
                  </span>
                </div>
                <div className="space-y-6">
                  {project.digitalVsTraditional.traditional.map((block) => (
                    <div key={block.label}>
                      <h3 className="mb-2 text-base font-bold">{block.label}</h3>
                      <EditableMediaSlot slot={block.slot} tone="dark" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/25 bg-[#19191D] p-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-display text-2xl text-[#F3EFE6] uppercase">
                    DIGITAL / SOCIAL, PAID &amp; PRODUCT
                  </span>
                  <span className="font-mono-tech text-[11px] text-white/60 uppercase">
                    CREATORS · REVIEWS · PAID
                  </span>
                </div>
                <div className="space-y-6">
                  {project.digitalVsTraditional.digital.map((block) => (
                    <div key={block.label}>
                      <h3 className="mb-2 text-base font-bold">{block.label}</h3>
                      <EditableMediaSlot slot={block.slot} tone="dark" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Tracks */}
        {project.campaignTracks && activeTrack && (
          <div className="mt-14 border-t border-white/15 pt-10">
            <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              PROJECT BREAKDOWN
            </p>
            <h2 className="font-display mb-6 text-3xl leading-[1.0] font-extrabold uppercase tracking-[-0.025em] sm:text-4xl">
              FREELANCE, COLLEGE &amp; SIDE BRIEFS
            </h2>

            <div className="mb-6 flex flex-wrap gap-2">
              {project.campaignTracks.map((track) => {
                const isSelected = track.id === activeTrack.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setActiveTrackId(track.id)}
                    className={`font-mono-tech cursor-pointer border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                      isSelected
                        ? 'border-[#D9381E] bg-[#D9381E] text-[#F3EFE6]'
                        : 'border-white/20 text-[#F3EFE6] hover:border-[#D9381E]'
                    }`}
                  >
                    {track.label}
                  </button>
                );
              })}
            </div>

            <div className="border border-white/15 bg-[#19191D] p-6">
              <p className="font-mono-tech mb-4 text-xs text-white/65 uppercase">
                {activeTrack.medium}
              </p>
              <EditableMediaSlot slot={activeTrack.slot} tone="dark" />
            </div>
          </div>
        )}

        {/* Visual Gallery */}
        {project.gallerySlots.length > 0 && (
          <div className="mt-14 border-t border-white/15 pt-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono-tech text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                  VISUAL GALLERY
                </p>
                <h2 className="font-display mt-1 text-3xl uppercase sm:text-4xl">
                  IMAGE PLACEHOLDERS &amp; ARTEFACTS
                </h2>
              </div>
              <span className="font-mono-tech text-[11px] text-white/55 uppercase">
                Click any slot to upload your creative
              </span>
            </div>

            <div className="dark-gallery-scroll flex gap-6 overflow-x-auto pb-4">
              {project.gallerySlots.map((slot) => (
                <div key={slot.slotId} className="w-[300px] shrink-0 sm:w-[400px]">
                  <EditableMediaSlot slot={slot} tone="dark" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next */}
        <div className="mt-14 grid grid-cols-1 gap-4 border-t border-white/15 pt-10 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onNavigate(`/work/${prevProject.slug}`)}
            className="flex cursor-pointer items-center justify-between border border-white/15 bg-[#19191D] p-5 text-left transition-colors hover:border-[#D9381E]"
          >
            <div>
              <span className="font-mono-tech text-[11px] text-white/55 uppercase">
                ← PREVIOUS PROJECT
              </span>
              <p className="font-display mt-1 text-2xl uppercase">
                {prevProject.number} · {prevProject.name}
              </p>
            </div>
            <ArrowLeft className="h-5 w-5 text-[#D9381E]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate(`/work/${nextProject.slug}`)}
            className="flex cursor-pointer items-center justify-between border border-white/15 bg-[#19191D] p-5 text-right transition-colors hover:border-[#D9381E]"
          >
            <ArrowRight className="h-5 w-5 text-[#D9381E]" />
            <div>
              <span className="font-mono-tech text-[11px] text-white/55 uppercase">
                NEXT PROJECT →
              </span>
              <p className="font-display mt-1 text-2xl uppercase">
                {nextProject.number} · {nextProject.name}
              </p>
            </div>
          </button>
        </div>
      </div>
    </article>
  );
}
