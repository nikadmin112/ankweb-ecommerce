import { getAllPromoCodes } from '@/lib/promo-db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promoCodes = await getAllPromoCodes();
    return NextResponse.json(promoCodes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}
