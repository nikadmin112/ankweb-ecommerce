import { NextResponse } from 'next/server';
import { getAllOrders, getOrdersByCustomerId, updateOrderStatus } from '@/lib/orders-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  try {
    if (customerId) {
      const orders = await getOrdersByCustomerId(customerId);
      return NextResponse.json(orders);
    }
    
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, status, notes } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    
    const updatedOrder = await updateOrderStatus(orderId, status, notes);
    
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
