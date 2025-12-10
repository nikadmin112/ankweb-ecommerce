"use client";

import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: 'products' | 'banners' | 'categories';
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
  required = false,
  helpText
}: ImageUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();
      onChange(url);
      setPreview(url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreview(url);
  };

  const clearImage = () => {
    onChange('');
    setPreview('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition rounded ${
            mode === 'url'
              ? 'bg-purple-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition rounded ${
            mode === 'upload'
              ? 'bg-purple-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* URL Input */}
      {mode === 'url' && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            required={required && !value}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
          {helpText && <p className="text-xs text-zinc-500">{helpText}</p>}
        </div>
      )}

      {/* File Upload */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900 px-6 py-8 transition hover:border-purple-500/50 hover:bg-zinc-900/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                <span className="text-sm text-zinc-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">
                  Click to upload or drag and drop
                </span>
              </>
            )}
          </label>
          <p className="text-xs text-zinc-500">
            PNG, JPG, GIF up to 5MB. {helpText}
          </p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-2">
          <div className="relative aspect-video w-full overflow-hidden rounded bg-zinc-950">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain"
              onError={() => {
                setPreview('');
                toast.error('Failed to load image preview');
              }}
            />
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-full border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="mt-2 truncate text-xs text-zinc-500">{value}</p>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="image" value={value} />
    </div>
  );
}
