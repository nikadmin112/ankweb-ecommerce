"use client";

import { useState, useMemo } from 'react';
import { ShopFilters, type FilterState } from '@/components/shop-filters';
import { ProductGrid } from '@/components/product-grid';
import { Pagination } from '@/components/pagination';
import type { Product } from '@/types';
import type { Category } from '@/lib/categories-db';

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const PRODUCTS_PER_PAGE = 6;

export function ShopClient({ initialProducts, categories, filters, onFilterChange }: ShopClientProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedProducts = useMemo(() => {
    let products = [...initialProducts];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceMin !== null) {
      products = products.filter((p) => p.price >= filters.priceMin!);
    }
    if (filters.priceMax !== null) {
      products = products.filter((p) => p.price <= filters.priceMax!);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep default order
        break;
    }

    return products;
  }, [initialProducts, filters]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {filteredAndSortedProducts.length === 0 ? (
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-12 text-center shadow-2xl">
          <p className="text-lg font-medium text-white">No products match your filters</p>
          <p className="mt-2 text-sm text-zinc-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">
              Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
              {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredAndSortedProducts.length)} of{' '}
              {filteredAndSortedProducts.length} products
            </p>
          </div>
          
          <ProductGrid products={paginatedProducts} />
          
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
