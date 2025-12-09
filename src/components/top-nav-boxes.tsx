"use client";

import Link from 'next/link';
import { ShoppingBag, Video, Users } from 'lucide-react';

export function TopNavBoxes() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/shop"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 transition-all hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30"
      >
        <ShoppingBag className="h-5 w-5 text-purple-400" />
        <span className="text-sm font-semibold text-white sm:text-base">Shop</span>
      </Link>
      
      <Link
        href="/media"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 transition-all hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30"
      >
        <Video className="h-5 w-5 text-purple-400" />
        <span className="text-sm font-semibold text-white sm:text-base">Media</span>
      </Link>
      
      <Link
        href="/social"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 transition-all hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30"
      >
        <Users className="h-5 w-5 text-purple-400" />
        <span className="text-sm font-semibold text-white sm:text-base">Social</span>
      </Link>
    </div>
  );
}
