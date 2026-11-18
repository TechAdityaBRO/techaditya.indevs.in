import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Layers,
  Mail,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TopNav } from './components/TopNav';
import { ProjectModal } from './components/ProjectModal';
import { OsintWorkbench } from './components/OsintWorkbench';
import { VideosSection } from './components/VideosSection';
import { GithubActivity } from './components/GithubActivity';
import { BroGangPage, type SiteRoute } from './components/BroGangPage';
import { D1mPage } from './components/D1mPage';
import { MaskedReveal, OSPLY_EASE, RevealBlock, ScrollProgressBar } from './components/KineticText';
import { EditorialMarquee, TiltCard3D } from './components/MotionGraphics';
import { uiSound } from './utils/sound';
import {
  ALL_PROJECTS,
  CONTACT_INFO,
  FEATURED_PROJECTS,
  HERO_MEDIA,
  KEY_METRICS,
  type FeaturedProject,
} from './data/portfolio';

const HeroScene3D = lazy(() =>
  import('./components/HeroScene3D').then((m) => ({ default: m.HeroScene3D }))
);

function parseRouteFromPath(pathname: string): SiteRoute {
  const clean = pathname.toLowerCase();
  if (clean.includes('brogang')) return 'brogang';
  if (clean.includes('d1m')) return 'd1m';
  return 'home';
}

function pathForRoute(route: SiteRoute): string {
  if (route === 'brogang') return '/brogang';
  if (route === 'd1m') return '/d1m';
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<SiteRoute>(() =>
    typeof window !== 'undefined' ? parseRouteFromPath(window.location.pathname) : 'home'
  );
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);
  const [failedCards, setFailedCards] = useState<Record<string, boolean>>({});
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => uiSound.isEnabled());

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextRoute: SiteRoute, hash?: string) => {
    const targetPath = pathForRoute(nextRoute);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', hash ? `${targetPath}${hash}` : targetPath);
    }
    setRoute(nextRoute);

    if (hash && nextRoute === 'home') {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 90);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSound = () => {
    const next = uiSound.toggle();
    setSoundEnabled(next);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.email);
      uiSound.play('success');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      uiSound.play('error');
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="min-h-screen bg-[#060608] text-[#F4F4F6]">
        <ScrollProgressBar />
        <TopNav currentRoute={route} onNavigate={navigate} />

        <AnimatePresence mode="wait">
          {route === 'brogang' ? (
            <motion.main
              key="route-brogang"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: OSPLY_EASE }}
            >
              <BroGangPage onNavigate={navigate} />
            </motion.main>
          ) : route === 'd1m' ? (
            <motion.main
              key="route-d1m"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: OSPLY_EASE }}
            >
              <D1mPage onNavigate={navigate} />
            </motion.main>
          ) : (
            <motion.main
              key="route-home"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: OSPLY_EASE }}
            >
              {/* Split-Screen Editorial Hero with Interactive 3D Core */}
              <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 sm:pt-16">
                <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
                  <div className="flex flex-col justify-between lg:col-span-6 lg:py-4">
                    <div>
                      <MaskedReveal>
                        <p className="text-sm font-medium text-[#60A5FA]">
                          Aditya Kumar Sethi · Founder of BRO GANG
                        </p>
                      </MaskedReveal>

                      <div className="mt-4">
                        <MaskedReveal delay={0.08}>
                          <h1
                            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.06]"
                            style={{ textWrap: 'balance' }}
                          >
                            Building fast tools for the open web.
                          </h1>
                        </MaskedReveal>
                      </div>

                      <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.16, ease: OSPLY_EASE }}
                        className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400"
                      >
                        I engineer lightweight desktop browsers like{' '}
                        <strong className="font-semibold text-zinc-200">PGlove</strong>, zero-friction
                        terminal agents like{' '}
                        <strong className="font-semibold text-zinc-200">Bro Gang AI CLI</strong>, and
                        privacy-first search engines like{' '}
                        <strong className="font-semibold text-zinc-200">Nexa Search</strong>.
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.24, ease: OSPLY_EASE }}
                      className="mt-10 flex flex-wrap items-center gap-3.5"
                    >
                      <a
                        href="#work"
                        onClick={() => uiSound.play('click')}
                        onMouseEnter={() => uiSound.play('hover')}
                        className="group inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
                      >
                        <span>Explore selected work</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </a>
                      <a
                        href={CONTACT_INFO.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => uiSound.play('click')}
                        onMouseEnter={() => uiSound.play('hover')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/14 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors duration-150 hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                      >
                        <span>GitHub</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={toggleSound}
                        onMouseEnter={() => uiSound.play('hover')}
                        aria-pressed={soundEnabled}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-3 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                      >
                        {soundEnabled ? (
                          <>
                            <Volume2 className="h-4 w-4 text-[#60A5FA]" />
                            <span>Sound on</span>
                          </>
                        ) : (
                          <>
                            <VolumeX className="h-4 w-4 text-zinc-500" />
                            <span>Sound muted</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.72, delay: 0.1, ease: OSPLY_EASE }}
                    className="min-h-[380px] lg:col-span-6"
                  >
                    <Suspense
                      fallback={
                        <div className="relative h-full min-h-[380px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E12]">
                          <img
                            src={HERO_MEDIA.image}
                            alt={HERO_MEDIA.alt}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      }
                    >
                      <HeroScene3D />
                    </Suspense>
                  </motion.div>
                </div>

                {/* Full-width 4-column metric strip */}
                <RevealBlock delay={0.12}>
                  <div className="mt-12 grid grid-cols-2 gap-6 border-t border-b border-white/10 py-6 sm:grid-cols-4">
                    {KEY_METRICS.map((metric) => (
                      <div key={metric.label}>
                        <div className="font-mono text-2xl font-semibold text-white sm:text-3xl tabular-nums">
                          {metric.value}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </RevealBlock>
              </section>

              <EditorialMarquee />

              {/* 01 · Selected Work */}
              <section id="work" className="mx-auto max-w-[1200px] px-6 py-20">
                <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-zinc-400 tabular-nums">01 · Selected Work</p>
                    <MaskedReveal>
                      <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
                        Flagship Builds
                      </h2>
                    </MaskedReveal>
                  </div>
                  <p className="max-w-md text-sm text-zinc-400">
                    Click any project card to inspect its architecture notes, or launch the live build directly.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {FEATURED_PROJECTS.map((project, idx) => {
                    const imgBroken = Boolean(failedCards[project.id]);
                    return (
                      <RevealBlock key={project.id} delay={idx * 0.06}>
                        <TiltCard3D onMouseEnter={() => uiSound.play('hover')}>
                          <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E12] transition-colors duration-200 hover:border-white/22">
                          <button
                            type="button"
                            onClick={() => setSelectedProject(project)}
                            aria-label={`Inspect ${project.title} project details`}
                            className="relative aspect-[16/10] w-full overflow-hidden bg-[#14141A] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                          >
                            {!imgBroken ? (
                              <img
                                src={project.image}
                                alt={project.imageAlt}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setFailedCards((prev) => ({ ...prev, [project.id]: true }))
                                }
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#171722] to-[#0A0A0F]">
                                <Layers className="h-7 w-7 text-[#3B82F6]" />
                                <span className="font-display text-sm font-semibold text-white">
                                  {project.title}
                                </span>
                              </div>
                            )}
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"
                            />
                          </button>

                          <div className="flex flex-1 flex-col justify-between p-6">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <span>{project.category}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">{project.year}</span>
                              </div>

                              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
                                {project.title}
                              </h3>
                              <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                                {project.summary}
                              </p>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                              <span className="font-mono text-xs text-zinc-500">{project.stack}</span>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedProject(project)}
                                  className="text-xs font-medium text-zinc-300 transition-colors hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm"
                                >
                                  Architecture
                                </button>
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => uiSound.play('click')}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#60A5FA] transition-colors hover:text-white whitespace-nowrap shrink-0"
                                >
                                  <span>Visit</span>
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </article>
                        </TiltCard3D>
                      </RevealBlock>
                    );
                  })}
                </div>

                {/* Clean Project Directory Table */}
                <RevealBlock delay={0.1}>
                  <div className="mt-14">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-white">Complete Project Index</h3>
                      <span className="font-mono text-xs text-zinc-500 tabular-nums">
                        {ALL_PROJECTS.length} live deployments
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E0E12]">
                      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-xs text-zinc-400">
                            <th className="px-6 py-3.5 font-medium">Project</th>
                            <th className="px-6 py-3.5 font-medium">Focus</th>
                            <th className="px-6 py-3.5 font-medium">Summary</th>
                            <th className="px-6 py-3.5 font-medium text-right">URL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/8">
                          {ALL_PROJECTS.map((proj) => (
                            <tr
                              key={proj.name}
                              onMouseEnter={() => uiSound.play('hover')}
                              className="transition-colors hover:bg-white/[0.02]"
                            >
                              <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                {proj.name}
                              </td>
                              <td className="px-6 py-4 text-xs text-zinc-400 whitespace-nowrap">
                                {proj.category}
                              </td>
                              <td className="px-6 py-4 text-zinc-300">{proj.description}</td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <a
                                  href={proj.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => uiSound.play('click')}
                                  className="inline-flex items-center gap-1 font-mono text-xs text-[#60A5FA] hover:underline"
                                >
                                  <span>{proj.displayUrl}</span>
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </RevealBlock>
              </section>

              {/* 02 · Interactive OSINT Workbench */}
              <RevealBlock>
                <OsintWorkbench />
              </RevealBlock>

              {/* 03 · Videos */}
              <RevealBlock>
                <VideosSection />
              </RevealBlock>

              {/* 04 · Live GitHub Activity */}
              <RevealBlock>
                <GithubActivity />
              </RevealBlock>

              {/* 05 · Collab & Contact */}
              <section id="contact" className="mx-auto max-w-[1200px] px-6 py-20 border-t border-white/10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <RevealBlock className="lg:col-span-7">
                    <div className="h-full rounded-2xl border border-white/10 bg-[#0E0E12] p-8">
                      <p className="font-mono text-xs text-zinc-400 tabular-nums">05 · Contact</p>
                      <h2
                        className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                        style={{ textWrap: 'balance' }}
                      >
                        Open to collabs, experimental builds, and anything that ships.
                      </h2>
                      <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
                        Reach out directly for collaborations, BRO GANG community partnerships, or open-source software ideas.
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-3">
                        <a
                          href={`mailto:${CONTACT_INFO.email}`}
                          onClick={() => uiSound.play('click')}
                          onMouseEnter={() => uiSound.play('hover')}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Email Aditya</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => void handleCopyEmail()}
                          onMouseEnter={() => uiSound.play('hover')}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/14 px-4 py-2.5 font-mono text-xs text-zinc-200 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Copied address</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-zinc-400" />
                              <span>{CONTACT_INFO.email}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </RevealBlock>

                  <RevealBlock delay={0.08} className="lg:col-span-5">
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E12] p-8">
                      <div>
                        <p className="text-xs font-medium text-[#60A5FA]">Studio Partnership</p>
                        <h3 className="mt-2 font-display text-xl font-bold text-white">
                          BRO GANG Studios × D1M Studios
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                          Collaborating with <strong className="font-medium text-zinc-200">Darshil</strong> at D1M Studios — where visual design meets fast systems engineering.
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              uiSound.play('switch');
                              navigate('brogang');
                            }}
                            onMouseEnter={() => uiSound.play('hover')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/14 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/5 whitespace-nowrap shrink-0"
                          >
                            <span>BRO GANG site</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              uiSound.play('switch');
                              navigate('d1m');
                            }}
                            onMouseEnter={() => uiSound.play('hover')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/14 px-3.5 py-2 text-xs font-semibold text-[#60A5FA] transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
                          >
                            <span>D1M Studios site</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-white/10 pt-6">
                        <p className="text-xs text-zinc-500">Elsewhere online</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-zinc-300">
                          <a
                            href={CONTACT_INFO.discord}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => uiSound.play('click')}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <span>Discord</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                          </a>
                          <a
                            href={CONTACT_INFO.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => uiSound.play('click')}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <span>GitHub</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                          </a>
                          <a
                            href={CONTACT_INFO.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => uiSound.play('click')}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <span>X</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                          </a>
                          <a
                            href={CONTACT_INFO.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => uiSound.play('click')}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <span>Instagram</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </RevealBlock>
                </div>
              </section>
            </motion.main>
          )}
        </AnimatePresence>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} Aditya Kumar Sethi</span>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={toggleSound}
                className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{soundEnabled ? 'Sound On' : 'Sound Muted'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  uiSound.play('switch');
                  navigate('brogang');
                }}
                className="hover:text-zinc-300 transition-colors"
              >
                BRO GANG Studios
              </button>
              <button
                type="button"
                onClick={() => {
                  uiSound.play('switch');
                  navigate('d1m');
                }}
                className="hover:text-zinc-300 transition-colors"
              >
                D1M Studios
              </button>
              <a
                href={CONTACT_INFO.brogangGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>

        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      </div>
    </MotionConfig>
  );
}
