"use client";

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { ProductVariant } from '@/types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

export function ProductVariantSelector({
  variants,
  selectedVariant,
  onVariantChange
}: ProductVariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
        Choose your tier
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant.id === variant.id;
          return (
            <button
              key={variant.id}
              onClick={() => onVariantChange(variant)}
              className={`relative rounded-xl border p-4 text-left transition ${
                isSelected
                  ? 'border-lilac bg-lilac/10 shadow-lg shadow-lilac/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {isSelected && (
                <div className="absolute right-3 top-3">
                  <Check className="h-5 w-5 text-lilac" />
                </div>
              )}
              <p className="font-semibold text-white">{variant.name}</p>
              <p className="mt-1 text-2xl font-bold text-white">${variant.price}</p>
              {variant.description && (
                <p className="mt-2 text-sm text-white/60">{variant.description}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
