import { useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import {
  ABOUT_COPY,
  AWARDS,
  CAPABILITIES,
  CAREER_TIMELINE,
  CERTIFICATIONS,
  EDUCATION,
  LEADERSHIP_ROLES,
  PERSONAL_COPY,
  PROJECTS,
} from '../data/portfolioData';
import { RoutePath } from '../types/portfolio';
import { EditableMediaSlot } from './EditableMediaSlot';

interface HomeSectionsProps {
  onNavigate: (route: RoutePath) => void;
}

export function HomeSections({ onNavigate }: HomeSectionsProps) {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [expandedTestimonials, setExpandedTestimonials] = useState<Record<string, boolean>>({});
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number | null>(null);
  const [expandedLeadership, setExpandedLeadership] = useState<Record<string, boolean>>({});
  const [expandedAwards, setExpandedAwards] = useState<Record<string, boolean>>({});
  const [capsExpanded, setCapsExpanded] = useState(false);

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTestimonial = (id: string) => {
    setExpandedTestimonials((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLeadership = (id: string) => {
    setExpandedLeadership((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAward = (id: string) => {
    setExpandedAwards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* Marquee Divider */}
      <div className="overflow-hidden border-y border-[#111113]/15 bg-[#111113] py-3 text-[#F3EFE6]">
        <div className="animate-marquee font-display text-lg tracking-wider uppercase sm:text-xl">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 pr-8">
              <span className="text-[#D9381E]">BRAND STRATEGY</span>
              <span aria-hidden="true" className="opacity-35">/</span>
              <span>CREATIVE DIRECTION</span>
              <span aria-hidden="true" className="opacity-35">/</span>
              <span>ADBABU FOUNDER</span>
              <span aria-hidden="true" className="opacity-35">/</span>
              <span className="text-[#D9381E]">INTEGRATED CAMPAIGNS</span>
              <span aria-hidden="true" className="opacity-35">/</span>
              <span>ATL &amp; BTL</span>
              <span aria-hidden="true" className="opacity-35">/</span>
              <span>STORYTELLING</span>
              <span aria-hidden="true" className="opacity-35">/</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 01: SELECTED WORK (Image placeholder + title only until toggled or clicked) */}
      <section id="selected-work" className="bg-[#111113] text-[#F3EFE6]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/15 pb-6">
            <div>
              <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                01 / SELECTED WORK
              </p>
              <h2 className="font-display text-[clamp(2.3rem,4.4vw,3.9rem)] leading-[0.96] font-extrabold tracking-[-0.03em] uppercase">
                CLICK TO EXPLORE. TOGGLE TO READ.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/work')}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-2 border border-white/25 px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors hover:border-[#D9381E] hover:text-[#D9381E]"
            >
              <span>ALL CASE STUDIES</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {PROJECTS.map((project) => {
              const isOpen = !!expandedProjects[project.id];
              return (
                <article
                  key={project.id}
                  className="flex flex-col justify-between border border-white/15 bg-[#19191D] p-5 transition-colors hover:border-[#D9381E]/75"
                >
                  <div>
                    <div className="font-mono-tech mb-3 flex items-center justify-between gap-2 text-xs text-white/60 uppercase">
                      <span className="font-bold text-[#D9381E]">
                        {project.number} · {project.name}
                      </span>
                      <span className="tabular-nums">{project.period}</span>
                    </div>

                    {/* Visual Image Placeholder */}
                    <EditableMediaSlot slot={project.coverSlot} tone="dark" compact />

                    {/* Clickable Title Only by Default */}
                    <h3
                      onClick={() => onNavigate(`/work/${project.slug}`)}
                      data-cursor="OPEN"
                      className="font-display mt-4 cursor-pointer text-2xl leading-[1.02] font-bold tracking-[-0.025em] uppercase transition-colors hover:text-[#D9381E] sm:text-3xl"
                    >
                      {project.title}
                    </h3>

                    {/* Expandable Reading Block */}
                    {isOpen && (
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <p className="font-mono-tech mb-1.5 text-[11px] text-[#D9381E] uppercase">
                          {project.category}
                        </p>
                        <p className="text-sm leading-relaxed text-[#F3EFE6]/80">
                          {project.summary}
                        </p>
                        {project.wittyNote && (
                          <p className="font-mono-tech mt-2.5 text-[11px] italic text-white/55">
                            {project.wittyNote}
                          </p>
                        )}
                        {project.verifiedHighlights && (
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                            {project.verifiedHighlights.map((hl) => (
                              <span key={hl} className="font-mono-tech text-xs font-semibold text-[#F3EFE6]">
                                + {hl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Testimonial Block (Project 1 & Adbabu) */}
                    {project.testimonial && (
                      <div className="mt-4 border border-white/12 bg-[#111113] p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-tech text-[10px] font-bold tracking-widest text-[#D9381E] uppercase">
                            TESTIMONIAL
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleTestimonial(project.id)}
                            aria-expanded={!!expandedTestimonials[project.id]}
                            className="font-mono-tech inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold uppercase text-white/70 hover:text-[#D9381E]"
                          >
                            <span>
                              {expandedTestimonials[project.id] ? 'Show short' : 'Read full'}
                            </span>
                            {expandedTestimonials[project.id] ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {expandedTestimonials[project.id] ? (
                          <div className="mt-2 space-y-2 text-xs leading-relaxed text-[#F3EFE6]/85">
                            {project.testimonial.fullParagraphs.map((para, idx) => (
                              <p key={idx}>
                                {idx === 0 ? `“${para}` : para}
                                {idx === project.testimonial!.fullParagraphs.length - 1 ? '”' : ''}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs leading-relaxed text-[#F3EFE6]/85">
                            “{project.testimonial.shortQuote}”
                          </p>
                        )}

                        <div className="mt-3 border-t border-white/10 pt-2.5">
                          <p className="text-xs font-bold text-[#F3EFE6]">
                            {project.testimonial.author}
                          </p>
                          <p className="font-mono-tech mt-0.5 text-[10px] leading-snug text-white/60">
                            {project.testimonial.role}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Toggle Read + Open Case Study */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => toggleProject(project.id)}
                      aria-expanded={isOpen}
                      className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-white/20 px-3 py-2 text-[11px] font-bold uppercase transition-colors hover:border-[#D9381E] hover:text-[#D9381E]"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      <span>{isOpen ? 'Hide Brief' : 'Read Brief'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/work/${project.slug}`)}
                      data-cursor="CASE"
                      className="inline-flex cursor-pointer items-center gap-2 bg-[#D9381E] px-4 py-2 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase transition-colors hover:bg-[#F3EFE6] hover:text-[#111113]"
                    >
                      <span>OPEN CASE STUDY</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 02: THE STORY SO FAR (Minimal hook + toggle to read) */}
      <section className="bg-[#F3EFE6] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                02 / ABOUT ME
              </p>
              <h2 className="font-display text-[clamp(2.3rem,4.2vw,3.7rem)] leading-[0.96] font-extrabold tracking-[-0.03em] uppercase">
                {ABOUT_COPY.heading}
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="text-lg font-bold leading-snug text-[#111113]">
                {ABOUT_COPY.shortHook}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStoryExpanded((v) => !v)}
                  aria-expanded={storyExpanded}
                  className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-white px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-[#111113] hover:text-[#F3EFE6]"
                >
                  {storyExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  <span>{storyExpanded ? 'Hide full story' : 'Read full story'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/about')}
                  className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase underline underline-offset-4 hover:text-[#D9381E]"
                >
                  <span>Full About Page</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {storyExpanded && (
                <div className="mt-5 space-y-3 border-t border-[#111113]/15 pt-4 text-sm leading-relaxed text-[#111113]/85 sm:text-base">
                  {ABOUT_COPY.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clickable Timeline Tabs (collapsed detail until clicked) */}
          <div className="mt-10 border-t border-[#111113]/15 pt-6">
            <p className="font-mono-tech mb-3 text-[11px] font-bold tracking-widest text-[#111113]/60 uppercase">
              TIMELINE (CLICK A MILESTONE TO READ)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CAREER_TIMELINE.map((item, idx) => {
                const active = idx === activeTimelineIdx;
                return (
                  <button
                    key={item.period}
                    type="button"
                    onClick={() => setActiveTimelineIdx(active ? null : idx)}
                    className={`cursor-pointer border p-3.5 text-left transition-colors ${
                      active
                        ? 'border-[#111113] bg-[#111113] text-[#F3EFE6]'
                        : 'border-[#111113]/20 bg-white/70 text-[#111113] hover:border-[#D9381E]'
                    }`}
                  >
                    <span className="font-mono-tech block text-xs font-bold text-[#D9381E] tabular-nums">
                      {item.period}
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-snug">
                      {item.organization}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeTimelineIdx !== null && (
              <div className="mt-3 flex flex-col justify-between gap-4 border border-[#111113] bg-white p-5 sm:flex-row sm:items-center">
                <div>
                  <span className="font-mono-tech text-[11px] font-bold text-[#D9381E] uppercase">
                    {CAREER_TIMELINE[activeTimelineIdx].period} ·{' '}
                    {CAREER_TIMELINE[activeTimelineIdx].tag}
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold">
                    {CAREER_TIMELINE[activeTimelineIdx].title}
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-[#111113]/80">
                  {CAREER_TIMELINE[activeTimelineIdx].summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 03: LEADERSHIP (Image Placeholders + Title Only until Toggled) */}
      <section className="border-t border-[#111113]/15 bg-[#E7E1D5] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#111113]/15 pb-5">
            <div>
              <p className="font-mono-tech mb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                03 / LEADERSHIP
              </p>
              <h2 className="font-display text-3xl leading-[1.0] font-extrabold uppercase tracking-[-0.025em] sm:text-4xl">
                GOOD IDEAS NEED GOOD PEOPLE.
              </h2>
            </div>
            <span className="font-mono-tech text-[11px] text-[#111113]/65 uppercase">
              Click any card to read role details
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP_ROLES.map((item) => {
              const open = !!expandedLeadership[item.id];
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between border border-[#111113]/20 bg-white p-4"
                >
                  <div>
                    <EditableMediaSlot slot={item.slot} tone="light" compact />
                    <button
                      type="button"
                      onClick={() => toggleLeadership(item.id)}
                      className="mt-3 flex w-full cursor-pointer items-start justify-between gap-2 text-left"
                    >
                      <div>
                        <span className="font-mono-tech text-[10px] font-bold text-[#D9381E] uppercase">
                          {item.organization}
                        </span>
                        <h3 className="mt-0.5 text-base font-extrabold leading-snug hover:text-[#D9381E]">
                          {item.role}
                        </h3>
                      </div>
                      <span className="mt-1 shrink-0 text-[#111113]/60">
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>

                    {open && (
                      <p className="mt-2 border-t border-[#111113]/10 pt-2 text-xs leading-relaxed text-[#111113]/75">
                        {item.focus}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 04: RECOGNITION (Visual Award Cards with Image + Link Place) */}
      <section className="border-t border-[#111113]/15 bg-[#F3EFE6] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#111113]/15 pb-5">
            <div>
              <p className="font-mono-tech mb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                04 / RECOGNITION &amp; AWARDS
              </p>
              <h2 className="font-display text-3xl leading-[1.0] font-extrabold uppercase tracking-[-0.025em] sm:text-4xl">
                A FEW COMPETITIVE INSTINCTS.
              </h2>
            </div>
            <span className="font-mono-tech text-[11px] text-[#111113]/65 uppercase">
              Click any card to toggle details
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AWARDS.map((award) => {
              const open = !!expandedAwards[award.id];
              return (
                <article
                  key={award.id}
                  className="flex flex-col justify-between border border-[#111113]/20 bg-white p-4 transition-colors hover:border-[#D9381E]/75"
                >
                  <div>
                    <div className="font-mono-tech mb-2.5 flex items-center justify-between gap-2 text-[11px] uppercase">
                      <span className="font-bold text-[#D9381E]">{award.rank}</span>
                      <span className="truncate text-[#111113]/65">
                        {award.scope || award.institution}
                      </span>
                    </div>

                    <EditableMediaSlot slot={award.slot} tone="light" compact />

                    <button
                      type="button"
                      onClick={() => toggleAward(award.id)}
                      aria-expanded={open}
                      className="mt-3 flex w-full cursor-pointer items-start justify-between gap-2 text-left"
                    >
                      <div>
                        <h3 className="text-base font-extrabold leading-snug hover:text-[#D9381E]">
                          {award.event}
                        </h3>
                        <p className="font-mono-tech mt-0.5 text-[11px] text-[#111113]/70 uppercase">
                          {award.institution}
                          {award.scope ? ` (${award.scope})` : ''}
                        </p>
                      </div>
                      <span className="mt-1 shrink-0 text-[#111113]/60">
                        {open ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    {open && award.note && (
                      <p className="mt-2 border-t border-[#111113]/10 pt-2 text-xs leading-relaxed text-[#111113]/75">
                        {award.note}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* SECTION 05: CAPABILITIES + TOGGLEABLE EDUCATION */}
          <div className="mt-16 border-t border-[#111113]/15 pt-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                  05 / CAPABILITIES
                </p>
                <h2 className="font-display text-3xl leading-[1.0] font-extrabold uppercase tracking-[-0.025em] sm:text-4xl">
                  WHAT I DO.
                </h2>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setCapsExpanded((v) => !v)}
                    aria-expanded={capsExpanded}
                    className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-[#111113] bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-[#111113] hover:text-[#F3EFE6]"
                  >
                    {capsExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span>{capsExpanded ? 'Hide Education & Certs' : 'View Education & Certs'}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {CAPABILITIES.map((group) => (
                    <div key={group.title} className="border-t-2 border-[#111113] pt-2.5">
                      <h3 className="font-mono-tech mb-2 text-[11px] font-bold tracking-widest text-[#D9381E] uppercase">
                        {group.title}
                      </h3>
                      <ul className="space-y-1 text-xs font-semibold">
                        {group.items.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {capsExpanded && (
                  <div className="mt-6 border border-[#111113]/20 bg-white p-4 text-xs">
                    <div className="space-y-2">
                      {EDUCATION.map((edu) => (
                        <p key={edu.institution}>
                          <strong>{edu.institution}</strong> ({edu.period}) · {edu.degree} ·{' '}
                          {edu.detail}
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 border-t border-[#111113]/10 pt-2 text-[#111113]/75">
                      <strong>Certifications:</strong> {CERTIFICATIONS.join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal & Experiments (Compact strip, no details or images) */}
          <div className="mt-12 border-t border-[#111113]/15 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono-tech mb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                  06 / PERSONAL &amp; EXPERIMENTS
                </p>
                <h2 className="font-display text-2xl leading-[1.0] font-extrabold uppercase tracking-[-0.025em] sm:text-3xl">
                  {PERSONAL_COPY.heading}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/experiments')}
                className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase underline underline-offset-4 hover:text-[#D9381E]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#D9381E]" />
                <span>Open Experiments</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
