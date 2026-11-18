import React, { useEffect, useState } from 'react';
import { Github, LogOut, User } from 'lucide-react';
import { uiSound } from '../utils/sound';

export interface GithubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export function GithubAuth() {
  const [user, setUser] = useState<GithubUser | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('techaditya_github_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleLogin = () => {
    uiSound.play('click');
    // Pure static client-side simulation or direct GitHub OAuth redirect
    const clientId = 'Iv1.demo_github_client_id';
    const redirectUri = `${window.location.origin}/`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    
    // Open popup or simulate demo login if popup blocked
    const authWindow = window.open(githubAuthUrl, 'github_oauth', 'width=600,height=700');
    if (!authWindow) {
      // Fallback demo user if popup blocked
      const demoUser: GithubUser = {
        login: 'TechAdityaBRO',
        name: 'Aditya Kumar Sethi',
        avatar_url: 'https://avatars.githubusercontent.com/u/273487397?v=4',
        html_url: 'https://github.com/TechAdityaBRO',
        public_repos: 12,
        followers: 48,
        following: 19,
      };
      setUser(demoUser);
      try {
        window.localStorage.setItem('techaditya_github_user', JSON.stringify(demoUser));
      } catch {
        // Ignore
      }
      uiSound.play('success');
    }
  };

  const handleLogout = () => {
    uiSound.play('switch');
    setUser(null);
    try {
      window.localStorage.removeItem('techaditya_github_user');
    } catch {
      // Ignore
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/12 bg-[#0E0E12] px-3.5 py-1.5 shadow-md">
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => uiSound.play('hover')}
          className="flex items-center gap-2 text-xs font-medium text-white hover:text-[#60A5FA] transition-colors"
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.login} className="h-6 w-6 rounded-full border border-white/20 object-cover" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="font-mono">{user.login}</span>
        </a>

        <div className="h-4 w-px bg-white/15" />

        <button
          type="button"
          onClick={handleLogout}
          onMouseEnter={() => uiSound.play('hover')}
          title="Sign out"
          className="text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      onMouseEnter={() => uiSound.play('hover')}
      className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-[#14141C] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
    >
      <Github className="h-3.5 w-3.5" />
      <span>Sign in with GitHub</span>
    </button>
  );
}
