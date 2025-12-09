import { getServiceClient } from './supabase';

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getAllOffers(): Promise<Offer[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createOffer(offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<Offer> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('offers')
    .insert([offer])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOffer(id: string, updates: Partial<Omit<Offer, 'id' | 'created_at'>>): Promise<Offer | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  return !error;
}
