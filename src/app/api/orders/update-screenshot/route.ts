import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { orderId, screenshotUrl } = await request.json();

    if (!orderId || !screenshotUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Update order with screenshot URL and status
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_screenshot: screenshotUrl,
        status: 'payment-done',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Screenshot uploaded successfully' 
    });
  } catch (error) {
    console.error('Failed to update order with screenshot:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
