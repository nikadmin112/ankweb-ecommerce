"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './cart-context';
import { useWishlist } from './wishlist-context';
import { useCurrency } from './currency-context';
import { ProductQuickView } from './product-quick-view';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export function ProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    setQuickViewProduct(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    toggleWishlist(product);
    if (isInWishlist(product.id)) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
      
      return (
        <div key={i} className="relative h-3 w-3">
          <Star className="h-3 w-3 text-zinc-700 absolute" />
          <div style={{ width: `${fillPercentage}%` }} className="overflow-hidden absolute">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          </div>
        </div>
      );
    });
  };

  const calculateDiscount = (price: number, discountPercent?: number) => {
    if (!discountPercent) return { finalPrice: price, hasDiscount: false };
    const discount = (price * discountPercent) / 100;
    return {
      finalPrice: price - discount,
      originalPrice: price,
      discountPercent,
      hasDiscount: true
    };
  };

  return (
    <>
      {/* 2 products per row on mobile (Amazon style), responsive grid on larger screens */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const pricing = calculateDiscount(product.price, product.discount ?? undefined);
          
          return (
            <Link key={product.id} href={`/shop/${product.id}`}>
              <article className="group relative overflow-hidden rounded-lg bg-zinc-950 shadow-lg transition-all hover:shadow-2xl hover:shadow-purple-500/10 border border-zinc-900 hover:border-purple-500/50">
                {/* Wishlist heart button */}
                <button
                  onClick={(e) => handleToggleWishlist(e, product)}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-zinc-900/90 backdrop-blur-sm p-1.5 transition-all hover:scale-110 border border-zinc-800 hover:border-purple-500/50"
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      isInWishlist(product.id) ? 'fill-purple-500 text-purple-500' : 'text-zinc-500'
                    }`}
                  />
                </button>

                {/* Limited Time Badge */}
                {pricing.hasDiscount && (
                  <div className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-lg">
                    Limited Time
                  </div>
                )}

                {/* Product Image */}
                {product.image ? (
                  <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      quality={85}
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 sm:h-48 w-full items-center justify-center bg-zinc-900">
                    <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-zinc-700" />
                  </div>
                )}

                {/* Product Details */}
                <div className="p-2 sm:p-3">
                  {/* Product Name - Bold */}
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Description - Small, One Line */}
                  <p className="mt-1 text-xs text-zinc-400 truncate">
                    {product.description}
                  </p>

                  {/* Rating and Reviews */}
                  {product.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                      {product.reviewCount && (
                        <span className="text-xs text-zinc-500">({product.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {/* Price Section */}
                  <div className="mt-2">
                    {pricing.hasDiscount ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium text-red-500">
                            -{pricing.discountPercent}%
                          </span>
                          <span className="text-base sm:text-lg font-bold text-white">
                            {formatPrice(pricing.finalPrice)}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500">
                          M.R.P: <span className="line-through">{formatPrice(pricing.originalPrice!)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-base sm:text-lg font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Badge */}
                  {product.badge && !pricing.hasDiscount && (
                    <span className="inline-block mt-2 text-xs font-medium text-purple-400">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Mobile Cart Button - Bottom Right Corner */}
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="absolute bottom-2 right-2 z-10 sm:hidden rounded-full bg-purple-600 p-2 shadow-lg transition-all hover:bg-purple-500 hover:scale-110 active:scale-95 border border-purple-500/50"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-4 w-4 text-white" />
                </button>

                {/* Desktop Quick Add Button - Shown on hover for desktop */}
                <div className="hidden sm:block border-t border-zinc-800 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
