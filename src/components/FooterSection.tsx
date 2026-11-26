import { useState } from 'react';
import { ArrowUpRight, Check, Copy, FileText, Mail } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { RoutePath } from '../types/portfolio';

interface FooterSectionProps {
  onNavigate: (route: RoutePath) => void;
}

export function FooterSection({ onNavigate }: FooterSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <footer className="border-t border-[#111113]/15 bg-[#111113] text-[#F3EFE6]">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="font-mono-tech mb-3 text-xs font-bold tracking-widest text-[#D9381E] uppercase">
              CONTACT · NO 42-SLIDE DECK REQUIRED
            </p>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase [text-wrap:balance]">
              LET&apos;S MAKE SOMETHING
              <span className="block text-[#D9381E]">WORTH REMEMBERING.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#F3EFE6]/75">
              Have an interesting idea, a challenging brief, or an opportunity worth discussing?
              I&apos;m always up for a good conversation.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-4">
            <a
              href={`mailto:${PROFILE.email}`}
              data-cursor="MAIL"
              className="group flex items-center justify-between bg-[#D9381E] px-5 py-4 text-xs font-bold tracking-widest text-[#F3EFE6] uppercase transition-colors hover:bg-[#F3EFE6] hover:text-[#111113]"
            >
              <span className="inline-flex items-center gap-2.5">
                <Mail className="h-4 w-4" />
                EMAIL KRISH
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <button
              type="button"
              onClick={() => void handleCopyEmail()}
              className="flex cursor-pointer items-center justify-between border border-[#F3EFE6]/20 px-5 py-3 text-left text-xs font-medium text-[#F3EFE6] transition-colors hover:border-[#D9381E]"
            >
              <span className="font-mono-tech truncate">{PROFILE.email}</span>
              <span className="font-mono-tech ml-2 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-[#D9381E] uppercase">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-[#F3EFE6]/20 px-4 py-3 text-xs font-bold tracking-wider uppercase transition-colors hover:border-[#D9381E] hover:text-[#D9381E]"
              >
                <span>LINKEDIN</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => onNavigate('/resume')}
                className="flex cursor-pointer items-center justify-between border border-[#F3EFE6]/20 px-4 py-3 text-xs font-bold tracking-wider uppercase transition-colors hover:border-[#D9381E] hover:text-[#D9381E]"
              >
                <span>RESUME</span>
                <FileText className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F3EFE6]/12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <div className="font-mono-tech flex flex-wrap items-center gap-x-5 gap-y-2 text-xs tracking-widest uppercase">
            <span className="font-bold text-[#F3EFE6]">{PROFILE.name}</span>
            <span className="text-[#F3EFE6]/40">·</span>
            <span className="text-[#F3EFE6]/70">BENGALURU, INDIA</span>
            <span className="text-[#F3EFE6]/40">·</span>
            <span className="tabular-nums text-[#D9381E]">{PROFILE.year}</span>
          </div>

          <div className="font-mono-tech flex items-center gap-5 text-[11px] tracking-wider text-[#F3EFE6]/60 uppercase">
            <button type="button" onClick={() => onNavigate('/work')} className="cursor-pointer hover:text-[#F3EFE6]">
              Work
            </button>
            <button type="button" onClick={() => onNavigate('/about')} className="cursor-pointer hover:text-[#F3EFE6]">
              About
            </button>
            <button type="button" onClick={() => onNavigate('/experiments')} className="cursor-pointer hover:text-[#F3EFE6]">
              Experiments
            </button>
            <button type="button" onClick={() => onNavigate('/contact')} className="cursor-pointer hover:text-[#F3EFE6]">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
