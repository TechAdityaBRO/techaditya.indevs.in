import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Mail, Send } from 'lucide-react';
import { MaskedReveal, OSPLY_EASE, RevealBlock } from './KineticText';
import { FloatingPlanesStage, TiltCard3D } from './MotionGraphics';
import type { SiteRoute } from './BroGangPage';
import { uiSound } from '../utils/sound';

const D1M_EMAIL = 'CharmenderCharmender6@gmail.com';
const ZAPDOS_URL = 'https://d1mstudios-brosoftware-join.oneapp.dev/';

const CAPABILITIES = [
  {
    num: '01 · Branding',
    title: 'Identity systems',
    desc: 'Logos, type systems, color, and rules that scale from favicon to billboard.',
  },
  {
    num: '02 · Motion',
    title: 'Motion design',
    desc: 'Cinematic intros, UI micro-interactions, and loops that feel alive.',
  },
  {
    num: '03 · 3D',
    title: '3D & renders',
    desc: 'Product renders, abstract visuals, and environments built from scratch.',
  },
  {
    num: '04 · UI',
    title: 'Interface design',
    desc: 'Clean, usable interfaces with personality — dark mode first.',
  },
  {
    num: '05 · Illustration',
    title: 'Custom illustration',
    desc: "One-off artwork and mascots built to fit a brand's voice.",
  },
  {
    num: '06 · Art Direction',
    title: 'Visual strategy',
    desc: 'The full picture — mood boards, direction, and final delivery.',
  },
];

interface ChatLine {
  role: 'bot' | 'user';
  text: string;
}

const INITIAL_CHAT: ChatLine[] = [
  { role: 'bot', text: 'Hi, I am ZAPDOS AI. How can I help you today?' },
  { role: 'user', text: 'What can you do?' },
  {
    role: 'bot',
    text: 'I search public web sources and answer with linked citations. Check the source before trusting any claim — accuracy matters.',
  },
];

export function D1mPage({ onNavigate }: { onNavigate: (route: SiteRoute) => void }) {
  const [copied, setCopied] = useState(false);
  const [chatLines, setChatLines] = useState<ChatLine[]>(INITIAL_CHAT);
  const [promptInput, setPromptInput] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(D1M_EMAIL);
      uiSound.play('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      uiSound.play('error');
    }
  };

  const handlePreviewAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const q = promptInput.trim();
    if (!q) return;
    uiSound.play('scan');
    setChatLines((prev) => [
      ...prev,
      { role: 'user', text: q },
      {
        role: 'bot',
        text: `Live web search & linked citations run on the full Zapdos AI app. Open ${ZAPDOS_URL} to run "${q}" across live public sources.`,
      },
    ]);
    setPromptInput('');
  };

  return (
    <div className="min-h-screen bg-[#060608] text-[#F4F4F6]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <FloatingPlanesStage />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-14 pb-20 sm:pt-20">
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
              onNavigate('brogang');
            }}
            onMouseEnter={() => uiSound.play('hover')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#60A5FA] transition-colors hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
          >
            <span>Visit BRO GANG Studios</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-12 max-w-4xl">
          <MaskedReveal>
            <p className="text-sm font-medium text-[#60A5FA]">D1M Studios · Design with intent</p>
          </MaskedReveal>

          <div className="mt-4">
            <MaskedReveal delay={0.08}>
              <h1
                className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-[5.25rem] lg:leading-[1.02]"
                style={{ textWrap: 'balance' }}
              >
                Make it <span className="text-[#3B82F6]">Iconic</span>
              </h1>
            </MaskedReveal>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: OSPLY_EASE }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
          >
            D1M Studios is a <strong className="font-semibold text-zinc-200">graphic design</strong> and{' '}
            <strong className="font-semibold text-zinc-200">motion</strong> studio founded by{' '}
            <strong className="font-semibold text-zinc-200">Darshil</strong>. Every pixel is intentional. Every frame is a statement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: OSPLY_EASE }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#d1m-work"
              onClick={() => uiSound.play('click')}
              onMouseEnter={() => uiSound.play('hover')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              <span>See capabilities</span>
              <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#zapdos"
              onClick={() => uiSound.play('click')}
              onMouseEnter={() => uiSound.play('hover')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/14 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
            >
              <span>Explore Zapdos AI</span>
            </a>
          </motion.div>
        </div>
        </div>
      </section>

      {/* 01 · Capabilities */}
      <section id="d1m-work" className="mx-auto max-w-[1200px] border-t border-white/10 px-6 py-20">
        <div className="mb-10">
          <p className="font-mono text-xs text-zinc-400 tabular-nums">01 · Work</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">What we do</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap, idx) => (
            <RevealBlock key={cap.num} delay={idx * 0.05}>
              <TiltCard3D onMouseEnter={() => uiSound.play('hover')}>
                <article className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E12] p-6 transition-colors duration-200 hover:border-white/25">
                  <div>
                    <p className="font-mono text-xs text-[#60A5FA] tabular-nums">{cap.num}</p>
                    <h3 className="mt-3 font-display text-xl font-bold text-white">{cap.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">{cap.desc}</p>
                  </div>
                </article>
              </TiltCard3D>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* 02 · Zapdos AI */}
      <section id="zapdos" className="mx-auto max-w-[1200px] border-t border-white/10 px-6 py-20">
        <RevealBlock>
          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-white/10 bg-[#0E0E12] p-6 sm:p-8 lg:grid-cols-12">
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <p className="font-mono text-xs text-[#60A5FA]">02 · Research Assistant</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Zapdos AI
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  Built by <strong className="font-semibold text-white">BRO SOFTWARE × D1M Studios</strong>. A research assistant that searches public web sources and answers with linked citations — so you can check the source, every time.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span>Powered by BRO SOFTWARE</span>
                  <span aria-hidden="true">·</span>
                  <span>Public web search</span>
                  <span aria-hidden="true">·</span>
                  <span>Linked citations</span>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href={ZAPDOS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => uiSound.play('click')}
                  onMouseEnter={() => uiSound.play('hover')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                >
                  <span>Open Zapdos AI</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#060608] lg:col-span-6">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="font-mono text-xs text-zinc-300">zapdos-ai</span>
                <span className="font-mono text-[11px] text-emerald-400">Connected</span>
              </div>

              <div className="terminal-scroll flex-1 space-y-3 overflow-y-auto p-4 max-h-[260px]">
                {chatLines.map((line, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                      line.role === 'user'
                        ? 'ml-8 bg-[#2563EB]/20 text-white border border-[#3B82F6]/30'
                        : 'mr-8 bg-[#121218] text-zinc-300 border border-white/8'
                    }`}
                  >
                    {line.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handlePreviewAsk} className="flex items-center gap-2 border-t border-white/10 p-3">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Try a query preview..."
                  className="h-9 flex-1 rounded-md border border-white/10 bg-[#0E0E12] px-3 text-xs text-white placeholder:text-zinc-500 focus:border-[#3B82F6] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Preview query"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#2563EB] px-3 text-white transition-colors hover:bg-[#1D4ED8] shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </RevealBlock>
      </section>

      {/* 03 · Contact Darshil */}
      <section id="d1m-contact" className="mx-auto max-w-[1200px] border-t border-white/10 px-6 py-20">
        <RevealBlock>
          <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-8">
            <p className="font-mono text-xs text-zinc-400 tabular-nums">03 · Contact</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Get in touch with Darshil</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Reach Darshil directly for branding, motion design, 3D visuals, or D1M Studios collaborations.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${D1M_EMAIL}`}
                onClick={() => uiSound.play('click')}
                onMouseEnter={() => uiSound.play('hover')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
              >
                <Mail className="h-4 w-4" />
                <span>Email Darshil</span>
              </a>

              <button
                type="button"
                onClick={() => void handleCopy()}
                onMouseEnter={() => uiSound.play('hover')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/14 px-4 py-2.5 font-mono text-xs text-zinc-200 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied address</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{D1M_EMAIL}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </RevealBlock>
      </section>
    </div>
  );
}
