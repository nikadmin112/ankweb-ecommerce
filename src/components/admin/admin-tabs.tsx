"use client";

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Eye, LayoutGrid, List, Trash2 } from 'lucide-react';
import type { Order } from '@/lib/orders-db';
import Link from 'next/link';
import { OrdersKanban } from './orders-kanban';

const statusConfig = {
  'pending-payment': { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-600/10', border: 'border-orange-600/30', label: 'Pending Payment' },
  'order-placed': { icon: Package, color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/30', label: 'Order Placed' },
  'payment-done': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-600/10', border: 'border-yellow-600/30', label: 'Payment Done' },
  'payment-confirmed': { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-600/30', label: 'Payment Confirmed' },
  'order-successful': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/10', border: 'border-green-600/30', label: 'Order Successful' },
  'delivered': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-700/10', border: 'border-green-700/30', label: 'Delivered' },
  'cancelled': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-600/10', border: 'border-red-600/30', label: 'Cancelled' },
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    // Load view preference from localStorage
    const savedView = localStorage.getItem('ordersViewMode');
    if (savedView === 'kanban' || savedView === 'list') {
      setViewMode(savedView);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOrders();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const toggleViewMode = (mode: 'list' | 'kanban') => {
    setViewMode(mode);
    localStorage.setItem('ordersViewMode', mode);
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const stats = {
    total: orders.length,
    pendingPayment: orders.filter(o => o.status === 'pending-payment').length,
    orderPlaced: orders.filter(o => o.status === 'order-placed').length,
    paymentDone: orders.filter(o => o.status === 'payment-done').length,
    paymentConfirmed: orders.filter(o => o.status === 'payment-confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered' || o.status === 'order-successful').reduce((sum, o) => sum + o.total, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-zinc-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders Management</h2>
          <p className="text-zinc-500">View and manage customer orders</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => toggleViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition rounded ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => toggleViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition rounded ${
              viewMode === 'kanban'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-orange-600/30 bg-orange-600/10 p-4">
          <p className="text-sm text-orange-400">Pending Payment</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.pendingPayment}</p>
        </div>
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4">
          <p className="text-sm text-yellow-400">Payment Done</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.paymentDone}</p>
        </div>
        <div className="rounded-lg border border-purple-600/30 bg-purple-600/10 p-4">
          <p className="text-sm text-purple-400">To Confirm</p>
          <p className="mt-2 text-3xl font-bold text-white">{stats.paymentConfirmed}</p>
        </div>
        <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-4">
          <p className="text-sm text-green-400">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-white">₹{stats.revenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <OrdersKanban orders={orders} onStatusChange={updateOrderStatus} onDeleteOrder={deleteOrder} />
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto">
            {['all', 'pending-payment', 'order-placed', 'payment-done', 'payment-confirmed', 'order-successful', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                  filterStatus === status
                    ? 'border-b-2 border-purple-500 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {status === 'all' ? 'All' : status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-700" />
              <p className="mt-4 text-zinc-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="text-zinc-500 hover:text-white transition"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-white">#{order.orderNumber}</h3>
                        <div className={`flex items-center gap-1 rounded-full ${statusConfig[order.status].bg} border ${statusConfig[order.status].border} px-2 py-0.5`}>
                          <StatusIcon className={`h-3 w-3 ${statusConfig[order.status].color}`} />
                          <span className={`text-xs font-semibold ${statusConfig[order.status].color}`}>
                            {statusConfig[order.status].label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
                        <span className="truncate">{order.customerName}</span>
                        <span>•</span>
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-white">₹{order.total.toFixed(0)}</p>
                      <p className="text-xs text-zinc-500">{order.paymentMethod || 'N/A'}</p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      target="_blank"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 hover:bg-zinc-800 transition"
                      title="View Invoice"
                    >
                      <Eye className="h-4 w-4 text-zinc-400" />
                    </Link>

                    <button
                      onClick={() => setDeleteConfirm(order.id)}
                      className="rounded-lg border border-red-800/50 bg-red-950/50 p-2 hover:bg-red-900/50 transition"
                      title="Delete Order"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-zinc-900" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{item.name}</p>
                              <p className="text-zinc-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-white font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Customer</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-zinc-400 break-all">
                          <span className="text-zinc-500">Email:</span> {order.customerEmail}
                        </p>
                        {order.customerPhone && (
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Phone:</span> {order.customerPhone}
                          </p>
                        )}
                        {order.paymentNationality && (
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Payment Type:</span>{' '}
                            <span className="capitalize">{order.paymentNationality}</span>
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Notes:</span> {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Screenshot */}
                    {order.paymentScreenshot && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Payment Screenshot</h4>
                        <a
                          href={order.paymentScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={order.paymentScreenshot}
                            alt="Payment Screenshot"
                            className="w-full max-w-xs rounded-lg border border-zinc-800 hover:border-purple-500 transition cursor-pointer"
                          />
                        </a>
                        <p className="text-xs text-zinc-500 mt-2">Click to view full size</p>
                      </div>
                    )}

                    {/* Status Update */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Update Status</h4>
                      <div className="flex gap-2 flex-wrap">
                        {(['pending-payment', 'order-placed', 'payment-done', 'payment-confirmed', 'order-successful', 'delivered', 'cancelled'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={order.status === status}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                              order.status === status
                                ? `${statusConfig[status].bg} ${statusConfig[status].border} ${statusConfig[status].color} cursor-default`
                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                            }`}
                          >
                            {statusConfig[status].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Delete Order?</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 font-semibold text-white hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOrder(deleteConfirm)}
                className="flex-1 rounded-lg border border-red-800/50 bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UsersTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Users Management</h2>
        <p className="text-zinc-500">View and manage registered users</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
        <p className="text-zinc-500">User management coming soon. Integrate Supabase Auth to view users.</p>
      </div>
    </div>
  );
}

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <p className="text-zinc-500">Track sales, revenue, and performance metrics</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: '$0', change: '+0%' },
          { label: 'Orders', value: '0', change: '+0%' },
          { label: 'Products', value: '3', change: '—' },
          { label: 'Customers', value: '0', change: '+0%' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-purple-400">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
        <p className="text-zinc-500">Advanced analytics charts coming soon.</p>
      </div>
    </div>
  );
}

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-500">Configure your store settings</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white">General Settings</h3>
          <p className="mt-2 text-sm text-zinc-500">Store name, description, and contact information</p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white">Payment Settings</h3>
          <p className="mt-2 text-sm text-zinc-500">Configure payment gateways and checkout options</p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
          <p className="mt-2 text-sm text-zinc-500">Customize order confirmation and notification emails</p>
        </div>
      </div>
    </div>
  );
}
