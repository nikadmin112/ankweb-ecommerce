import { getServiceClient } from './supabase';

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

// Database uses snake_case, TypeScript uses camelCase
interface DbVideo {
  id: string;
  title: string;
  description?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  duration: number;
  views: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

function fromDbVideo(v: DbVideo): Video {
  return {
    id: v.id,
    title: v.title,
    description: v.description ?? '',
    videoUrl: v.video_url,
    thumbnailUrl: v.thumbnail_url ?? undefined,
    duration: v.duration,
    views: v.views ?? 0,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
    isActive: !!v.is_active,
  };
}

function toDbVideo(updates: Partial<Video>): any {
  const { videoUrl, thumbnailUrl, createdAt, updatedAt, isActive, ...rest } = updates;
  return {
    ...rest,
    ...(typeof videoUrl === 'string' ? { video_url: videoUrl } : {}),
    ...(typeof thumbnailUrl === 'string' || thumbnailUrl === null ? { thumbnail_url: thumbnailUrl } : {}),
    ...(typeof isActive === 'boolean' ? { is_active: isActive } : {}),
    ...(typeof createdAt === 'string' ? { created_at: createdAt } : {}),
    ...(typeof updatedAt === 'string' ? { updated_at: updatedAt } : {}),
  };
}

export async function getAllVideos(): Promise<Video[]> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(fromDbVideo);
}

export async function getVideoById(id: string): Promise<Video | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data ? fromDbVideo(data as any) : null;
}

export async function createVideo(videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Video> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const id = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const insertRow = {
    id,
    title: videoData.title,
    description: videoData.description ?? '',
    video_url: videoData.videoUrl,
    thumbnail_url: videoData.thumbnailUrl ?? null,
    duration: videoData.duration,
    views: 0,
    is_active: videoData.isActive,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('videos')
    .insert([insertRow] as any)
    .select('*')
    .single();

  if (error) throw error;
  return fromDbVideo(data as any);
}

export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video | null> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const dbUpdates = toDbVideo({ ...updates, updatedAt: new Date().toISOString() });

  const { data, error } = await supabase
    .from('videos')
    .update(dbUpdates as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return null;
  return data ? fromDbVideo(data as any) : null;
}

export async function deleteVideo(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  return !error;
}

export async function incrementViews(id: string): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  const { data: existing, error: readError } = await supabase
    .from('videos')
    .select('views')
    .eq('id', id)
    .single();

  if (readError || !existing) return false;
  const nextViews = Number((existing as any).views || 0) + 1;

  const { error: updateError } = await supabase
    .from('videos')
    .update({ views: nextViews, updated_at: new Date().toISOString() } as any)
    .eq('id', id);

  return !updateError;
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
