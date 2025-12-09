"use client";

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ankweb_admin_authed';
const passwordFromEnv = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'true') setAuthed(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === passwordFromEnv) {
      setAuthed(true);
      setError('');
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      setError('Invalid admin password');
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="mt-2 text-sm text-zinc-500">Enter the admin password to access controls</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Password</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              autoFocus
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500"
          >
            Access Admin Panel
          </button>
        </form>
        <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500"><span className="font-semibold text-zinc-400">Default credentials:</span></p>
          <p className="text-xs text-zinc-400 mt-1">Password: <code className="bg-zinc-800 px-2 py-0.5 rounded text-purple-400">admin</code></p>
          <p className="text-xs text-zinc-600 mt-2">Override via NEXT_PUBLIC_ADMIN_PASSWORD environment variable</p>
        </div>
      </div>
    </div>
  );
}
