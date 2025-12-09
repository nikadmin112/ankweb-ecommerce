'use server';

import { revalidatePath } from 'next/cache';
import { createOffer, updateOffer, deleteOffer } from '@/lib/offers-db';

export async function createOfferAction(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as string;
  const link = formData.get('link') as string;

  await createOffer({
    title,
    description,
    image,
    link: link || undefined
  });

  revalidatePath('/admin');
  revalidatePath('/shop');
}

export async function updateOfferAction(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as string;
  const link = formData.get('link') as string;

  await updateOffer(id, { title, description, image, link: link || undefined });
  revalidatePath('/admin');
  revalidatePath('/shop');
}

export async function deleteOfferAction(formData: FormData) {
  const id = formData.get('id') as string;
  await deleteOffer(id);
  revalidatePath('/admin');
  revalidatePath('/shop');
}
