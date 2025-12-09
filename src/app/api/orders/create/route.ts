import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders-db';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.customerName || !orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const order = await createOrder(orderData);
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
