import { NextResponse } from 'next/server';
import { getAllVideos, createVideo } from '@/lib/videos-db';

export async function GET() {
  try {
    const videos = getAllVideos();
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const video = createVideo(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
