import { getServiceClient } from './supabase';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'free_service';
  discount_value: number; // numeric value for percentage/fixed/bogo
  free_product_id?: string; // product ID for free_service type
  usage_limit?: number;
  used_count?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data;
}

export async function createPromoCode(promo: Omit<PromoCode, 'id' | 'created_at' | 'updated_at'>): Promise<PromoCode> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  // Generate a unique ID
  const id = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const { data, error } = await supabase
    .from('promo_codes')
    .insert([{ ...promo, id }] as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePromoCode(id: string, updates: Partial<Omit<PromoCode, 'id' | 'created_at' | 'updated_at'>>): Promise<PromoCode | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error} = await supabase
    .from('promo_codes')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update promo code error:', error);
    throw error;
  }
  return data;
}

export async function deletePromoCode(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);

  return !error;
}
