"use client";

import { useState, useEffect } from 'react';
import type { Offer } from '@/lib/offers-db';
import type { Product } from '@/types';
import { createOfferAction, updateOfferAction, deleteOfferAction } from '@/app/admin/offer-actions';
import { setProductDiscountAction, createPromoCodeAction, updatePromoCodeAction, deletePromoCodeAction } from '@/app/admin/promo-actions';
import { Edit2, Trash2, Plus, Image as ImageIcon, Tag, Percent } from 'lucide-react';

export function OffersTab({ offers }: { offers: Offer[] }) {
  const [activeSection, setActiveSection] = useState<'banners' | 'discounts' | 'promo'>('banners');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [selectedPromoType, setSelectedPromoType] = useState<string>('percentage');

  const refreshData = async () => {
    try {
      const productsRes = await fetch('/api/products', { cache: 'no-store' });
      const productsData = await productsRes.json();
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
    
    try {
      const promoRes = await fetch('/api/promo-codes', { 
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      const promoData = await promoRes.json();
      setPromoCodes(promoData);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      setPromoCodes([]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveSection('banners')}
          className={`px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'banners'
              ? 'border-b-2 border-purple-500 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Banner Offers
        </button>
        <button
          onClick={() => setActiveSection('discounts')}
          className={`px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'discounts'
              ? 'border-b-2 border-purple-500 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Product Discounts
        </button>
        <button
          onClick={() => setActiveSection('promo')}
          className={`px-4 py-2 text-sm font-semibold transition ${
            activeSection === 'promo'
              ? 'border-b-2 border-purple-500 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Promo Codes
        </button>
      </div>

      {/* Banner Offers Section */}
      {activeSection === 'banners' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Banner Offers</h2>
              <p className="text-zinc-500">Manage banner offers displayed on the shop page</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500"
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          </div>

      {/* Add offer form */}
      {showAddForm && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <h3 className="mb-4 text-lg font-semibold text-white">Add New Offer</h3>
          <form action={createOfferAction} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Offer Title *
              <input
                name="title"
                required
                placeholder="e.g., Holiday Special, Limited Time Deal"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>
            
            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Description *
              <input
                name="description"
                required
                placeholder="e.g., Get 20% off on all services"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Image URL *
              <input
                name="image"
                type="url"
                required
                placeholder="https://example.com/banner-image.jpg"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <span className="text-xs text-zinc-600">Recommended size: 1200x400px</span>
            </label>

            <label className="flex flex-col gap-2 text-sm text-zinc-400">
              Link (Optional)
              <input
                name="link"
                type="url"
                placeholder="/shop or https://example.com"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
              >
                Create Offer
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

      {/* Offers grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="relative h-48 bg-zinc-900">
              {offer.image ? (
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-white">{offer.title}</h3>
                <p className="text-sm text-white/80">{offer.description}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {offer.link && <span>Link: {offer.link}</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(offer.id)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white hover:border-purple-500/50"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <form action={deleteOfferAction}>
                  <input type="hidden" name="id" value={offer.id} />
                  <button className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-red-400 transition hover:bg-red-500/10 hover:border-red-500/50">
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
          <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Edit Offer</h3>
            <form action={updateOfferAction} className="space-y-4">
              <input type="hidden" name="id" value={editingId} />
              {(() => {
                const offer = offers.find(o => o.id === editingId);
                if (!offer) return null;
                return (
                  <>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Offer Title *
                      <input
                        name="title"
                        defaultValue={offer.title}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Description *
                      <input
                        name="description"
                        defaultValue={offer.description}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Image URL *
                      <input
                        name="image"
                        type="url"
                        defaultValue={offer.image}
                        required
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Link (Optional)
                      <input
                        name="link"
                        type="url"
                        defaultValue={offer.link || ''}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>
                  </>
                );
              })()}
              <div className="flex gap-3">
                <button
                  type="submit"
                  onClick={() => setEditingId(null)}
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
        </>
      )}

      {/* Product Discounts Section */}
      {activeSection === 'discounts' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Discounts</h2>
            <p className="text-zinc-500">Set discount percentages for individual products</p>
          </div>

          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-zinc-500">Price: ₹{product.price}</p>
                  </div>
                  <form action={async (formData) => {
                    await setProductDiscountAction(formData);
                    refreshData();
                  }} className="flex items-center gap-2">
                    <input type="hidden" name="productId" value={product.id} />
                    <input
                      type="number"
                      name="discount"
                      defaultValue={product.discount || 0}
                      min="0"
                      max="100"
                      step="1"
                      placeholder="%"
                      className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white text-center focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                    <span className="text-zinc-500">%</span>
                    <button
                      type="submit"
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
                    >
                      Set Discount
                    </button>
                  </form>
                </div>
                {product.discount && product.discount > 0 && (
                  <div className="mt-2 text-sm text-purple-400">
                    Active: {product.discount}% off = ₹{(product.price * (1 - product.discount / 100)).toFixed(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Codes Section */}
      {activeSection === 'promo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Promo Codes</h2>
              <p className="text-zinc-500">Create and manage discount promo codes</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 border border-purple-500"
            >
              <Plus className="h-4 w-4" />
              Add Promo Code
            </button>
          </div>

          {showAddForm && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-semibold text-white">Create Promo Code</h3>
              <form action={async (formData) => {
                try {
                  await createPromoCodeAction(formData);
                  setShowAddForm(false);
                  await refreshData();
                } catch (error: any) {
                  alert(error.message || 'Failed to create promo code');
                }
              }} className="space-y-4">
                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Promo Code *
                  <input
                    name="code"
                    required
                    placeholder="e.g., SAVE20, WELCOME10"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white uppercase placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Offer Type *
                  <select
                    name="type"
                    required
                    value={selectedPromoType}
                    onChange={(e) => setSelectedPromoType(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="bogo">Buy 1 Get 1 Free</option>
                    <option value="free_service">Free Service</option>
                  </select>
                </label>

                {selectedPromoType === 'percentage' && (
                  <label className="flex flex-col gap-2 text-sm text-zinc-400">
                    Discount Percentage *
                    <input
                      name="value"
                      type="number"
                      min="1"
                      max="100"
                      required
                      placeholder="e.g., 20 for 20% off"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                  </label>
                )}

                {selectedPromoType === 'bogo' && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-400">Buy 1 Get 1 Free: Customer pays for the higher-priced item and gets the lower-priced item free.</p>
                    <input type="hidden" name="value" value="1" />
                  </div>
                )}

                {selectedPromoType === 'free_service' && (
                  <label className="flex flex-col gap-2 text-sm text-zinc-400">
                    Select Free Product *
                    <select
                      name="value"
                      required
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    >
                      <option value="">Choose a product...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₹{product.price}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Description
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="e.g., Get 20% off on all services"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Minimum Cart Value (Optional)
                  <input
                    name="minCartValue"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g., 1000 (leave empty for no minimum)"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
                  >
                    Create Promo Code
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

          <div className="space-y-3">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-purple-400" />
                      <span className="text-lg font-bold text-white">{promo.code}</span>
                      <span className={`text-xs px-2 py-1 rounded ${promo.is_active ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-red-600/20 text-red-400 border border-red-500/50'}`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-purple-600/20 border border-purple-500/50 px-2 py-1 text-xs font-medium text-purple-400">
                        {promo.discount_type === 'percentage' && `${promo.discount_value}% OFF`}
                        {promo.discount_type === 'fixed' && `₹${promo.discount_value} OFF`}
                        {promo.discount_type === 'bogo' && 'BUY 1 GET 1 FREE'}
                        {promo.discount_type === 'free_service' && 'FREE SERVICE'}
                      </span>
                      <span className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs font-medium text-zinc-400">
                        Type: {promo.discount_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPromoId(promo.id)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-700 hover:text-white hover:border-purple-500/50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <form action={async (formData) => {
                      await deletePromoCodeAction(formData);
                      await refreshData();
                    }}>
                      <input type="hidden" name="id" value={promo.id} />
                      <button type="submit" className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-red-400 transition hover:bg-red-500/10 hover:border-red-500/50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Promo Code Modal */}
          {editingPromoId && (() => {
            const promo = promoCodes.find(p => p.id === editingPromoId);
            if (!promo) return null;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                  <h3 className="mb-4 text-lg font-semibold text-white">Edit Promo Code</h3>
                  <form action={async (formData) => {
                    try {
                      await updatePromoCodeAction(formData);
                      setEditingPromoId(null);
                      await refreshData();
                    } catch (error: any) {
                      alert(error.message || 'Failed to update promo code');
                    }
                  }} className="space-y-4">
                    <input type="hidden" name="id" value={promo.id} />
                    
                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Promo Code *
                      <input
                        name="code"
                        required
                        defaultValue={promo.code}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white uppercase focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Discount Type *
                      <select
                        name="type"
                        required
                        defaultValue={promo.discount_type}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      >
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-2 text-sm text-zinc-400">
                      Discount Value *
                      <input
                        name="value"
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        defaultValue={promo.discount_value}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      />
                    </label>

                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                      <input
                        type="checkbox"
                        name="is_active"
                        value="true"
                        defaultChecked={promo.is_active}
                        className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                      />
                      Active
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 border border-purple-500"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPromoId(null)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
