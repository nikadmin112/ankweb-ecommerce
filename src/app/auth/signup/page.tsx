"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName || !lastName || !password) {
      setError('First name, last name, and password are required');
      return;
    }
    try {
      await signup(firstName, lastName, email, password);
      router.push('/shop');
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 bg-black">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-purple-400" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-400">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-400">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-zinc-400">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-400">
              Password *
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
            Create account
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
