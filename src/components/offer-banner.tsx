import { MegaphoneIcon } from 'lucide-react';

export function OfferBanner({ message }: { message: string }) {
  return (
    <div className="glow-border relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-lg">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-pink-500/15" aria-hidden />
      <div className="relative z-10 flex items-center gap-2">
        <MegaphoneIcon className="h-4 w-4 text-lilac" aria-hidden />
        <p className="text-white/80">{message}</p>
      </div>
    </div>
  );
}
