"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Eye } from 'lucide-react';

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

export default function MediaPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (videoId: string) => {
    setHoveredVideo(videoId);
    const video = videoRefs.current[videoId];
    if (video) {
      video.currentTime = 0;
      video.play().catch(err => console.log('Play failed:', err));
    }
  };

  const handleMouseLeave = (videoId: string) => {
    setHoveredVideo(null);
    const video = videoRefs.current[videoId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const incrementView = async (videoId: string) => {
    try {
      await fetch(`/api/videos/${videoId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to increment view:', error);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <h1 className="text-3xl font-bold text-white mb-8">Media Gallery</h1>
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-zinc-800 rounded-lg mb-3"></div>
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (videos.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <h1 className="text-3xl font-bold text-white mb-8">Media Gallery</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <Play className="mx-auto h-16 w-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Videos Yet</h2>
          <p className="text-zinc-500">Videos will appear here once uploaded by admin.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Media Gallery</h1>
        <p className="text-zinc-500">{videos.length} video{videos.length !== 1 ? 's' : ''} available</p>
      </div>

      {/* Video Grid */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/media/${video.id}`}
            onClick={() => incrementView(video.id)}
            className="group"
            onMouseEnter={() => handleMouseEnter(video.id)}
            onMouseLeave={() => handleMouseLeave(video.id)}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-3">
              {/* Thumbnail (if provided) */}
              {video.thumbnailUrl && hoveredVideo !== video.id && (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Video (shows as thumbnail with first frame if no thumbnailUrl, or plays on hover) */}
              <video
                ref={(el) => { videoRefs.current[video.id] = el; }}
                src={video.videoUrl}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: video.thumbnailUrl && hoveredVideo !== video.id ? 'none' : 'block' }}
              />

              {/* Duration badge */}
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold text-white">
                {formatDuration(video.duration)}
              </div>

              {/* Play overlay */}
              {hoveredVideo !== video.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-purple-600 p-3">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Resolution badge */}
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-white">
                1080p
              </div>
            </div>

            {/* Video info */}
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-purple-400 transition">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatViews(video.views)} Views
                </span>
                <span>•</span>
                <span>{formatDuration(video.duration)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
