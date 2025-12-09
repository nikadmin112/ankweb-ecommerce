"use client";

import { CartProvider } from '@/components/cart-context';
import { AuthProvider } from '@/components/auth-context';
import { WishlistProvider } from '@/components/wishlist-context';
import { CurrencyProvider } from '@/components/currency-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
