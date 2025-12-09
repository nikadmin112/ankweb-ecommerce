import { getServiceClient } from './supabase';
import type { Product } from '@/types';

export interface LocalProduct extends Product {
  created_at?: string;
  updated_at?: string;
}

export async function getAllProducts(): Promise<LocalProduct[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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
  return data;
}

export async function createProduct(product: Omit<LocalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<LocalProduct> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Omit<LocalProduct, 'id' | 'created_at'>>): Promise<LocalProduct | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
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
