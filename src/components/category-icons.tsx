"use client";

import { MessageSquare, FileCheck, Settings, Package, Briefcase, Users } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Consulting': <MessageSquare />,
  'Audits': <FileCheck />,
  'Systems': <Settings />,
  'Packages': <Package />,
  'Services': <Briefcase />,
  'Support': <Users />,
};

interface CategoryIconsProps {
  categories?: string[];
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoryIcons({ categories = [], onCategoryClick }: CategoryIconsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2 sm:gap-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryClick?.(category)}
            className="flex min-w-[80px] flex-col items-center gap-2 transition-all hover:scale-105 group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 transition-colors group-hover:bg-zinc-800 group-hover:border-purple-500/50 sm:h-16 sm:w-16">
              {categoryIcons[category] || <Package />}
            </div>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors sm:text-sm">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
