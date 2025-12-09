import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/orders-db';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { orderId, screenshotUrl } = await request.json();

    if (!orderId || !screenshotUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order with screenshot URL
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    const ordersData = await readFile(ordersPath, 'utf-8');
    const orders = JSON.parse(ordersData);
    
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[orderIndex].paymentScreenshot = screenshotUrl;
    orders[orderIndex].status = 'payment-done';
    orders[orderIndex].updatedAt = new Date().toISOString();

    await writeFile(ordersPath, JSON.stringify(orders, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Screenshot uploaded successfully' 
    });
  } catch (error) {
    console.error('Failed to update order with screenshot:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
