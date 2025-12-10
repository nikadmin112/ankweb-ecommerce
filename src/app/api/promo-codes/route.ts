import { getAllPromoCodes } from '@/lib/promo-db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const promoCodes = await getAllPromoCodes();
    return NextResponse.json(promoCodes, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('[API POST] Fetching promo codes from database...');
    const promoCodes = await getAllPromoCodes();
    console.log('[API POST] Promo codes fetched:', promoCodes.length, 'items');
    return NextResponse.json(promoCodes, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API POST] Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}
