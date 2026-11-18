import React, { useEffect, useState } from 'react';
import { Github, LogOut, User, Globe, ChevronDown, Check } from 'lucide-react';
import { auth, googleProvider, githubProvider, db, handleFirestoreError } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { uiSound } from '../utils/sound';

export function GithubAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || '',
            provider: firebaseUser.providerData[0]?.providerId || 'password',
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(),
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, 'write', `users/${firebaseUser.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (providerType: 'google' | 'github') => {
    uiSound.play('click');
    setLoadingProvider(providerType);
    setErrorMsg(null);
    setIsOpen(false);
    try {
      const provider = providerType === 'google' ? googleProvider : githubProvider;
      await signInWithPopup(auth, provider);
      uiSound.play('success');
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed');
      uiSound.play('switch');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleLogout = async () => {
    uiSound.play('switch');
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Signout error:', err);
    }
  };

  if (user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            uiSound.play('click');
            setIsOpen(!isOpen);
          }}
          onMouseEnter={() => uiSound.play('hover')}
          className="flex items-center gap-2.5 rounded-xl border border-white/14 bg-[#14141C] px-3.5 py-1.5 shadow-md hover:border-white/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="h-6 w-6 rounded-full border border-white/20 object-cover" />
          ) : (
            <User className="h-4 w-4 text-zinc-300" />
          )}
          <span className="text-xs font-medium text-white max-w-[100px] truncate font-mono">{user.displayName || user.email}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-[#0E0E12]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-xs font-semibold text-white truncate">{user.displayName || 'Authenticated User'}</p>
              <p className="text-[10px] font-mono text-zinc-400 truncate">{user.email}</p>
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400">
                <Check className="h-2.5 w-2.5" />
                <span>Connected via Firebase</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={() => uiSound.play('hover')}
              className="mt-2 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            uiSound.play('click');
            setIsOpen(!isOpen);
          }}
          onMouseEnter={() => uiSound.play('hover')}
          disabled={loadingProvider !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-[#14141C] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        >
          <Github className="h-3.5 w-3.5 text-[#38BDF8]" />
          <span>{loadingProvider ? 'Signing in...' : 'Sign In'}</span>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-[#0E0E12]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
          <p className="px-3 py-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-white/10">Select Provider</p>
          
          <button
            type="button"
            onClick={() => handleLogin('github')}
            onMouseEnter={() => uiSound.play('hover')}
            className="mt-1.5 w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Github className="h-4 w-4 text-white" />
            <span>GitHub Auth</span>
          </button>

          <button
            type="button"
            onClick={() => handleLogin('google')}
            onMouseEnter={() => uiSound.play('hover')}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Globe className="h-4 w-4 text-blue-400" />
            <span>Google Auth</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-red-500/30 bg-red-950/80 p-2 text-[11px] text-red-200 z-50 backdrop-blur-md">
          <p className="font-semibold">Authentication Error</p>
          <p className="mt-0.5 text-[10px] opacity-90">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
