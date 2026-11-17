import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Layers, X } from 'lucide-react';
import type { FeaturedProject } from '../data/portfolio';
import { OSPLY_EASE } from './KineticText';
import { uiSound } from '../utils/sound';

interface ProjectModalProps {
  project: FeaturedProject | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    if (project) {
      uiSound.play('modalOpen');
    }
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        uiSound.play('modalClose');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, onClose]);

  if (!project) return null;

  const handleClose = () => {
    uiSound.play('modalClose');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: OSPLY_EASE }}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0E0E12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{project.year}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close project details"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="relative aspect-[4/3] md:aspect-auto md:col-span-5 bg-[#13131A]">
            {!imgError ? (
              <img
                src={project.image}
                alt={project.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#16161F] to-[#0A0A0F] p-6 text-center">
                <Layers className="h-8 w-8 text-[#3B82F6]" />
                <span className="font-display text-base font-semibold text-white">{project.title}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-7 md:col-span-7">
            <div>
              <h3 id="modal-project-title" className="font-display text-2xl font-bold tracking-tight text-white">
                {project.title}
              </h3>
              <p className="mt-1.5 text-xs font-mono text-zinc-400">{project.stack}</p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">{project.summary}</p>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h4 className="text-xs font-semibold tracking-wide text-zinc-400">Architecture & Highlights</h4>
                <ul className="mt-3 space-y-2.5 text-sm text-zinc-300">
                  {project.architecture.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 font-mono text-xs text-[#60A5FA] tabular-nums">0{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              >
                Close
              </button>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => uiSound.play('click')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
              >
                <span>Open live project</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
