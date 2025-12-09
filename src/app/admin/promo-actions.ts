'use server';

import { revalidatePath } from 'next/cache';
import { updateProduct, getProductById } from '@/lib/local-db';
import { createPromoCode, deletePromoCode as deletePromo } from '@/lib/promo-db';

export async function setProductDiscountAction(formData: FormData) {
  const productId = formData.get('productId') as string;
  const discount = Number(formData.get('discount')) || 0;

  if (!productId) {
    throw new Error('Product ID is required');
  }

  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  await updateProduct(productId, { discount: discount > 0 ? discount : null });
  revalidatePath('/admin');
  revalidatePath('/shop');
  revalidatePath('/product/[id]', 'page');
  revalidatePath('/', 'layout');
}

export async function createPromoCodeAction(formData: FormData) {
  const code = (formData.get('code') as string).toUpperCase();
  const type = formData.get('type') as 'percentage' | 'bogo' | 'free_service';
  const value = formData.get('value') as string;
  const description = formData.get('description') as string;
  const minCartValue = Number(formData.get('minCartValue')) || undefined;

  if (!code || !type || !value) {
    throw new Error('Code, type, and value are required');
  }

  await createPromoCode({ code, type, value, description, minCartValue });
  revalidatePath('/admin');
}

export async function deletePromoCodeAction(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('ID is required');
  }

  await deletePromo(id);
  revalidatePath('/admin');
}
