import React, { useState, useEffect } from 'react';
import { Send, Check, AlertCircle, Mail, Copy } from 'lucide-react';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { uiSound } from '../utils/sound';
import { CONTACT_INFO } from '../data/portfolio';

export function ContactMessageForm() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      if (u) {
        if (u.displayName) setName(u.displayName);
        if (u.email) setEmail(u.email);
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Please sign in with Google or GitHub first to send a message.');
      uiSound.play('switch');
      return;
    }
    if (!message.trim()) return;

    uiSound.play('click');
    setStatus('sending');
    setErrorMsg(null);

    try {
      await addDoc(collection(db, 'contactMessages'), {
        id: 'msg_' + Date.now(),
        senderUid: currentUser.uid,
        name: name || currentUser.displayName || 'Anonymous',
        email: email || currentUser.email || 'no-email',
        message: message.trim(),
        createdAt: serverTimestamp(),
      });

      setStatus('success');
      setMessage('');
      uiSound.play('success');
    } catch (err) {
      const errInfo = handleFirestoreError(err, 'write', 'contactMessages');
      setStatus('error');
      setErrorMsg(errInfo.error);
      uiSound.play('switch');
    }
  };

  const handleCopyEmail = async () => {
    uiSound.play('click');
    try {
      await navigator.clipboard.writeText(CONTACT_INFO.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${CONTACT_INFO.email}`}
          onClick={() => uiSound.play('click')}
          onMouseEnter={() => uiSound.play('hover')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email Directly</span>
        </a>

        <button
          type="button"
          onClick={() => void handleCopyEmail()}
          onMouseEnter={() => uiSound.play('hover')}
          className="inline-flex items-center gap-2 rounded-lg border border-white/14 px-3.5 py-2 font-mono text-xs text-zinc-200 transition-colors hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
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

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-[#060608] p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white">Send Secure Message via Firebase</p>
          {currentUser ? (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Signed in as {currentUser.displayName || currentUser.email}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              Sign in above to send
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aditya"
              disabled={!currentUser}
              className="w-full rounded-lg border border-white/12 bg-[#121218] px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#3B82F6] focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aditya@indevs.in"
              disabled={!currentUser}
              className="w-full rounded-lg border border-white/12 bg-[#121218] px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#3B82F6] focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Let's build something cinematic..."
            disabled={!currentUser}
            className="w-full rounded-lg border border-white/12 bg-[#121218] px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#3B82F6] focus:outline-none disabled:opacity-50 resize-none"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-500/30 p-2.5 text-[11px] text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 p-2.5 text-[11px] text-emerald-300">
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Message successfully sent and persisted to Firestore!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!currentUser || status === 'sending'}
          onMouseEnter={() => uiSound.play('hover')}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#3B82F6] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{status === 'sending' ? 'Transmitting...' : 'Send Message to Firestore'}</span>
        </button>
      </form>
    </div>
  );
}
