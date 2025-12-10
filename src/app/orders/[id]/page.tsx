"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCurrency } from '@/components/currency-context';
import { CheckCircle, Package, Truck, Clock, XCircle, Printer, Download } from 'lucide-react';
import type { Order } from '@/lib/orders-db';
import toast from 'react-hot-toast';

const statusConfig = {
  'pending-payment': { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-600/10', border: 'border-orange-600/30', label: 'Pending Payment' },
  'order-placed': { icon: Package, color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/30', label: 'Order Placed' },
  'payment-done': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-600/10', border: 'border-yellow-600/30', label: 'Payment Done' },
  'payment-confirmed': { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-600/30', label: 'Payment Confirmed' },
  'order-successful': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/10', border: 'border-green-600/30', label: 'Order Successful' },
  'delivered': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-700/10', border: 'border-green-700/30', label: 'Delivered' },
  'cancelled': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-600/10', border: 'border-red-600/30', label: 'Cancelled' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    
    // Poll for order updates every 5 seconds
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) throw new Error('Order not found');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="text-center text-zinc-500">Loading order...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">Order not found</h1>
          <Link href="/orders" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
            View all orders
          </Link>
        </div>
      </main>
    );
  }

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice, #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10 sm:px-6 lg:py-14">
        {/* Header */}
        <div className="mb-6 sm:mb-8 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Order Details</h1>
              <p className="text-sm sm:text-base text-zinc-400">Order #{order.orderNumber}</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={printInvoice}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 transition"
              >
                <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Print Invoice</span>
                <span className="sm:hidden">Print</span>
              </button>
              <Link
                href="/orders"
                className="flex items-center rounded-lg bg-purple-600 border border-purple-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-purple-500 transition"
              >
                <span className="hidden sm:inline">View All Orders</span>
                <span className="sm:hidden">All Orders</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Invoice */}
        <div id="invoice" className="space-y-6">
          {/* Order Status */}
          <div className={`rounded-xl ${statusConfig[order.status].bg} border ${statusConfig[order.status].border} p-6`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`h-8 w-8 ${statusConfig[order.status].color}`} />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Order {statusConfig[order.status].label}
                </h2>
                <p className="text-sm text-zinc-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6 no-print overflow-hidden">
            <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1 sm:gap-0">
              {(['order-placed', 'payment-done', 'payment-confirmed', 'order-successful', 'delivered'] as const).map((status, idx) => {
                // Full status order including pending-payment
                const fullStatusOrder = ['pending-payment', 'order-placed', 'payment-done', 'payment-confirmed', 'order-successful', 'delivered'];
                // Get the index of current order status in full order
                const currentStatusIndex = fullStatusOrder.indexOf(order.status);
                // Get the index of this displayed status in full order
                const thisStatusIndex = fullStatusOrder.indexOf(status);
                // This status is passed if current order status is at or beyond this status
                const isPassed = currentStatusIndex >= thisStatusIndex;
                const Icon = statusConfig[status].icon;
                
                console.log('Progress:', { status, currentStatus: order.status, currentStatusIndex, thisStatusIndex, isPassed });
                
                return (
                  <div key={status} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center min-w-[70px] sm:min-w-[90px]">
                      <div className={`rounded-full p-2 sm:p-3 ${isPassed ? statusConfig[status].bg + ' ' + statusConfig[status].border : 'bg-zinc-900 border-zinc-800'} border`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isPassed ? statusConfig[status].color : 'text-zinc-600'}`} />
                      </div>
                      <p className={`mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-center ${isPassed ? 'text-white' : 'text-zinc-600'}`}>
                        {statusConfig[status].label.split(' ').map((word, i) => (
                          <span key={i} className="block sm:inline">{word}{' '}</span>
                        ))}
                      </p>
                    </div>
                    {idx < 4 && (
                      <div className={`h-0.5 w-6 sm:w-12 mx-1 sm:mx-2 flex-shrink-0 ${isPassed ? 'bg-purple-500' : 'bg-zinc-800'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer & Order Info */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-zinc-500">Name:</span>
                  <span className="ml-2 text-white font-medium">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span>
                  <span className="ml-2 text-white font-medium">{order.customerEmail}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Order ID:</span>
                  <span className="ml-2 text-white font-mono text-xs">{order.id}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap">
                  <span className="text-zinc-500">Method:</span>
                  <span className="ml-2 text-white font-medium capitalize break-all">
                    {order.paymentMethod || 'Not specified'}
                  </span>
                </div>
                {order.promoCode && (
                  <div className="flex flex-wrap">
                    <span className="text-zinc-500">Promo Code:</span>
                    <span className="ml-2 text-green-400 font-semibold">{order.promoCode}</span>
                  </div>
                )}
                <div className="flex flex-wrap">
                  <span className="text-zinc-500">Last Updated:</span>
                  <span className="ml-2 text-white font-medium">
                    {new Date(order.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Order Items</h3>
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 sm:gap-4 border-b border-zinc-800 pb-3 sm:pb-4 last:border-0 last:pb-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover bg-zinc-900 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm sm:text-base truncate">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-zinc-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-white text-sm sm:text-base">{formatPrice(item.price * item.quantity)}</p>
                    {item.discount && (
                      <p className="text-xs text-zinc-500 line-through">
                        {formatPrice((item.price / (1 - item.discount / 100)) * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-zinc-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Discount</span>
                  <span className="text-green-400 font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-800">
                <span className="text-white">Total</span>
                <span className="text-purple-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Order Notes</h3>
              <p className="text-zinc-400">{order.notes}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
