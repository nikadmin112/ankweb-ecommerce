import { NextResponse } from 'next/server';
import { incrementViews } from '@/lib/videos-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await incrementViews(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to increment video views:', error);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}
