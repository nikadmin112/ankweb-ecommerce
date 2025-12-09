import { NextResponse } from 'next/server';
import { addNetworkToCoin, updateNetwork, deleteNetwork } from '@/lib/crypto-coins-db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const coin = addNetworkToCoin(params.id, body);
    if (!coin) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
    return NextResponse.json(coin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add network' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { networkId, ...networkData } = body;
    
    if (!networkId) {
      return NextResponse.json({ error: 'Network ID required' }, { status: 400 });
    }
    
    const coin = updateNetwork(params.id, networkId, networkData);
    if (!coin) {
      return NextResponse.json({ error: 'Coin or network not found' }, { status: 404 });
    }
    return NextResponse.json(coin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update network' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const networkId = searchParams.get('networkId');
    
    if (!networkId) {
      return NextResponse.json({ error: 'Network ID required' }, { status: 400 });
    }
    
    const coin = deleteNetwork(params.id, networkId);
    if (!coin) {
      return NextResponse.json({ error: 'Coin or network not found' }, { status: 404 });
    }
    return NextResponse.json(coin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete network' }, { status: 500 });
  }
}
