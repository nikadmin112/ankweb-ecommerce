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
  status: 'pending-payment' | 'order-placed' | 'payment-done' | 'payment-confirmed' | 'order-successful' | 'delivered' | 'cancelled';
  promoCode?: string;
  paymentMethod?: string;
  paymentNationality?: 'indian' | 'international';
  paymentScreenshot?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Map camelCase to snake_case for database
function toDbOrder(order: any): any {
  return {
    order_number: order.orderNumber,
    customer_id: order.customerId,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    status: order.status,
    promo_code: order.promoCode,
    payment_method: order.paymentMethod,
    payment_nationality: order.paymentNationality,
    payment_screenshot: order.paymentScreenshot,
    notes: order.notes,
  };
}

// Map snake_case from database to camelCase
function fromDbOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerId: dbOrder.customer_id,
    customerName: dbOrder.customer_name,
    customerEmail: dbOrder.customer_email,
    customerPhone: dbOrder.customer_phone,
    items: dbOrder.items,
    subtotal: dbOrder.subtotal,
    discount: dbOrder.discount,
    total: dbOrder.total,
    status: dbOrder.status,
    promoCode: dbOrder.promo_code,
    paymentMethod: dbOrder.payment_method,
    paymentNationality: dbOrder.payment_nationality,
    paymentScreenshot: dbOrder.payment_screenshot,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    notes: dbOrder.notes,
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(fromDbOrder);
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
  return fromDbOrder(data);
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
  return (data || []).map(fromDbOrder);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const dbOrder = toDbOrder({
    ...orderData,
    orderNumber,
  });
  
  const { data, error } = await supabase
    .from('orders')
    .insert([dbOrder] as any)
    .select()
    .single();

  if (error) throw error;
  return fromDbOrder(data);
}

export async function updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<Order | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase client not configured');

  const updates: any = { status };
  if (notes) updates.notes = notes;

  const { data, error } = await supabase
    .from('orders')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return fromDbOrder(data);
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
