"use client";

import { X, ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from './cart-context';
import toast from 'react-hot-toast';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-midnight p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Product info */}
          <div className="space-y-4">
            {product.badge && (
              <span className="inline-block rounded-full bg-lilac/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lilac">
                {product.badge}
              </span>
            )}
            <h2 className="text-3xl font-bold text-white">{product.name}</h2>
            <p className="text-2xl font-bold text-white">${product.price}</p>
            <p className="text-white/70">{product.description}</p>

            {product.fullDescription && (
              <p className="text-sm text-white/60">{product.fullDescription}</p>
            )}

            {product.category && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Category:</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/80">
                  {product.category}
                </span>
              </div>
            )}
          </div>

          {/* Right: Features and CTA */}
          <div className="space-y-6">
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-lilac" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-lilac to-orchid px-6 py-3 font-semibold text-white shadow-lg shadow-lilac/30 transition hover:brightness-110 disabled:opacity-70"
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to cart
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-lg border border-white/10 px-6 py-3 font-semibold text-white/80 transition hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
