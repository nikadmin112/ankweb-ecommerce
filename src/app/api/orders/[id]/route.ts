import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📋 Fetching order by ID:', params.id);
    const order = await getOrderById(params.id);
    
    if (!order) {
      console.log('❌ Order not found:', params.id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    console.log('✅ Order fetched:', order.orderNumber, 'Status:', order.status);
    return NextResponse.json(order, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
