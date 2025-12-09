'use server';

import { revalidatePath } from 'next/cache';
import { createCategory, updateCategory, deleteCategory, type Category } from '@/lib/categories-db';

export async function createCategoryAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    // Get all icon values - radio buttons and text input have the same name
    const icons = formData.getAll('icon') as string[];
    // Filter out empty values and get the first non-empty one
    const icon = icons.find(i => i && i.trim() !== '') || '';

    console.log('Category action - name:', name, 'icons:', icons, 'selected:', icon);

    if (!name || !icon) {
      throw new Error('Name and icon are required');
    }

    const result = await createCategory({ name, icon });
    console.log('Category created:', result);
    revalidatePath('/admin');
    revalidatePath('/shop');
  } catch (error) {
    console.error('Error in createCategoryAction:', error);
    throw error;
  }
}

export async function updateCategoryAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string;

  if (!id) {
    throw new Error('ID is required');
  }

  await updateCategory(id, { name, icon });
  revalidatePath('/admin');
  revalidatePath('/shop');
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('ID is required');
  }

  await deleteCategory(id);
  revalidatePath('/admin');
  revalidatePath('/shop');
}
