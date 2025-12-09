import { NextResponse } from 'next/server';
import { getCoinById, updateCoin, deleteCoin } from '@/lib/crypto-coins-db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const coin = await getCoinById(params.id);
    if (!coin) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
    return NextResponse.json(coin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coin' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const coin = await updateCoin(params.id, body);
    if (!coin) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
    return NextResponse.json(coin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coin' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCoin(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coin' }, { status: 500 });
  }
}
