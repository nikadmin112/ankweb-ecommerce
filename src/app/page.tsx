"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fading'>('hidden');

  useEffect(() => {
    const enter = setTimeout(() => setPhase('visible'), 30);
    const exit = setTimeout(() => setPhase('fading'), 1700);
    const nav = setTimeout(() => router.push('/shop'), 2400);

    return () => {
      clearTimeout(enter);
      clearTimeout(exit);
      clearTimeout(nav);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-radiant px-4 sm:px-6">
      <div
        className={`relative flex w-full max-w-xl flex-col items-center gap-4 text-center transition-opacity duration-700 ${
          phase === 'hidden' ? 'opacity-0' : phase === 'visible' ? 'opacity-100 fade-in' : 'opacity-0 fade-out'
        }`}
      >
        <div className="absolute -inset-16 bg-purple-500/20 blur-3xl" aria-hidden />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl shadow-purple-500/30 backdrop-blur">
            <Image src="/logo.svg" alt="Ankita Sharma" width={120} height={120} priority className="animate-float" />
          </div>
          <div className="space-y-3">
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60">Welcome to</p>
            <h1 className="bg-gradient-to-r from-white via-lilac to-white bg-clip-text text-3xl sm:text-4xl md:text-5xl font-bold text-transparent">
              Ankita Sharma
            </h1>
            <p className="text-sm sm:text-base text-white/70">Curated services, crafted for your growth.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
