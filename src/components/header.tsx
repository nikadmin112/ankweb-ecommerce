"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useCart } from './cart-context';
import { useAuth } from './auth-context';
import { useWishlist } from './wishlist-context';
import { ThemeToggle } from './theme-toggle';
import { CurrencySelector } from './currency-selector';
import { useState } from 'react';

export function Header() {
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-zinc-800 shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/shop" className="flex items-center gap-3 group mx-auto md:mx-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-all group-hover:border-purple-500/50">
            <Image src="/logo.svg" alt="Ankita Sharma" width={40} height={40} className="object-contain" />
          </div>
          <span className="text-2xl font-semibold tracking-wide text-white golden-outline-glow" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Ankita Sharma
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/shop" className="text-sm font-medium text-zinc-300 transition hover:text-white">
            Shop
          </Link>
          <Link href="/orders" className="text-sm font-medium text-zinc-300 transition hover:text-white">
            Orders
          </Link>
          <Link href="/wishlist" className="relative text-sm font-medium text-zinc-300 transition hover:text-white">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative text-sm font-medium text-zinc-300 transition hover:text-white">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <CurrencySelector />
          <ThemeToggle />
          {user ? (
            <div className="relative group">
              <button
                className="flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white"
                title={`${user.firstName} ${user.lastName}`}
              >
                <User className="h-5 w-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium text-zinc-300 transition hover:text-white">
              <User className="h-5 w-5" />
            </Link>
          )}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-purple-500 border border-purple-500"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative text-white md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          {itemCount > 0 && !menuOpen && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lilac text-xs font-semibold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-white transition hover:bg-white/10"
            >
              Shop
            </Link>
            <Link
              href="/orders"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-white transition hover:bg-white/10"
            >
              Orders
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-white transition hover:bg-white/10"
            >
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-white transition hover:bg-white/10"
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {itemCount} items
                </span>
              )}
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left text-white transition hover:bg-white/10"
              >
                Sign Out ({user.firstName})
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-white transition hover:bg-white/10"
              >
                Sign In
              </Link>
            )}
            <div className="rounded-lg border-t border-white/20 pt-3 mt-3">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-white">Theme</span>
                <ThemeToggle />
              </div>
            </div>
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-purple-600 px-3 py-2 text-white transition hover:bg-purple-500 border border-purple-500 font-medium"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
