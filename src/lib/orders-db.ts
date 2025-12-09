import { getServiceClient } from './supabase';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'order-placed' | 'payment-done' | 'payment-confirmed' | 'order-successful' | 'delivered' | 'cancelled';
  promoCode?: string;
  paymentMethod?: string;
  paymentNationality?: 'indian' | 'international';
  paymentScreenshot?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error} = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<Order | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const updates: any = { status };
  if (notes) updates.notes = notes;

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  return !error;
}
