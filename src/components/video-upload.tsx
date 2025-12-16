"use client";

import { useMemo, useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type Mode = 'url' | 'upload';

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function VideoUpload({ label = 'Video', value, onChange, disabled }: Props) {
  const [mode, setMode] = useState<Mode>(value ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET;
  const canUpload = !!cloudName && !!uploadPreset;

  const previewUrl = useMemo(() => value?.trim(), [value]);

  const uploadToCloudinary = async (file: File) => {
    if (!canUpload) {
      toast.error('Video upload is not configured. Please paste a video URL instead.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', uploadPreset!);
      fd.append('folder', 'ankweb/videos');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || 'Upload failed');
      }

      const url = json?.secure_url as string | undefined;
      if (!url) throw new Error('Upload succeeded but no URL returned');

      onChange(url);
      toast.success('Video uploaded');
    } catch (e: any) {
      console.error('Cloudinary upload failed:', e);
      toast.error(e?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">{label} *</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              mode === 'url'
                ? 'border-purple-500 bg-purple-600 text-white'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
            disabled={disabled || uploading}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Use Link
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              mode === 'upload'
                ? 'border-purple-500 bg-purple-600 text-white'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
            disabled={disabled || uploading}
            title={canUpload ? 'Upload a video file' : 'Upload not configured'}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div>
          <input
            type="url"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || uploading}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            placeholder="https://example.com/video.mp4"
          />
          <p className="text-xs text-zinc-500 mt-1">Paste a direct video URL (mp4/webm) or upload via Cloudinary.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          {!canUpload && (
            <p className="text-xs text-zinc-400 mb-3">
              Upload needs Cloudinary env vars. Until then, use the link option.
            </p>
          )}
          <input
            type="file"
            accept="video/*"
            disabled={disabled || uploading || !canUpload}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadToCloudinary(file);
            }}
            className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-500"
          />
          <p className="mt-2 text-xs text-zinc-500">Uploads directly to Cloudinary (no Supabase storage, no Vercel upload limit).</p>
        </div>
      )}

      {previewUrl && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <p className="text-xs text-zinc-500 mb-2">Preview</p>
          <video src={previewUrl} controls className="w-full rounded-lg" preload="metadata" />
        </div>
      )}
    </div>
  );
}
