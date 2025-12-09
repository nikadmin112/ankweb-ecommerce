"use client";

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface FilterState {
  search: string;
  category: string | null;
  sortBy: string;
  priceMin: number | null;
  priceMax: number | null;
}

interface ShopFiltersProps {
  categories: string[];
  onFilterChange?: (filters: FilterState) => void;
}

export function ShopFilters({ categories, onFilterChange }: ShopFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        search,
        category: selectedCategory,
        sortBy,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null
      });
    }
  }, [search, selectedCategory, sortBy, priceMin, priceMax, onFilterChange]);

  return (
    <div className="space-y-4">
      {/* Search bar and filter button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:border-purple-500/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Filter Options</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Category
                </label>
                <select
                  value={selectedCategory ?? ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort by */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Sort by
              </label>
                <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Price range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
                <span className="text-zinc-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Clear filters button */}
          {(search || selectedCategory || priceMin || priceMax || sortBy !== 'default') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory(null);
                setSortBy('default');
                setPriceMin('');
                setPriceMax('');
              }}
              className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active filters chips */}
      {(search || selectedCategory || priceMin || priceMax) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Active:</span>
          {search && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-purple-400">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-purple-400">
              {selectedCategory}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(priceMin || priceMax) && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-purple-400">
              ${priceMin || '0'} - ${priceMax || '∞'}
              <button onClick={() => { setPriceMin(''); setPriceMax(''); }} className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
