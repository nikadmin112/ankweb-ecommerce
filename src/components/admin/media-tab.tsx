"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Play, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

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

export function MediaTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    isActive: true,
  });

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
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingVideo ? `/api/videos/${editingVideo.id}` : '/api/videos';
      const method = editingVideo ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save video');

      toast.success(editingVideo ? 'Video updated!' : 'Video created!');
      setShowModal(false);
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save video');
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      isActive: video.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete video');
      
      toast.success('Video deleted!');
      fetchVideos();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: 0,
      isActive: true,
    });
  };

  if (loading) {
    return <div className="text-zinc-500">Loading videos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Management</h2>
          <p className="text-zinc-500">Manage video gallery content</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="rounded-lg bg-purple-600 border border-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-500 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Video
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Total Videos</p>
          <p className="mt-2 text-3xl font-bold text-white">{videos.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Total Views</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatViews(videos.reduce((sum, v) => sum + v.views, 0))}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Active Videos</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {videos.filter(v => v.isActive).length}
          </p>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <Play className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
          <p className="text-zinc-500">No videos yet. Click "Add Video" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden group"
            >
              <div className="relative aspect-video bg-zinc-900">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                )}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold text-white">
                  {formatDuration(video.duration)}
                </div>
                {!video.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold text-white">
                      Inactive
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViews(video.views)}
                  </span>
                  <span>•</span>
                  <span>{new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(video)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="rounded-lg border border-red-800/50 bg-red-950/50 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute right-4 top-4 rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Enter video title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-zinc-500 mt-1">Direct link to video file (.mp4, .webm, etc.)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Thumbnail URL <span className="text-zinc-500 text-xs">(optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <p className="text-xs text-zinc-500 mt-1">Leave empty to use video first frame as thumbnail</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  placeholder="180"
                />
                <p className="text-xs text-zinc-500 mt-1">Example: 180 seconds = 3:00 minutes</p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-white hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-purple-600 border border-purple-500 px-4 py-3 font-semibold text-white hover:bg-purple-500 transition"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
