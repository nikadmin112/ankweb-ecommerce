import { getServiceClient } from './supabase';
import type { Product } from '@/types';

export interface LocalProduct extends Product {
  created_at?: string;
  updated_at?: string;
}

// Database uses snake_case, TypeScript uses camelCase
interface DbProduct {
  id: string;
  name: string;
  description?: string | null;
  full_description?: string | null;
  price: number;
  discount?: number;
  badge?: string | null;
  category?: string | null;
  image?: string | null;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
}

function toDbProduct(product: Partial<LocalProduct>): Partial<DbProduct> {
  return {
    ...product,
    full_description: product.fullDescription,
    review_count: product.reviewCount ?? undefined,
  };
}

function fromDbProduct(dbProduct: DbProduct): LocalProduct {
  return {
    ...dbProduct,
    fullDescription: dbProduct.full_description,
    reviewCount: dbProduct.review_count,
  };
}

export async function getAllProducts(): Promise<LocalProduct[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(fromDbProduct);
}

export async function getProductById(id: string): Promise<LocalProduct | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data ? fromDbProduct(data) : null;
}

export async function createProduct(product: Omit<LocalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<LocalProduct> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const dbProduct = toDbProduct(product);

  const { data, error } = await supabase
    .from('products')
    .insert([dbProduct] as any)
    .select()
    .single();

  if (error) throw error;
  return fromDbProduct(data);
}

export async function updateProduct(id: string, updates: Partial<Omit<LocalProduct, 'id' | 'created_at'>>): Promise<LocalProduct | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const dbUpdates = toDbProduct(updates);

  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data ? fromDbProduct(data) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  return !error;
}
