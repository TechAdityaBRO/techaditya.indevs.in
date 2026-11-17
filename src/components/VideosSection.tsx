import React, { useState } from 'react';
import { Film, Play } from 'lucide-react';
import { VIDEOS } from '../data/portfolio';
import { uiSound } from '../utils/sound';

export function VideosSection() {
  const [activeVideoIds, setActiveVideoIds] = useState<Record<string, boolean>>({});
  const [thumbStage, setThumbStage] = useState<Record<string, 'max' | 'hq' | 'fallback'>>({});

  const playVideo = (id: string) => {
    uiSound.play('click');
    setActiveVideoIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleThumbError = (id: string) => {
    setThumbStage((prev) => {
      const current = prev[id] || 'max';
      if (current === 'max') return { ...prev, [id]: 'hq' };
      return { ...prev, [id]: 'fallback' };
    });
  };

  return (
    <section id="videos" className="mx-auto max-w-[1200px] px-6 py-20 border-t border-white/10">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-zinc-400 tabular-nums">03 · Watch</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
            Demos &amp; Archives
          </h2>
        </div>
        <p className="max-w-md text-sm text-zinc-400">
          Short walkthroughs of terminal tools, speed utilities, and community builds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VIDEOS.map((video) => {
          const isPlaying = Boolean(activeVideoIds[video.id]);
          const stage = thumbStage[video.id] || 'max';
          const thumbUrl =
            stage === 'max'
              ? `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
              : `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

          return (
            <article
              key={video.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0E0E12] transition-colors duration-200 hover:border-white/20"
            >
              <div className="relative aspect-video w-full bg-[#14141A]">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => playVideo(video.id)}
                    aria-label={`Play video: ${video.title}`}
                    className="group relative flex h-full w-full items-center justify-center overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                  >
                    {stage !== 'fallback' ? (
                      <img
                        src={thumbUrl}
                        alt={video.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => handleThumbError(video.id)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#171722] to-[#0A0A0F] p-4">
                        <Film className="h-6 w-6 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-400">{video.title}</span>
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                    />
                    <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white transition-transform duration-200 group-hover:scale-110 group-hover:border-[#3B82F6] group-hover:bg-[#2563EB]">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="font-display text-base font-semibold text-white">{video.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{video.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  <span>{video.category}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
