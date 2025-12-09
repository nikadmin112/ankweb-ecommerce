import { getAllProducts, getProductById } from './local-db';
import type { Product } from '@/types';

export async function fetchProducts(): Promise<Product[]> {
  try {
    const products = await getAllProducts();
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      badge: p.badge,
      image: p.image,
      category: p.category,
      fullDescription: p.fullDescription,
      features: p.features,
      rating: p.rating,
      reviewCount: p.reviewCount,
      discount: p.discount
    }));
  } catch (error) {
    console.error('Failed to fetch products from local DB:', error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const product = await getProductById(id);
    if (!product) return null;
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      badge: product.badge,
      image: product.image,
      category: product.category,
      fullDescription: product.fullDescription,
      features: product.features,
      rating: product.rating,
      reviewCount: product.reviewCount,
      discount: product.discount
    };
  } catch (error) {
    console.error('Failed to fetch product by ID from local DB:', error);
    return null;
  }
}
