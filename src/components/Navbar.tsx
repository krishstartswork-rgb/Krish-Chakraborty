import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { RoutePath } from '../types/portfolio';

interface NavbarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
}

const NAV_LINKS: { label: string; route: RoutePath }[] = [
  { label: 'WORK', route: '/work' },
  { label: 'ABOUT', route: '/about' },
  { label: 'EXPERIMENTS', route: '/experiments' },
  { label: 'CONTACT', route: '/contact' },
];

export function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (route: RoutePath) => {
    setMobileOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#111113]/15 bg-[#F3EFE6]/95 text-[#111113]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-5 sm:px-8 lg:px-12">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('/')}
          className="font-display cursor-pointer text-xl font-bold tracking-tight uppercase whitespace-nowrap shrink-0 transition-colors hover:text-[#D9381E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9381E] sm:text-2xl"
        >
          KRISH CHAKRABORTY
        </button>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => {
            const active =
              currentRoute === item.route ||
              (item.route === '/work' && currentRoute.startsWith('/work'));
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNav(item.route)}
                className={`font-mono-tech relative cursor-pointer py-1 text-xs font-semibold tracking-widest uppercase whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9381E] ${
                  active ? 'text-[#D9381E]' : 'text-[#111113]/75 hover:text-[#111113]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#D9381E]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('/resume')}
            className="font-mono-tech hidden md:inline-flex cursor-pointer items-center bg-[#111113] px-4 py-2 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase whitespace-nowrap shrink-0 transition-colors hover:bg-[#D9381E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9381E]"
          >
            RESUME
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center border border-[#111113]/25 md:hidden"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#111113]/15 bg-[#111113] px-5 py-6 text-[#F3EFE6] md:hidden">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="font-display py-2.5 text-left text-3xl uppercase tracking-tight hover:text-[#D9381E]"
            >
              HOME
            </button>
            {NAV_LINKS.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNav(item.route)}
                className="font-display py-2.5 text-left text-3xl uppercase tracking-tight hover:text-[#D9381E]"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNav('/resume')}
              className="font-mono-tech mt-3 inline-flex w-full items-center justify-center bg-[#D9381E] px-4 py-3 text-xs font-bold tracking-wider text-[#F3EFE6] uppercase"
            >
              VIEW &amp; DOWNLOAD RESUME
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
