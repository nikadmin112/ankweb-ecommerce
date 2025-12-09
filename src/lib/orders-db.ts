import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

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

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

async function readOrders(): Promise<Order[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function writeOrders(orders: Order[]) {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function getAllOrders(): Promise<Order[]> {
  return readOrders();
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find((o) => o.id === id) || null;
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  const orders = await readOrders();
  return orders.filter((o) => o.customerId === customerId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const orders = await readOrders();
  
  // Generate order number (e.g., ORD-20231208-001)
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const orderCount = orders.filter(o => o.orderNumber.includes(dateStr)).length + 1;
  const orderNumber = `ORD-${dateStr}-${String(orderCount).padStart(3, '0')}`;
  
  const newOrder: Order = {
    ...orderData,
    id: randomUUID(),
    orderNumber,
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  };

  orders.push(newOrder);
  await writeOrders(orders);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<Order | null> {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  
  if (index === -1) return null;
  
  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  if (notes) orders[index].notes = notes;
  
  await writeOrders(orders);
  return orders[index];
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = await readOrders();
  const filtered = orders.filter((o) => o.id !== id);
  
  if (filtered.length === orders.length) return false;
  
  await writeOrders(filtered);
  return true;
}
