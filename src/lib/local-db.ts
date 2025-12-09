import { getServiceClient } from './supabase';
import type { Product } from '@/types';

export interface LocalProduct extends Product {
  created_at?: string;
  updated_at?: string;
}

export async function getAllProducts(): Promise<LocalProduct[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(p => ({
    ...p,
    full_description: p.full_description,
    fullDescription: p.full_description,
    review_count: p.review_count,
    reviewCount: p.review_count
  }));
}

export async function getProductById(id: string): Promise<LocalProduct | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data ? {
    ...data,
    fullDescription: data.full_description,
    reviewCount: data.review_count
  } : null;
}

export async function createProduct(product: Omit<LocalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<LocalProduct> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const dbProduct = {
    ...product,
    full_description: product.fullDescription,
    review_count: product.reviewCount || 0
  };
  delete (dbProduct as any).fullDescription;
  delete (dbProduct as any).reviewCount;

  const { data, error } = await supabase
    .from('products')
    .insert([dbProduct])
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    fullDescription: data.full_description,
    reviewCount: data.review_count
  };
}

export async function updateProduct(id: string, updates: Partial<Omit<LocalProduct, 'id' | 'created_at'>>): Promise<LocalProduct | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const dbUpdates: any = { ...updates };
  if (updates.fullDescription) {
    dbUpdates.full_description = updates.fullDescription;
    delete dbUpdates.fullDescription;
  }
  if (updates.reviewCount !== undefined) {
    dbUpdates.review_count = updates.reviewCount;
    delete dbUpdates.reviewCount;
  }

  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data ? {
    ...data,
    fullDescription: data.full_description,
    reviewCount: data.review_count
  } : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  return !error;
}
