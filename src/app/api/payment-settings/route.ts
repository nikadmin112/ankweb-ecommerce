import { NextResponse } from 'next/server';
import { getAllSettings, updateSetting } from '@/lib/payment-settings-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const setting = await updateSetting(body);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Payment settings save error:', error);
    return NextResponse.json({ error: 'Failed to save payment settings' }, { status: 500 });
  }
}
