"use client";

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        <li>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-white/60 transition hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Shop</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-white/30" />
            {item.href ? (
              <Link href={item.href} className="text-white/60 transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/90">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
