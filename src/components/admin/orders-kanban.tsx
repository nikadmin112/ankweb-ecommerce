"use client";

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Eye, ExternalLink, Package, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { Order } from '@/lib/orders-db';
import Image from 'next/image';

const statusConfig = {
  'order-placed': { icon: Package, color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/30', label: 'Order Placed' },
  'payment-done': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-600/10', border: 'border-yellow-600/30', label: 'Payment Done' },
  'payment-confirmed': { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-600/30', label: 'Payment Confirmed' },
  'order-successful': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/10', border: 'border-green-600/30', label: 'Order Successful' },
  'delivered': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-700/10', border: 'border-green-700/30', label: 'Delivered' },
  'cancelled': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-600/10', border: 'border-red-600/30', label: 'Cancelled' },
};

interface OrdersKanbanProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: Order['status']) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export function OrdersKanban({ orders, onStatusChange, onDeleteOrder }: OrdersKanbanProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const columns: Order['status'][] = ['order-placed', 'payment-done', 'payment-confirmed', 'order-successful', 'delivered', 'cancelled'];
  
  const ordersByStatus = columns.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status);
    return acc;
  }, {} as Record<Order['status'], Order[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Order['status'];
    await onStatusChange(draggableId, newStatus);
  };

  const handleDoubleClick = (orderId: string) => {
    window.open(`/orders/${orderId}`, '_blank');
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((status) => {
            const StatusIcon = statusConfig[status].icon;
            const columnOrders = ordersByStatus[status] || [];

            return (
              <div key={status} className="flex-shrink-0 w-80">
                <div className={`rounded-lg ${statusConfig[status].bg} border ${statusConfig[status].border} p-3 mb-3`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${statusConfig[status].color}`} />
                    <h3 className={`font-semibold ${statusConfig[status].color}`}>
                      {statusConfig[status].label}
                    </h3>
                    <span className="ml-auto rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white">
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[500px] rounded-lg border-2 border-dashed p-2 transition ${
                        snapshot.isDraggingOver
                          ? 'border-purple-500 bg-purple-600/5'
                          : 'border-zinc-800 bg-zinc-950/50'
                      }`}
                    >
                      <div className="space-y-2">
                        {columnOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onDoubleClick={() => handleDoubleClick(order.id)}
                                className={`rounded-lg border bg-zinc-950 p-3 cursor-move transition ${
                                  snapshot.isDragging
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 rotate-2 scale-105'
                                    : 'border-zinc-800 hover:border-purple-500/50'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                      #{order.orderNumber}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">
                                      {order.customerName}
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 ml-2">
                                    {order.paymentScreenshot && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedScreenshot(order.paymentScreenshot!);
                                        }}
                                        className="rounded p-1 hover:bg-zinc-800 transition"
                                        title="View Screenshot"
                                      >
                                        <Eye className="h-4 w-4 text-zinc-400" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/orders/${order.id}`, '_blank');
                                      }}
                                      className="rounded p-1 hover:bg-zinc-800 transition"
                                      title="Open Order"
                                    >
                                      <ExternalLink className="h-4 w-4 text-zinc-400" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm(order.id);
                                      }}
                                      className="rounded p-1 hover:bg-red-900/50 transition"
                                      title="Delete Order"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-400" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1 mb-2">
                                  {order.items.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                      {item.image && (
                                        <div className="relative h-8 w-8 rounded bg-zinc-900 flex-shrink-0">
                                          <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover rounded"
                                          />
                                        </div>
                                      )}
                                      <p className="text-xs text-zinc-400 truncate flex-1">
                                        {item.name}
                                      </p>
                                    </div>
                                  ))}
                                  {order.items.length > 2 && (
                                    <p className="text-xs text-zinc-500 pl-10">
                                      +{order.items.length - 2} more
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                  <span className="text-lg font-bold text-purple-400">
                                    ₹{order.total.toFixed(0)}
                                  </span>
                                  <span className="text-xs text-zinc-500">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -right-4 -top-4 rounded-full bg-zinc-900 p-2 text-white hover:bg-zinc-800 transition shadow-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedScreenshot}
              alt="Payment Screenshot"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
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
                onClick={() => {
                  onDeleteOrder(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 rounded-lg border border-red-800/50 bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
