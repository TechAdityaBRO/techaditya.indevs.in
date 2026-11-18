interface PagesContext {
  request: Request;
  params: {
    username?: string;
  };
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const username = String(context.params.username || '').trim();
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return Response.json({ error: 'Invalid GitHub username' }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TechAditya-Portfolio',
    };

    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        signal: AbortSignal.timeout(7000),
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`, {
        headers,
        signal: AbortSignal.timeout(7000),
      }),
    ]);

    if (!profileRes.ok) {
      throw new Error(`GitHub profile API returned ${profileRes.status}`);
    }

    const profile = (await profileRes.json()) as Record<string, unknown>;
    const rawRepos = reposRes.ok ? ((await reposRes.json()) as Array<Record<string, unknown>>) : [];

    const languageCounts = new Map<string, number>();
    const repos = rawRepos
      .filter((r) => !r.fork)
      .slice(0, 6)
      .map((r) => {
        if (typeof r.language === 'string' && r.language) {
          languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
        }
        return {
          name: r.name,
          description: r.description,
          url: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          updatedAt: r.updated_at,
        };
      });

    for (const r of rawRepos.slice(6)) {
      if (typeof r.language === 'string' && r.language) {
        languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1);
      }
    }

    const totalLangRepos = Array.from(languageCounts.values()).reduce((a, b) => a + b, 0) || 1;
    const languages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalLangRepos) * 100),
      }));

    return Response.json(
      {
        login: profile.login,
        name: profile.name || profile.login,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        htmlUrl: profile.html_url,
        publicRepos: Number(profile.public_repos ?? 0),
        followers: Number(profile.followers ?? 0),
        following: Number(profile.following ?? 0),
        createdAt: profile.created_at,
        languages,
        repos,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unable to fetch GitHub activity' },
      { status: 502 }
    );
  }
}
