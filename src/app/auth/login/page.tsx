"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
      return;
    }
    
    // Redirect based on user type
    router.push('/shop');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 bg-black">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-purple-400" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Sign in to your account</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 transition">
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type={email.toLowerCase() === 'admin' ? 'text' : 'email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500"
          >
            Sign in
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/checkout"
            className="text-sm text-zinc-500 underline-offset-4 transition hover:text-white hover:underline"
          >
            Continue as guest
          </Link>
        </div>
      </div>
    </main>
  );
}
