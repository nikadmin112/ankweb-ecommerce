"use client";

import { useEffect, useState } from 'react';
import { AdminGate } from '@/components/admin-gate';
import { AdminLayout } from '@/components/admin-layout';
import { ProductsTab } from '@/components/admin/products-tab';
import { CategoriesTab } from '@/components/admin/categories-tab';
import { OffersTab } from '@/components/admin/offers-tab';
import { MediaTab } from '@/components/admin/media-tab';
import { PaymentSettingsTab } from '@/components/admin/payment-settings-tab';
import { CryptoSettingsTab } from '@/components/admin/crypto-settings-tab';
import { OrdersTab, UsersTab, AnalyticsTab, SettingsTab } from '@/components/admin/admin-tabs';
import type { Product } from '@/types';
import type { Category } from '@/lib/categories-db';
import type { Offer } from '@/lib/offers-db';

type Tab = 'products' | 'categories' | 'offers' | 'media' | 'orders' | 'payments' | 'crypto' | 'users' | 'analytics' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/offers').then(res => res.json())
    ])
      .then(([productsData, categoriesData, offersData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setOffers(offersData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const renderTabContent = () => {
    if (loading) {
      return <div className="text-zinc-500">Loading...</div>;
    }

    switch (activeTab) {
      case 'products':
        return <ProductsTab products={products} />;
      case 'categories':
        return <CategoriesTab categories={categories} />;
      case 'offers':
        return <OffersTab offers={offers} />;
      case 'media':
        return <MediaTab />;
      case 'orders':
        return <OrdersTab />;
      case 'payments':
        return <PaymentSettingsTab />;
      case 'crypto':
        return <CryptoSettingsTab />;
      case 'users':
        return <UsersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProductsTab products={products} />;
    }
  };

  return (
    <AdminGate>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </AdminLayout>
    </AdminGate>
  );
}
