import { NextResponse } from 'next/server';
import { getAllCoins, createCoin } from '@/lib/crypto-coins-db';

export async function GET() {
  try {
    const coins = getAllCoins();
    return NextResponse.json(coins);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch crypto coins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coin = createCoin(body);
    return NextResponse.json(coin, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coin' }, { status: 500 });
  }
}
