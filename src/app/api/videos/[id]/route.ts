import { NextResponse } from 'next/server';
import { getVideoById, updateVideo, deleteVideo, incrementViews } from '@/lib/videos-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const video = await getVideoById(params.id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error('[API] Failed to fetch video:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const video = await updateVideo(params.id, body);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error('[API] Failed to update video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await deleteVideo(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to delete video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
