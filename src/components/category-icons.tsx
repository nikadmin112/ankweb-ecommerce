"use client";

import { MessageSquare, FileCheck, Settings, Package, Briefcase, Users, Heart, Star, Zap, Gift, Camera, Music, Palette, Scissors, Dumbbell, Baby, Sparkles } from 'lucide-react';
import type { Category } from '@/lib/categories-db';
import * as LucideIcons from 'lucide-react';

// Map icon names to Lucide icons
const iconMap: Record<string, React.ReactNode> = {
  'MessageSquare': <MessageSquare />,
  'FileCheck': <FileCheck />,
  'Settings': <Settings />,
  'Package': <Package />,
  'Briefcase': <Briefcase />,
  'Users': <Users />,
  'Heart': <Heart />,
  'Star': <Star />,
  'Zap': <Zap />,
  'Gift': <Gift />,
  'Camera': <Camera />,
  'Music': <Music />,
  'Palette': <Palette />,
  'Scissors': <Scissors />,
  'Dumbbell': <Dumbbell />,
  'Baby': <Baby />,
  'Sparkles': <Sparkles />,
};

interface CategoryIconsProps {
  categories?: Category[];
  onCategoryClick?: (categoryName: string) => void;
}

export function CategoryIcons({ categories = [], onCategoryClick }: CategoryIconsProps) {
  if (categories.length === 0) {
    return null;
  }

  const renderIcon = (iconValue: string) => {
    // Check if it's a URL (custom icon)
    if (iconValue.startsWith('http://') || iconValue.startsWith('https://')) {
      return <img src={iconValue} alt="icon" className="h-6 w-6 object-contain" />;
    }
    // Otherwise, use Lucide icon by name
    return iconMap[iconValue] || <Package />;
  };

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2 sm:gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick?.(category.name)}
            className="flex min-w-[80px] flex-col items-center gap-2 transition-all hover:scale-105 group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 transition-colors group-hover:bg-zinc-800 group-hover:border-purple-500/50 sm:h-16 sm:w-16">
              {renderIcon(category.icon)}
            </div>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors sm:text-sm">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
