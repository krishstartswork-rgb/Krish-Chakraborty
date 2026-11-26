import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FolderUp,
  Mail,
  Printer,
  Send,
} from 'lucide-react';
import {
  ABOUT_COPY,
  AWARDS,
  CAPABILITIES,
  CAREER_TIMELINE,
  CERTIFICATIONS,
  EDUCATION,
  LEADERSHIP_ROLES,
  PERSONAL_COPY,
  PROFILE,
  PROJECTS,
} from '../data/portfolioData';
import { useAssetVault } from '../context/AssetVaultContext';
import { ProjectCategory, RoutePath } from '../types/portfolio';
import { EditableMediaSlot } from './EditableMediaSlot';
import { ExperimentsLabBody } from './ExperimentsLabBody';

const FILTER_OPTIONS: ProjectCategory[] = [
  'All',
  'Brand & Growth',
  'Entrepreneurship',
  'Other Projects',
  'Content & Experiments',
];

export function WorkArchivePage({ onNavigate }: { onNavigate: (route: RoutePath) => void }) {
  const [filter, setFilter] = useState<ProjectCategory>('All');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandedTestimonials, setExpandedTestimonials] = useState<Record<string, boolean>>({});
  const { setDrawerOpen } = useAssetVault();

  const visibleProjects =
    filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.filterGroup === filter);

  return (
    <div className="bg-[#111113] text-[#F3EFE6]">
      <div className="border-b border-[#111113]/15 bg-[#F3EFE6] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                SELECTED WORK ARCHIVE
              </p>
              <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.6rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase">
                BRANDS, CAMPAIGNS &amp; SYSTEMS.
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="font-mono-tech inline-flex cursor-pointer items-center gap-2 bg-[#111113] px-4 py-3 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#D9381E]"
            >
              <FolderUp className="h-4 w-4" />
              <span>MANAGE ASSET UPLOADS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-white/12 pb-6">
          {FILTER_OPTIONS.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`font-mono-tech cursor-pointer border px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                  active
                    ? 'border-[#D9381E] bg-[#D9381E] text-[#F3EFE6]'
                    : 'border-white/20 text-[#F3EFE6]/80 hover:border-[#D9381E] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {visibleProjects.map((project) => {
            const isOpen = !!expanded[project.id];
            return (
              <article
                key={project.id}
                className="flex flex-col justify-between border border-white/15 bg-[#19191D] p-5 sm:p-6"
              >
                <div>
                  <div className="font-mono-tech mb-3 flex items-center justify-between text-xs text-white/60 uppercase">
                    <span className="font-bold text-[#D9381E]">
                      PROJECT {project.number} · {project.name}
                    </span>
                    <span className="tabular-nums">{project.period}</span>
                  </div>

                  <EditableMediaSlot slot={project.coverSlot} tone="dark" />

                  <h2
                    onClick={() => onNavigate(`/work/${project.slug}`)}
                    data-cursor="OPEN"
                    className="font-display mt-4 cursor-pointer text-2xl leading-[1.02] font-bold tracking-[-0.025em] uppercase transition-colors hover:text-[#D9381E] sm:text-3xl"
                  >
                    {project.title}
                  </h2>

                  {isOpen && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="font-mono-tech mb-1 text-[11px] text-[#D9381E] uppercase">
                        {project.category}
                      </p>
                      <p className="text-sm leading-relaxed text-[#F3EFE6]/75">
                        {project.summary}
                      </p>
                    </div>
                  )}

                  {project.testimonial && (
                    <div className="mt-4 border border-white/12 bg-[#111113] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-tech text-[10px] font-bold tracking-widest text-[#D9381E] uppercase">
                          TESTIMONIAL
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTestimonials((prev) => ({
                              ...prev,
                              [project.id]: !prev[project.id],
                            }))
                          }
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

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [project.id]: !prev[project.id] }))
                    }
                    className="font-mono-tech inline-flex cursor-pointer items-center gap-1.5 border border-white/20 px-3 py-2 text-[11px] font-bold uppercase hover:border-[#D9381E]"
                  >
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    <span>{isOpen ? 'Hide Brief' : 'Read Brief'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/work/${project.slug}`)}
                    data-cursor="OPEN"
                    className="font-mono-tech inline-flex cursor-pointer items-center gap-2 bg-[#D9381E] px-4 py-2 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase transition-colors hover:bg-[#F3EFE6] hover:text-[#111113]"
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
    </div>
  );
}

export function AboutPage({ onNavigate }: { onNavigate: (route: RoutePath) => void }) {
  return (
    <div className="bg-[#F3EFE6] text-[#111113]">
      <div className="border-b border-[#111113]/15 bg-[#E7E1D5]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
            ABOUT KRISH CHAKRABORTY
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.6rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase">
            {ABOUT_COPY.heading}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-4 text-lg leading-relaxed text-[#111113]/85 lg:col-span-7">
            {ABOUT_COPY.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-xl font-bold text-[#111113]' : ''}>
                {p}
              </p>
            ))}
          </div>

          <div className="border border-[#111113] bg-[#111113] p-6 text-[#F3EFE6] lg:col-span-5">
            <p className="font-mono-tech text-xs font-bold text-[#D9381E] uppercase">
              AT A GLANCE
            </p>
            <dl className="mt-4 divide-y divide-white/15 text-sm">
              <div className="py-3">
                <dt className="font-mono-tech text-[11px] text-white/55 uppercase">FOCUS</dt>
                <dd className="mt-1 font-semibold">{PROFILE.identity}</dd>
              </div>
              <div className="py-3">
                <dt className="font-mono-tech text-[11px] text-white/55 uppercase">BASE</dt>
                <dd className="mt-1 font-semibold">Bengaluru, India</dd>
              </div>
              <div className="py-3">
                <dt className="font-mono-tech text-[11px] text-white/55 uppercase">CURRENT</dt>
                <dd className="mt-1 font-semibold">Assistant Manager, Growth at Alt DRX</dd>
              </div>
              <div className="py-3">
                <dt className="font-mono-tech text-[11px] text-white/55 uppercase">EDUCATION</dt>
                <dd className="mt-1 font-semibold">PGDM Marketing &amp; Business, JAGSoM</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => onNavigate('/resume')}
              className="font-mono-tech mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-[#D9381E] px-4 py-3 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#F3EFE6] hover:text-[#111113]"
            >
              <span>OPEN PRINTABLE RESUME</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Career Timeline */}
        <div className="mt-16 border-t border-[#111113]/15 pt-10">
          <h2 className="font-display text-4xl uppercase">CAREER TIMELINE</h2>
          <div className="mt-6 divide-y divide-[#111113]/15 border-y border-[#111113]/15">
            {CAREER_TIMELINE.map((item) => (
              <div key={item.period} className="grid grid-cols-1 gap-4 py-5 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <span className="font-mono-tech inline-block bg-[#111113] px-2.5 py-0.5 text-xs font-bold text-[#F3EFE6] tabular-nums uppercase">
                    {item.period}
                  </span>
                  <p className="mt-2 text-sm font-bold text-[#D9381E]">{item.organization}</p>
                </div>
                <div className="lg:col-span-4">
                  <h3 className="text-lg font-extrabold">{item.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-[#111113]/80 lg:col-span-5">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Visual Gallery */}
        <div className="mt-16 border-t border-[#111113]/15 pt-10">
          <h2 className="font-display text-4xl uppercase">GOOD IDEAS NEED GOOD PEOPLE.</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP_ROLES.map((role) => (
              <div key={role.id} className="border border-[#111113]/20 bg-white p-4">
                <EditableMediaSlot slot={role.slot} tone="light" compact />
                <p className="font-mono-tech mt-3 text-[11px] font-bold text-[#D9381E] uppercase">
                  {role.organization}
                </p>
                <h3 className="mt-1 text-base font-extrabold">{role.role}</h3>
                <p className="mt-1 text-xs text-[#111113]/75">{role.focus}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recognition & Awards (Visual Cards with Image + Link Place) */}
        <div className="mt-16 border-t border-[#111113]/15 pt-10">
          <h2 className="font-display text-4xl uppercase">A FEW COMPETITIVE INSTINCTS.</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AWARDS.map((award) => (
              <div key={award.id} className="border border-[#111113]/20 bg-white p-4">
                <div className="font-mono-tech mb-2.5 flex items-center justify-between gap-2 text-[11px] uppercase">
                  <span className="font-bold text-[#D9381E]">{award.rank}</span>
                  <span className="truncate text-[#111113]/65">
                    {award.scope || award.institution}
                  </span>
                </div>
                <EditableMediaSlot slot={award.slot} tone="light" compact />
                <h3 className="mt-3 text-base font-extrabold">{award.event}</h3>
                <p className="font-mono-tech mt-0.5 text-[11px] text-[#111113]/70 uppercase">
                  {award.institution}
                  {award.scope ? ` (${award.scope})` : ''}
                </p>
                {award.note && (
                  <p className="mt-1.5 text-xs text-[#111113]/75">{award.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="mt-16 border-t border-[#111113]/15 pt-10">
          <h2 className="font-display text-4xl uppercase">CAPABILITIES</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CAPABILITIES.map((grp) => (
              <div key={grp.title} className="border-t-2 border-[#111113] pt-3">
                <p className="font-mono-tech text-xs font-bold text-[#D9381E] uppercase">
                  {grp.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed font-medium text-[#111113]/85">
                  {grp.items.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperimentsPage({ onNavigate: _onNavigate }: { onNavigate?: (route: RoutePath) => void }) {
  return (
    <div className="bg-[#111113] text-[#F3EFE6]">
      <div className="border-b border-[#111113]/15 bg-[#F3EFE6] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
            EXPERIMENTS &amp; PERSONAL SIDE
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase">
            {PERSONAL_COPY.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#111113]/85 sm:text-lg">
            {PERSONAL_COPY.body}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12">
        <ExperimentsLabBody />
      </div>
    </div>
  );
}

export function ContactPage({ onNavigate }: { onNavigate: (route: RoutePath) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Brand Strategy & Positioning');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    const subject = encodeURIComponent(`[Portfolio Inquiry] ${topic} from ${name}`);
    const body = encodeURIComponent(`From: ${name} (${email})\nTopic: ${topic}\n\n${message}`);
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <div className="bg-[#111113] text-[#F3EFE6]">
      <div className="border-b border-[#111113]/15 bg-[#F3EFE6] text-[#111113]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <p className="font-mono-tech mb-2 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
            LET&apos;S CONNECT
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.6rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase">
            LET&apos;S MAKE SOMETHING WORTH REMEMBERING.
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="space-y-6 lg:col-span-5">
          <p className="text-lg leading-relaxed text-[#F3EFE6]/85">
            Have an interesting idea, a challenging brief, or an opportunity worth discussing?
            I&apos;m always up for a good conversation (ideally over coffee, no 42-slide deck required).
          </p>

          <div className="space-y-3 border-t border-white/15 pt-6">
            <a
              href={`mailto:${PROFILE.email}`}
              className="flex items-center justify-between bg-[#D9381E] px-5 py-4 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#F3EFE6] hover:text-[#111113]"
            >
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {PROFILE.email}
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex w-full cursor-pointer items-center justify-between border border-white/20 px-5 py-3.5 text-xs font-bold tracking-wider uppercase hover:border-[#D9381E]"
            >
              <span>COPY EMAIL ADDRESS</span>
              <span className="text-[#D9381E]">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </span>
            </button>

            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-white/20 px-5 py-3.5 text-xs font-bold tracking-wider uppercase hover:border-[#D9381E]"
            >
              <span>LINKEDIN: {PROFILE.linkedinDisplay}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => onNavigate('/resume')}
              className="flex w-full cursor-pointer items-center justify-between border border-white/20 px-5 py-3.5 text-xs font-bold tracking-wider uppercase hover:border-[#D9381E]"
            >
              <span>DOWNLOAD / PRINT RESUME</span>
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-white/15 bg-[#19191D] p-6 sm:p-8 lg:col-span-7"
        >
          <p className="font-mono-tech mb-6 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
            SEND A BRIEF OR MESSAGE
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="font-mono-tech mb-1.5 block text-[11px] uppercase text-white/70">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Verma"
                className="w-full border border-white/20 bg-[#111113] px-4 py-3 text-sm text-white focus:border-[#D9381E] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono-tech mb-1.5 block text-[11px] uppercase text-white/70">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border border-white/20 bg-[#111113] px-4 py-3 text-sm text-white focus:border-[#D9381E] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="font-mono-tech mb-1.5 block text-[11px] uppercase text-white/70">
              Topic / Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Brand Strategy & Positioning',
                'Integrated Campaign Direction',
                'Growth & Communications Role',
                'Creative Collaboration',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTopic(opt)}
                  className={`font-mono-tech cursor-pointer border px-3 py-2 text-[11px] uppercase ${
                    topic === opt
                      ? 'border-[#D9381E] bg-[#D9381E] font-bold text-[#F3EFE6]'
                      : 'border-white/20 text-white/75 hover:border-white/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="font-mono-tech mb-1.5 block text-[11px] uppercase text-white/70">
              Message / Brief
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me about the brand challenge, role, or creative experiment..."
              className="w-full border border-white/20 bg-[#111113] px-4 py-3 text-sm text-white focus:border-[#D9381E] focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 bg-[#D9381E] px-6 py-3.5 text-xs font-bold tracking-widest text-[#F3EFE6] uppercase transition-colors hover:bg-[#F3EFE6] hover:text-[#111113]"
            >
              <Send className="h-4 w-4" />
              <span>OPEN IN EMAIL CLIENT</span>
            </button>
            {submitted && (
              <p className="font-mono-tech text-xs text-[#F3EFE6]">
                Draft ready in your mail app, or email {PROFILE.email} directly.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function ResumePage({ onNavigate }: { onNavigate: (route: RoutePath) => void }) {
  return (
    <div className="min-h-screen bg-[#E7E1D5] py-10 text-[#111113]">
      <div className="no-print mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="font-mono-tech cursor-pointer text-xs font-bold tracking-wider uppercase underline underline-offset-4 hover:text-[#D9381E]"
        >
          ← Back to Portfolio
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="font-mono-tech inline-flex cursor-pointer items-center gap-2 bg-[#111113] px-5 py-2.5 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase hover:bg-[#D9381E]"
        >
          <Printer className="h-4 w-4" />
          <span>PRINT / SAVE AS PDF</span>
        </button>
      </div>

      <div className="print-only-sheet mx-auto max-w-4xl border border-[#111113] bg-white p-8 shadow-sm sm:p-12">
        <div className="border-b-2 border-[#111113] pb-6">
          <h1 className="font-display text-5xl uppercase tracking-tight">{PROFILE.name}</h1>
          <p className="mt-1 text-base font-bold text-[#D9381E]">{PROFILE.identity}</p>
          <p className="font-mono-tech mt-2 text-xs text-[#111113]/75">
            Bengaluru, India · {PROFILE.email} · {PROFILE.linkedinDisplay}
          </p>
        </div>

        <div className="mt-6 space-y-8">
          <section>
            <h2 className="font-mono-tech border-b border-[#111113]/20 pb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              EXPERIENCE
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-bold">Assistant Manager, Growth | Alt DRX</h3>
                  <span className="font-mono-tech text-xs">December 2025 to Present</span>
                </div>
                <p className="mt-1 text-sm text-[#111113]/80">
                  Social media strategy &amp; content direction, managing a 4-member team, ATL/BTL campaigns across print, national TV &amp; billboards, end-to-end paid execution, influencer &amp; agency management, cross-functional alignment with Sales, Product &amp; Performance, and Play Store reviews campaign.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-bold">Founder &amp; Lead Brand Strategist | Adbabu Branding Solutions</h3>
                  <span className="font-mono-tech text-xs">July 2023 to June 2024</span>
                </div>
                <p className="mt-1 text-sm text-[#111113]/80">
                  Advised 8+ early-stage B2B and B2C startups and led a 6-member creative &amp; strategy team across brand positioning, naming, visual identity systems, go-to-market strategy, and launch campaigns.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-mono-tech border-b border-[#111113]/20 pb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                EDUCATION
              </h2>
              <div className="mt-3 space-y-3 text-sm">
                {EDUCATION.map((e) => (
                  <div key={e.institution}>
                    <p className="font-bold">{e.institution}</p>
                    <p className="text-[#111113]/80">
                      {e.degree} · {e.period} · {e.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-mono-tech border-b border-[#111113]/20 pb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                CERTIFICATIONS
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-[#111113]/80">
                {CERTIFICATIONS.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-mono-tech border-b border-[#111113]/20 pb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                LEADERSHIP
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {LEADERSHIP_ROLES.map((l) => (
                  <li key={l.id}>
                    <strong>{l.role}</strong>, {l.organization}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono-tech border-b border-[#111113]/20 pb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
                COMPETITIVE RECOGNITION
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {AWARDS.map((a) => (
                  <li key={a.event}>
                    <strong>{a.rank}</strong>: {a.event}, {a.institution}
                    {a.scope ? ` (${a.scope})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-mono-tech border-b border-[#111113]/20 pb-1 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              CAPABILITIES
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              {CAPABILITIES.map((grp) => (
                <p key={grp.title}>
                  <strong>{grp.title}:</strong> {grp.items.join(', ')}
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
