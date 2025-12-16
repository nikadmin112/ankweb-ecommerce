import { NextResponse } from 'next/server';
import { getAllVideos, createVideo } from '@/lib/videos-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const videos = await getAllVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('[API] Failed to fetch videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description : '';
    const videoUrl = typeof body?.videoUrl === 'string' ? body.videoUrl.trim() : '';
    const thumbnailUrl = typeof body?.thumbnailUrl === 'string' ? body.thumbnailUrl.trim() : '';
    const duration = Number(body?.duration);
    const isActive = typeof body?.isActive === 'boolean' ? body.isActive : true;

    if (!title || !videoUrl || !Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: title, videoUrl, duration' },
        { status: 400 }
      );
    }

    const video = await createVideo({
      title,
      description,
      videoUrl,
      thumbnailUrl: thumbnailUrl || undefined,
      duration,
      isActive,
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('[API] Failed to create video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
