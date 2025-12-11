"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/cart-context';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = Math.min(Math.max(rating - (i - 1), 0), 1);
    stars.push(
      <div key={i} className="relative h-4 w-4">
        <Star className="absolute h-4 w-4 text-zinc-700" fill="currentColor" />
        <div style={{ width: `${fill * 100}%` }} className="overflow-hidden absolute">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        </div>
      </div>
    );
  }
  return stars;
}

function calculateDiscount(price: number, discountPercent: number) {
  if (!discountPercent || discountPercent <= 0) {
    return { finalPrice: price, originalPrice: null, hasDiscount: false };
  }
  const finalPrice = Math.round(price * (1 - discountPercent / 100));
  return { finalPrice, originalPrice: price, hasDiscount: true };
}

export function ProductDetailClient({
  product,
  relatedProducts
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Breadcrumbs
        items={[
          { label: product.category || 'Products', href: '/shop' },
          { label: product.name }
        ]}
      />
      
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Product image */}
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl max-w-md mx-auto">
          {product.image && product.image.trim() !== '' ? (
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-zinc-900">
              <p className="text-zinc-600">No image available</p>
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="space-y-6">
          {product.badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/20 border border-purple-500/50 px-3 py-1 text-xs font-semibold text-purple-400">
              <Star className="h-3 w-3" />
              {product.badge}
            </span>
          )}

          <div>
            <h1 className="text-4xl font-bold text-white">{product.name}</h1>
            {product.category && (
              <p className="mt-2 text-sm uppercase tracking-wide text-zinc-500">{product.category}</p>
            )}
          </div>

          {/* Rating and Reviews */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm font-semibold text-white">{product.rating}</span>
              {product.reviewCount && product.reviewCount > 0 && (
                <span className="text-sm text-zinc-500">({product.reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}

          {/* Limited Time Badge */}
          {product.discount && product.discount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-md bg-red-600/20 border border-red-500/50 px-3 py-1.5 text-sm font-semibold text-red-400">
              Limited Time
            </div>
          )}

          <p className="text-lg text-zinc-300">{product.description}</p>

          <div className="space-y-2">
            {(() => {
              const { finalPrice, originalPrice, hasDiscount } = calculateDiscount(product.price, product.discount || 0);
              return (
                <>
                  {hasDiscount ? (
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-2xl font-semibold text-red-400">-{product.discount}%</span>
                      <p className="text-5xl font-bold text-white">₹{finalPrice}</p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold text-white">₹{product.price.toFixed(0)}</p>
                    </div>
                  )}
                  {hasDiscount && originalPrice && (
                    <div className="flex items-baseline gap-2 text-sm">
                      <span className="text-zinc-500">M.R.P:</span>
                      <span className="text-zinc-500 line-through">₹{originalPrice}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-purple-600 border border-purple-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to cart
          </button>

          {product.fullDescription && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white">About this service</h2>
              <p className="mt-3 leading-relaxed text-zinc-300">{product.fullDescription}</p>
            </div>
          )}

          {product.features && product.features.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white">What's included</h2>
              <ul className="mt-4 space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-zinc-300">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">Related services</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((rel) => {
              const { finalPrice, originalPrice, hasDiscount } = calculateDiscount(rel.price, rel.discount || 0);
              return (
                <Link
                  key={rel.id}
                  href={`/shop/${rel.id}`}
                  className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-2xl transition hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-purple-500/20"
                >
                  <h3 className="text-lg font-semibold text-white transition group-hover:text-purple-400">
                    {rel.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">{rel.description}</p>
                  {hasDiscount ? (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-red-400">-{rel.discount}%</span>
                        <span className="text-xl font-bold text-white">₹{finalPrice}</span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        M.R.P: <span className="line-through">₹{originalPrice}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xl font-semibold text-white">₹{rel.price.toFixed(0)}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
