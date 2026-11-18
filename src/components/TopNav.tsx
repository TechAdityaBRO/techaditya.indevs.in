import React from 'react';
import type { SiteRoute } from './BroGangPage';
import { GithubAuth } from './GithubAuth';
import { uiSound } from '../utils/sound';

interface TopNavProps {
  currentRoute: SiteRoute;
  onNavigate: (route: SiteRoute, hash?: string) => void;
}

export function TopNav({ currentRoute, onNavigate }: TopNavProps) {
  const handleSection = (hash: string) => {
    uiSound.play('click');
    onNavigate('home', hash);
  };

  const handleRoute = (route: SiteRoute) => {
    uiSound.play('switch');
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060608]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-6">
        <button
          type="button"
          onClick={() => handleRoute('home')}
          onMouseEnter={() => uiSound.play('hover')}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
        >
          Aditya
        </button>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
          <button
            type="button"
            onClick={() => handleSection('#work')}
            onMouseEnter={() => uiSound.play('hover')}
            className="group relative py-1 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
          >
            Work
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#3B82F6] transition-transform duration-200 group-hover:scale-x-100"
            />
          </button>

          <button
            type="button"
            onClick={() => handleSection('#osint')}
            onMouseEnter={() => uiSound.play('hover')}
            className="group relative py-1 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
          >
            OSINT
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#3B82F6] transition-transform duration-200 group-hover:scale-x-100"
            />
          </button>

          <button
            type="button"
            onClick={() => handleRoute('brogang')}
            onMouseEnter={() => uiSound.play('hover')}
            className={`group relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm ${
              currentRoute === 'brogang' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            BRO GANG
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[#3B82F6] transition-transform duration-200 ${
                currentRoute === 'brogang' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => handleRoute('d1m')}
            onMouseEnter={() => uiSound.play('hover')}
            className={`group relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm ${
              currentRoute === 'd1m' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            D1M
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[#3B82F6] transition-transform duration-200 ${
                currentRoute === 'd1m' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => handleSection('#contact')}
            onMouseEnter={() => uiSound.play('hover')}
            className="group relative py-1 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
          >
            Contact
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#3B82F6] transition-transform duration-200 group-hover:scale-x-100"
            />
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <GithubAuth />
          <button
            type="button"
            onClick={() => handleSection('#contact')}
            onMouseEnter={() => uiSound.play('hover')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060608]"
          >
            Get in touch
          </button>
        </div>
      </div>
    </header>
  );
}
