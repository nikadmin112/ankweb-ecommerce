import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchProducts, fetchProductById } from '@/lib/products';
import { ProductDetailSkeleton } from '@/components/skeletons';
import { ProductDetailClient } from './product-detail-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ProductContent({ id }: { id: string }) {
  const product = await fetchProductById(id);
  if (!product) notFound();

  const allProducts = await fetchProducts();
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <ProductDetailSkeleton />
      </div>
    }>
      <ProductContent id={params.id} />
    </Suspense>
  );
}
