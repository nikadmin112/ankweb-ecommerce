"use client";

import { Search, Camera } from 'lucide-react';
import { useState } from 'react';

interface SearchBarFlipkartProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBarFlipkart({ onSearch, placeholder = "Search for products..." }: SearchBarFlipkartProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        <button type="button" aria-label="Search by image" className="text-gray-400 hover:text-gray-600">
          <Camera className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
