import { Suspense } from 'react';
import { fetchProducts } from '@/lib/products';
import { getAllCategories } from '@/lib/categories-db';
import { ProductGridSkeleton } from '@/components/skeletons';
import { ShopWrapper } from './shop-wrapper';
import { TopNavBoxes } from '@/components/top-nav-boxes';
import { OfferCarousel } from '@/components/offer-carousel';

async function ShopContent() {
  const [allProducts, categories] = await Promise.all([
    fetchProducts(),
    getAllCategories()
  ]);
  return <ShopWrapper initialProducts={allProducts} categories={categories} />;
}

export default function ShopPage() {
  return (
    <main className="min-h-screen w-full bg-black pb-8">
      {/* Modern container */}
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation Boxes */}
        <div className="bg-black px-4 py-4 border-b border-zinc-900">
          <TopNavBoxes />
        </div>

        {/* Products Section */}
        <div className="bg-black pt-4">
          <Suspense fallback={<div className="px-4"><ProductGridSkeleton count={6} /></div>}>
            <ShopContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
