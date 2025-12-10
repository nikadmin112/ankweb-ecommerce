"use client";

import { useState } from 'react';
import type { Category } from '@/lib/categories-db';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/admin/category-actions';
import { Edit2, Trash2, Plus } from 'lucide-react';

const AVAILABLE_ICONS = [
  'MessageSquare', 'FileCheck', 'Settings', 'Package', 'Briefcase', 
  'Users', 'Heart', 'Star', 'Zap', 'Gift', 'Camera', 'Music',
  'Palette', 'Scissors', 'Dumbbell', 'Baby', 'Sparkles'
];

export function CategoriesTab({ categories, onRefresh }: { categories: Category[]; onRefresh?: () => Promise<void> }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customIcon, setCustomIcon] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Categories Management</h2>
          <p className="text-zinc-500">Manage product categories and their icons</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add category form */}
      {showAddForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <h3 className="mb-4 text-lg font-semibold text-white">Add New Category</h3>
          <form 
            action={async (formData) => {
              await createCategoryAction(formData);
              setShowAddForm(false);
              setCustomIcon('');
              await onRefresh?.();
            }} 
            className="space-y-4"
          >
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Category Name *
              <input
                name="name"
                required
                placeholder="e.g., Consulting, Web Development"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            
            <div className="space-y-2">
              <label className="block text-sm text-zinc-400">
                Select Icon *
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_ICONS.map((iconName) => (
                  <label key={iconName} className="relative">
                    <input
                      type="radio"
                      name="icon"
                      value={iconName}
                      required={!customIcon}
                      className="peer sr-only"
                    />
                    <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-zinc-800 bg-zinc-900 p-3 cursor-pointer transition hover:border-purple-500/50 peer-checked:border-purple-500 peer-checked:bg-purple-600/20">
                      <span className="text-xs text-zinc-500 peer-checked:text-purple-400">{iconName}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Or Custom Icon URL
              <input
                name="icon"
                type="url"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="https://example.com/icon.svg"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
              >
                Create Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setCustomIcon('');
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/50">
                  <span className="text-sm text-purple-400">{category.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  <p className="text-xs text-zinc-500">Icon: {category.icon}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(category.id)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white hover:border-purple-500/50"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <form action={async (formData) => {
                  await deleteCategoryAction(formData);
                  await onRefresh?.();
                }}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-red-400 transition hover:bg-red-500/10 hover:border-red-500/50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Edit Category</h3>
            <form action={async (formData) => {
              await updateCategoryAction(formData);
              setEditingId(null);
              await onRefresh?.();
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingId} />
              {(() => {
                const category = categories.find(c => c.id === editingId);
                if (!category) return null;
                return (
                  <>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Category Name *
                      <input
                        name="name"
                        defaultValue={category.name}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Icon Name *
                      <input
                        name="icon"
                        defaultValue={category.icon}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                  </>
                );
              })()}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
