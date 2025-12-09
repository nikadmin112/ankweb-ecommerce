import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  views: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const videosFilePath = join(process.cwd(), 'data', 'videos.json');

function readVideos(): Video[] {
  try {
    const data = readFileSync(videosFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeVideos(videos: Video[]): void {
  writeFileSync(videosFilePath, JSON.stringify(videos, null, 2));
}

export function getAllVideos(): Video[] {
  return readVideos().filter(v => v.isActive);
}

export function getVideoById(id: string): Video | null {
  const videos = readVideos();
  return videos.find(v => v.id === id) || null;
}

export function createVideo(videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Video {
  const videos = readVideos();
  const newVideo: Video = {
    ...videoData,
    id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  videos.push(newVideo);
  writeVideos(videos);
  return newVideo;
}

export function updateVideo(id: string, updates: Partial<Video>): Video | null {
  const videos = readVideos();
  const index = videos.findIndex(v => v.id === id);
  if (index === -1) return null;

  videos[index] = {
    ...videos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeVideos(videos);
  return videos[index];
}

export function deleteVideo(id: string): boolean {
  const videos = readVideos();
  const filtered = videos.filter(v => v.id !== id);
  if (filtered.length === videos.length) return false;
  writeVideos(filtered);
  return true;
}

export function incrementViews(id: string): boolean {
  const videos = readVideos();
  const index = videos.findIndex(v => v.id === id);
  if (index === -1) return false;

  videos[index].views += 1;
  videos[index].updatedAt = new Date().toISOString();
  writeVideos(videos);
  return true;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return views.toString();
}
