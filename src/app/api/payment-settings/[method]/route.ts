import { NextResponse } from 'next/server';
import { getSettingByMethod } from '@/lib/payment-settings-db';

export async function GET(
  request: Request,
  { params }: { params: { method: string } }
) {
  try {
    const setting = getSettingByMethod(params.method);
    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment setting' }, { status: 500 });
  }
}
