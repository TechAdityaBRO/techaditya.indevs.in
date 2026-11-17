import React, { useEffect, useState } from 'react';
import { ArrowUpRight, BookMarked, RefreshCw, Star, Users } from 'lucide-react';

interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
}

interface GithubLanguage {
  name: string;
  count: number;
  percent: number;
}

interface GithubProfileData {
  login: string;
  name: string;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  languages: GithubLanguage[];
  repos: GithubRepo[];
}

export function GithubActivity() {
  const [data, setData] = useState<GithubProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGithub = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/TechAdityaBRO');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Unable to load GitHub telemetry');
      }
      setData(json as GithubProfileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load GitHub telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGithub();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section id="activity" className="mx-auto max-w-[1200px] px-6 py-20 border-t border-white/10">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-zinc-400 tabular-nums">04 · GitHub</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
            Live Open-Source Activity
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void loadGithub()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <a
            href="https://github.com/TechAdityaBRO"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#60A5FA] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <span>@TechAdityaBRO</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-white/10 bg-[#0E0E12]" />
          ))}
        </div>
      ) : error && !data ? (
        <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-6 text-sm text-zinc-300">
          <p className="font-medium text-white">GitHub API temporarily unavailable</p>
          <p className="mt-1 text-zinc-400">{error}</p>
          <a
            href="https://github.com/TechAdityaBRO"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#60A5FA] hover:underline"
          >
            <span>View profile directly on GitHub</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E12] p-6 md:col-span-5">
              <div>
                <div className="flex items-center gap-3">
                  {data.avatarUrl ? (
                    <img
                      src={data.avatarUrl}
                      alt={data.name}
                      referrerPolicy="no-referrer"
                      className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                    />
                  ) : null}
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{data.name}</h3>
                    <p className="font-mono text-xs text-zinc-400">github.com/{data.login}</p>
                  </div>
                </div>
                {data.bio ? <p className="mt-4 text-sm text-zinc-300">{data.bio}</p> : null}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <BookMarked className="h-3.5 w-3.5" />
                    <span>Repos</span>
                  </div>
                  <p className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">
                    {data.publicRepos}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>Followers</span>
                  </div>
                  <p className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">
                    {data.followers}
                  </p>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Following</div>
                  <p className="mt-1 font-mono text-xl font-semibold text-white tabular-nums">
                    {data.following}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E12] p-6 md:col-span-7">
              <div>
                <h3 className="font-display text-base font-semibold text-white">Primary Languages</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Distribution across recent non-fork public repositories
                </p>

                <div className="mt-5 space-y-3.5">
                  {data.languages.length > 0 ? (
                    data.languages.map((lang) => (
                      <div key={lang.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-200">{lang.name}</span>
                          <span className="font-mono text-zinc-400 tabular-nums">{lang.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-[#3B82F6]"
                            style={{ width: `${Math.max(lang.percent, 6)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400">No language metadata reported.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.repos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E12] p-5 transition-colors duration-150 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-display text-base font-semibold text-white group-hover:text-[#60A5FA] transition-colors truncate">
                      {repo.name}
                    </h4>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-white" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {repo.description || 'Active repository under TechAdityaBRO.'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span>{repo.language || 'Code'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Star className="h-3 w-3" />
                      {repo.stars}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums">{formatDate(repo.updatedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
