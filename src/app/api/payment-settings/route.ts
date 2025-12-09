import { NextResponse } from 'next/server';
import { getAllSettings, updateSetting } from '@/lib/payment-settings-db';

export async function GET() {
  try {
    const settings = getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const setting = updateSetting(body);
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save payment settings' }, { status: 500 });
  }
}
