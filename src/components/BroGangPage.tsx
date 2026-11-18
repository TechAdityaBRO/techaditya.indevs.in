import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { MaskedReveal, OSPLY_EASE, RevealBlock } from './KineticText';
import { TiltCard3D } from './MotionGraphics';
import { uiSound } from '../utils/sound';

export type SiteRoute = 'home' | 'brogang' | 'd1m';

const MANIFESTO_LINES = [
  { text: "We don't do roadmaps. We do ", strong: 'prototypes', suffix: '.' },
  { text: 'A working sketch beats a confident take. ', em: 'Every time.' },
  { text: 'A bad first draft beats a brilliant unwritten one.' },
  { text: 'Make 50 things. Throw away 47. Talk about the 3.' },
  { text: 'AI is an ', strong: 'amplifier', suffix: ', not an equalizer.' },
  { text: "If you're a spectator to your own output, you are not the author of your own output." },
  { text: 'Get your hands in. ', em: 'Ship or Die.' },
];

const BROGANG_PANELS = [
  {
    num: '01',
    title: 'PGlove Browser',
    desc: 'Experimental desktop browser built with Tauri 2 (Rust + WebView2). Lightweight, fast, and unapologetically different.',
    tag: 'Rust · Tauri 2 · WebView2',
    url: 'https://pglove.jo3.org',
  },
  {
    num: '02',
    title: 'Bro Gang AI CLI',
    desc: 'Free AI coding agent for your terminal. No API keys, no signup — powered by Llama 3.3 70B on Cloudflare Workers.',
    tag: 'TypeScript · Llama 3.3 70B',
    url: 'https://brogangaicli.pages.dev/',
  },
  {
    num: '03',
    title: 'Nexa Search',
    desc: 'Privacy-first search engine. No ads, no tracking pixels, no sold browsing history. Just the signal.',
    tag: 'JavaScript · Privacy',
    url: 'https://nexasearch.pages.dev/',
  },
  {
    num: '04',
    title: 'Pro AI',
    desc: 'Powered by Gemini 2.5 Pro. Chat, ask, explore — accessible intelligence built for the community.',
    tag: 'AI · Gemini 2.5 Pro',
    url: 'https://brogang.techaditya.workers.dev',
  },
];

const BROGANG_STATS = [
  { num: '2022', label: 'Founded' },
  { num: '38+', label: 'Members' },
  { num: '10+', label: 'Projects' },
  { num: '∞', label: 'Ship cycles' },
];

export function BroGangPage({ onNavigate }: { onNavigate: (route: SiteRoute) => void }) {
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackWrapRef,
    offset: ['start end', 'end start'],
  });
  const trackX = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '-14%']);

  return (
    <div className="min-h-screen bg-[#060608] text-[#F4F4F6]">
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 pt-14 pb-20 sm:pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              uiSound.play('switch');
              onNavigate('home');
            }}
            onMouseEnter={() => uiSound.play('hover')}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to portfolio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              uiSound.play('switch');
              onNavigate('d1m');
            }}
            onMouseEnter={() => uiSound.play('hover')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#60A5FA] transition-colors hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
          >
            <span>Visit D1M Studios</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-12 max-w-4xl">
          <MaskedReveal>
            <p className="text-sm font-medium text-[#60A5FA]">BRO GANG Studios · Shipping since 2022</p>
          </MaskedReveal>

          <div className="mt-4">
            <MaskedReveal delay={0.08}>
              <h1
                className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-[5.25rem] lg:leading-[1.02]"
                style={{ textWrap: 'balance' }}
              >
                Ship or <span className="text-[#3B82F6]">Die</span>
              </h1>
            </MaskedReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: OSPLY_EASE }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
          >
            We build <strong className="font-semibold text-zinc-200">experimental browsers</strong>,{' '}
            <strong className="font-semibold text-zinc-200">AI tools</strong>, and{' '}
            <strong className="font-semibold text-zinc-200">open-source software</strong>. No roadmap, no committees — just code that ships.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: OSPLY_EASE }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#brogang-projects"
              onClick={() => uiSound.play('click')}
              onMouseEnter={() => uiSound.play('hover')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              <span>See projects</span>
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/BRO-GANG"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => uiSound.play('click')}
              onMouseEnter={() => uiSound.play('hover')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/14 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
            >
              <span>BRO GANG GitHub</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-[1200px] border-t border-white/10 px-6 py-20">
        <p className="font-mono text-xs text-zinc-400 tabular-nums">01 · Studio Manifesto</p>
        <div className="mt-8 space-y-6">
          {MANIFESTO_LINES.map((line, index) => (
            <MaskedReveal key={index} delay={index * 0.04}>
              <p className="font-display text-2xl font-semibold tracking-tight text-zinc-300 sm:text-3xl lg:text-4xl lg:leading-tight">
                {line.text}
                {line.strong ? <strong className="font-extrabold text-white">{line.strong}</strong> : null}
                {line.em ? <em className="not-italic text-[#60A5FA]">{line.em}</em> : null}
                {line.suffix || null}
              </p>
            </MaskedReveal>
          ))}
        </div>
      </section>

      {/* Scroll-linked Shipped Projects Track */}
      <section
        id="brogang-projects"
        ref={trackWrapRef}
        className="overflow-hidden border-t border-white/10 py-20"
      >
        <div className="mx-auto max-w-[1200px] px-6 mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs text-zinc-400 tabular-nums">02 · Shipped Builds</p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
              What leaves the lab
            </h2>
          </div>
          <p className="text-sm text-zinc-400">Built fast, released publicly.</p>
        </div>

        <div className="mx-auto max-w-[1200px] px-6">
          <motion.div
            style={{ x: trackX }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {BROGANG_PANELS.map((panel, idx) => (
              <RevealBlock key={panel.num} delay={idx * 0.06}>
                <TiltCard3D onMouseEnter={() => uiSound.play('hover')}>
                  <a
                    href={panel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => uiSound.play('click')}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E12] p-6 transition-colors duration-200 hover:border-white/25"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#60A5FA] tabular-nums">{panel.num}</span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                      </div>
                      <h3 className="mt-4 font-display text-xl font-bold text-white">{panel.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{panel.desc}</p>
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-4 font-mono text-xs text-zinc-500">
                      {panel.tag}
                    </div>
                  </a>
                </TiltCard3D>
              </RevealBlock>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="mx-auto max-w-[1200px] border-t border-white/10 px-6 py-16">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {BROGANG_STATS.map((stat, idx) => (
            <RevealBlock key={stat.label} delay={idx * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-6">
                <div className="font-mono text-3xl font-bold text-white tabular-nums">{stat.num}</div>
                <div className="mt-1.5 text-xs text-zinc-400">{stat.label}</div>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>
    </div>
  );
}
