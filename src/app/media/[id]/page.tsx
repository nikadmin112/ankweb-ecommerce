"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return views.toString();
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`);
      if (!response.ok) {
        router.push('/media');
        return;
      }
      const data = await response.json();
      setVideo(data);
    } catch (error) {
      console.error('Failed to fetch video:', error);
      router.push('/media');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="animate-pulse">
          <div className="aspect-video bg-zinc-800 rounded-xl mb-6"></div>
          <div className="h-8 bg-zinc-800 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
      </main>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <Link
        href="/media"
        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>

      {/* Video Player */}
      <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-6">
        <video
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          controls
          className="w-full aspect-video"
          autoPlay
        />
      </div>

      {/* Video Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {formatViews(video.views)} views
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(video.createdAt).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span>•</span>
            <span>{formatDuration(video.duration)}</span>
          </div>
        </div>

        {video.description && (
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
            <p className="text-zinc-400 whitespace-pre-wrap">{video.description}</p>
          </div>
        )}
      </div>
    </main>
  );
}
