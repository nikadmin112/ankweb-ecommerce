"use client";

import { useState, useEffect } from 'react';
import type { Product } from '@/types';
import type { Category } from '@/lib/categories-db';
import { createProduct, deleteProduct, updateProduct } from '@/app/admin/actions';
import { Edit2, Trash2, Plus } from 'lucide-react';

export function ProductsTab({ products, onRefresh, categories: initialCategories }: { products: Product[]; onRefresh?: () => Promise<void>; categories?: Category[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);

  useEffect(() => {
    if (initialCategories) {
      setCategories(initialCategories);
    } else {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error('Failed to load categories:', err));
    }
  }, [initialCategories]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Products Management</h2>
          <p className="text-white/70">Add, edit, or remove services from your catalog</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Add product form */}
      {showAddForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <h3 className="mb-4 text-lg font-semibold text-white">Add New Service</h3>
          <form action={async (formData) => {
            await createProduct(formData);
            setShowAddForm(false);
            await onRefresh?.();
          }} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Name *
              <input
                name="name"
                required
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Price (INR) *
              <input
                name="price"
                type="number"
                step="1"
                min="1"
                required
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Category
              <select
                name="category"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Badge
              <input
                name="badge"
                placeholder="Popular / Limited / New"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-zinc-400">
              Image URL
              <input
                name="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Rating (0-5)
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="4.5"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Review Count
              <input
                name="reviewCount"
                type="number"
                min="0"
                placeholder="458"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Discount (%)
              <input
                name="discount"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="15"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-zinc-400">
              Short Description *
              <textarea
                name="description"
                required
                rows={2}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-zinc-400">
              Full Description
              <textarea
                name="fullDescription"
                rows={3}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            <div className="flex items-center gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
              >
                Create Product
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Badge</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-zinc-900">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-sm text-zinc-500">{product.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-400">{product.category || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">₹{product.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.badge ? (
                      <span className="rounded-full bg-purple-500/20 border border-purple-500/50 px-3 py-1 text-xs text-purple-400 font-medium">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(product.id)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white hover:border-purple-500/50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <form action={async (formData) => {
                        await deleteProduct(formData);
                        await onRefresh?.();
                      }}>
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-red-400 transition hover:bg-red-500/10 hover:border-red-500/50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl my-8">
            <h3 className="mb-4 text-lg font-semibold text-white">Edit Product</h3>
            <form action={async (formData) => {
              await updateProduct(formData);
              setEditingId(null);
              await onRefresh?.();
            }} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={editingId} />
              {(() => {
                const product = products.find(p => p.id === editingId);
                if (!product) return null;
                return (
                  <>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Name *
                      <input
                        name="name"
                        defaultValue={product.name}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Price (INR) *
                      <input
                        name="price"
                        type="number"
                        step="1"
                        min="1"
                        defaultValue={product.price}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Category
                      <select
                        name="category"
                        defaultValue={product.category || ''}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Badge
                      <input
                        name="badge"
                        defaultValue={product.badge || ''}
                        placeholder="Popular / Limited / New"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-2 text-sm text-zinc-400">
                      Image URL
                      <input
                        name="image"
                        type="url"
                        defaultValue={product.image || ''}
                        placeholder="https://example.com/image.jpg"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Rating (0-5)
                      <input
                        name="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        defaultValue={product.rating || ''}
                        placeholder="4.5"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Review Count
                      <input
                        name="reviewCount"
                        type="number"
                        min="0"
                        defaultValue={product.reviewCount || ''}
                        placeholder="458"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Discount (%)
                      <input
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        defaultValue={product.discount || ''}
                        placeholder="15"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-2 text-sm text-zinc-400">
                      Short Description *
                      <textarea
                        name="description"
                        defaultValue={product.description}
                        required
                        rows={2}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-2 text-sm text-zinc-400">
                      Full Description
                      <textarea
                        name="fullDescription"
                        defaultValue={product.fullDescription || ''}
                        rows={3}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                  </>
                );
              })()}
              <div className="flex gap-3 md:col-span-2">
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
