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
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/products', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/categories', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/offers', { cache: 'no-store' }).then(res => res.json())
    ])
      .then(([productsData, categoriesData, offersData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setOffers(offersData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const refreshCategories = async () => {
    console.log('Refreshing categories...');
    try {
      const response = await fetch('/api/categories', { 
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const categoriesData = await response.json();
      console.log('Categories refreshed:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
    }
  };

  const refreshProducts = async () => {
    console.log('Refreshing products...');
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      const productsData = await response.json();
      console.log('Products refreshed:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return <div className="text-zinc-500">Loading...</div>;
    }

    switch (activeTab) {
      case 'products':
        return <ProductsTab products={products} onRefresh={refreshProducts} categories={categories} />;
      case 'categories':
        return <CategoriesTab categories={categories} onRefresh={refreshCategories} />;
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
