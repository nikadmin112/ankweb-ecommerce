"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { useCurrency } from '@/components/currency-context';
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import type { Order } from '@/lib/orders-db';

const statusConfig = {
  'order-placed': { icon: Package, color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/30' },
  'payment-done': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-600/10', border: 'border-yellow-600/30' },
  'payment-confirmed': { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-600/30' },
  'order-successful': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/10', border: 'border-green-600/30' },
  'delivered': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-700/10', border: 'border-green-700/30' },
  'cancelled': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-600/10', border: 'border-red-600/30' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?customerId=${user?.id || 'guest'}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="text-center text-zinc-500">Loading orders...</div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-zinc-700" />
          <h1 className="mt-4 text-3xl font-bold text-white">No orders yet</h1>
          <p className="mt-2 text-zinc-400">Start shopping to see your orders here</p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-lg bg-purple-600 border border-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500"
          >
            Browse Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block"
            >
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 hover:border-purple-500/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className={`flex items-center gap-2 rounded-full ${statusConfig[order.status].bg} border ${statusConfig[order.status].border} px-3 py-1`}>
                    <StatusIcon className={`h-4 w-4 ${statusConfig[order.status].color}`} />
                    <span className={`text-sm font-semibold ${statusConfig[order.status].color}`}>
                      {order.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover bg-zinc-900"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-zinc-500 pl-15">
                      +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-500">Total Amount</p>
                    <p className="text-xl font-bold text-purple-400">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition">
                    <span className="text-sm font-semibold">View Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
