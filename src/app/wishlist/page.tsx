"use client";

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/components/wishlist-context';
import { useCart } from '@/components/cart-context';
import { ProductGrid } from '@/components/product-grid';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-white/20" />
          <h1 className="mt-4 text-3xl font-bold text-white">Your wishlist is empty</h1>
          <p className="mt-2 text-white/60">
            Browse our services and save your favorites for later
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-lilac to-orchid px-6 py-3 font-semibold text-white shadow-lg shadow-lilac/30 transition hover:brightness-110"
          >
            <ShoppingBag className="h-5 w-5" />
            Browse Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
        <p className="mt-2 text-white/70">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <ProductGrid products={wishlist} />
    </main>
  );
}
