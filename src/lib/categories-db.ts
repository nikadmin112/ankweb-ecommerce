import { getServiceClient } from './supabase';

export interface Category {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react or custom URL
  created_at?: string;
  updated_at?: string;
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('categories')
    .insert([category] as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('categories')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  return !error;
}
