'use server';

import { revalidatePath } from 'next/cache';
import * as localDb from '@/lib/local-db';

export async function createProduct(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const fullDescription = String(formData.get('fullDescription') ?? '').trim() || undefined;
  const price = Number(formData.get('price')) || 0;
  const badge = String(formData.get('badge') ?? '').trim() || undefined;
  const category = String(formData.get('category') ?? '').trim() || undefined;
  const image = String(formData.get('image') ?? '').trim() || undefined;
  const rating = Number(formData.get('rating')) || undefined;
  const reviewCount = Number(formData.get('reviewCount')) || undefined;
  const discount = Number(formData.get('discount')) || undefined;

  console.log('Creating product with data:', { name, description, price, badge, category, image, rating, reviewCount, discount });

  if (!name || !description || price <= 0) {
    throw new Error('Name, description, and positive price are required.');
  }

  try {
    const result = await localDb.createProduct({
      name,
      description,
      fullDescription,
      price,
      badge,
      category,
      image,
      rating,
      reviewCount,
      discount
    });
    console.log('Product created:', result);

    revalidatePath('/admin');
    revalidatePath('/shop');
  } catch (error) {
    console.error('Failed to create product:', error);
    throw new Error('Failed to create product');
  }
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const price = Number(formData.get('price')) || 0;
  const badge = String(formData.get('badge') ?? '').trim() || undefined;
  const category = String(formData.get('category') ?? '').trim() || undefined;
  const image = String(formData.get('image') ?? '').trim() || undefined;
  const fullDescription = String(formData.get('fullDescription') ?? '').trim() || undefined;
  const rating = Number(formData.get('rating')) || undefined;
  const reviewCount = Number(formData.get('reviewCount')) || undefined;
  const discount = Number(formData.get('discount')) || undefined;

  if (!id) throw new Error('Missing product id');
  if (!name || !description || price <= 0) {
    throw new Error('Name, description, and positive price are required.');
  }

  try {
    const updated = await localDb.updateProduct(id, {
      name,
      description,
      price,
      badge,
      category,
      image,
      fullDescription,
      rating,
      reviewCount,
      discount
    });

    if (!updated) {
      throw new Error('Product not found');
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product');
  }
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing product id');

  try {
    console.log('Attempting to delete product:', id);
    const deleted = await localDb.deleteProduct(id);
    console.log('Delete result:', deleted);
    
    if (!deleted) {
      throw new Error('Product not found');
    }

    revalidatePath('/admin');
    revalidatePath('/shop');
  } catch (error) {
    console.error('Failed to delete product:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
    throw new Error('Failed to delete product');
  }
}
