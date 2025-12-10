'use server';

import { revalidatePath } from 'next/cache';
import { updateProduct, getProductById } from '@/lib/local-db';
import { createPromoCode, updatePromoCode, deletePromoCode as deletePromo } from '@/lib/promo-db';

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
  try {
    const code = (formData.get('code') as string).toUpperCase();
    const discount_type = formData.get('type') as string;
    const valueStr = formData.get('value') as string;
    const is_active = true;

    if (!code || !discount_type || !valueStr) {
      throw new Error('Code, type, and value are required');
    }

    // For free_service, use free_product_id. For others, use discount_value
    const promoData: any = {
      code,
      discount_type: discount_type as any,
      is_active
    };

    if (discount_type === 'free_service') {
      promoData.free_product_id = valueStr;
      promoData.discount_value = 0; // Set to 0 for free_service
    } else {
      promoData.discount_value = Number(valueStr);
    }

    await createPromoCode(promoData);
    revalidatePath('/admin');
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      throw new Error(`Promo code already exists. Please use a different code or delete the existing one first.`);
    }
    throw error;
  }
}

export async function updatePromoCodeAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const code = (formData.get('code') as string).toUpperCase();
    const discount_type = formData.get('type') as string;
    const valueStr = formData.get('value') as string;
    const is_active = formData.get('is_active') === 'true';

    if (!id || !code || !discount_type || !valueStr) {
      throw new Error('ID, code, type, and value are required');
    }

    // For free_service, use free_product_id. For others, use discount_value
    const updateData: any = {
      code,
      discount_type: discount_type as any,
      is_active
    };

    if (discount_type === 'free_service') {
      updateData.free_product_id = valueStr;
      updateData.discount_value = 0;
    } else {
      updateData.discount_value = Number(valueStr);
      updateData.free_product_id = null; // Clear free_product_id for non-free_service types
    }

    await updatePromoCode(id, updateData);
    revalidatePath('/admin');
  } catch (error: any) {
    console.error('Error updating promo code:', error);
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      throw new Error(`Promo code already exists. Please use a different code.`);
    }
    throw error;
  }
}

export async function deletePromoCodeAction(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('ID is required');
  }

  await deletePromo(id);
  revalidatePath('/admin');
}
