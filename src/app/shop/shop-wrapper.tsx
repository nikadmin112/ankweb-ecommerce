"use client";

import { useState } from 'react';
import { ShopFilters, type FilterState } from '@/components/shop-filters';
import { ShopClient } from './shop-client';
import { CategoryIcons } from '@/components/category-icons';
import { OfferCarousel } from '@/components/offer-carousel';
import type { Product } from '@/types';
import type { Category } from '@/lib/categories-db';

interface ShopWrapperProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ShopWrapper({ initialProducts, categories }: ShopWrapperProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: null,
    sortBy: 'default',
    priceMin: null,
    priceMax: null
  });

  return (
    <>
      {/* Search and Filters - 2nd position */}
      <div className="mb-6 px-4">
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 shadow-2xl">
          <ShopFilters categories={categories} onFilterChange={setFilters} />
        </div>
      </div>

      {/* Offer Carousel - 3rd position */}
      <div className="px-4 mb-6">
        <OfferCarousel />
      </div>

      {/* Category Icons */}
      <div className="mb-6 px-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl">
          <CategoryIcons categories={categories} />
        </div>
      </div>

      {/* Products with filters applied */}
      <div className="px-4">
        <ShopClient 
          initialProducts={initialProducts} 
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </>
  );
}
