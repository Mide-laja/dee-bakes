'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Eye,
  FileCheck,
  AlertCircle,
  Truck,
  Building2,
  X,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Edit,
  ShoppingBag,
} from 'lucide-react';
import { DBStore, storeEvents } from '@/lib/store';
import {
  formatCurrency,
  formatDate,
  createWhatsAppLink,
  formatOrderWhatsAppMessage,
} from '@/lib/utils';
import { Order, OrderStatus, PaymentStatus } from '@/types';

function OrdersContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const initialOrderId = searchParams.get('id');

  const [orders, setOrders] = useState<Order[]>(DBStore.getOrders());
  const [settings, setSettings] = useState(DBStore.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterParam === 'verification' ? 'verification' : 'all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Verification modal state
  const [adminNote, setAdminNote] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const unsub = storeEvents.subscribe('orders', () => {
      const fresh = DBStore.getOrders();
      setOrders(fresh);
      if (selectedOrder) {
        const updated = fresh.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    });
    return unsub;
  }, [selectedOrder]);

  useEffect(() => {
    if (initialOrderId) {
      const found = orders.find((o) => o.id === initialOrderId || o.order_reference === initialOrderId);
      if (found) setSelectedOrder(found);
    }
  }, [initialOrderId, orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        order.order_reference.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_phone.includes(q);

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'verification') {
        matchesStatus =
          order.payment_status === 'payment_evidence_submitted' ||
          order.payment_status === 'payment_pending_verification';
      } else if (statusFilter === 'awaiting_payment') {
        matchesStatus = order.payment_status === 'awaiting_payment';
      } else if (statusFilter === 'confirmed') {
        matchesStatus = order.payment_status === 'payment_confirmed';
      } else if (statusFilter !== 'all') {
        matchesStatus = order.order_status === statusFilter;
      }

      return matchesQuery && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    DBStore.updateOrderStatus(orderId, newStatus, `Order status updated to ${newStatus} by Dee`);
  };

  const handleConfirmPayment = (orderId: string) => {
    setIsVerifying(true);
    DBStore.updateOrderPayment(orderId, 'payment_confirmed', {
      adminNote: adminNote.trim() || 'Payment confirmed by Dee on bank portal.',
    });
    // Auto-advance order status to accepted if currently new
    if (selectedOrder?.order_status === 'new') {
      DBStore.updateOrderStatus(orderId, 'accepted', 'Payment received; kitchen accepted order');
    }
    setAdminNote('');
    setIsVerifying(false);
  };

  const handleRejectPayment = (orderId: string) => {
    const reason = prompt('Please enter reason for rejection (will be saved in internal notes):');
    if (reason !== null) {
      DBStore.updateOrderPayment(orderId, 'payment_rejected', {
        adminNote: `Payment rejected by Dee: ${reason}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-caramel dark:text-sand">
            Orders & Payments
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory mt-0.5">
            Order Management
          </h1>
          <p className="text-xs text-espresso/60 dark:text-ivory/60">
            Verify bank transfers, update preparation status, and contact customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-caramel/15 text-caramel">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order reference (e.g. DB-2026-1049), name or phone..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-espresso-800 border border-caramel/20 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'verification', label: '⚡ Pending Bank Verification' },
            { id: 'awaiting_payment', label: '⏳ Awaiting Transfer' },
            { id: 'confirmed', label: '✅ Payment Confirmed' },
            { id: 'new', label: 'New' },
            { id: 'preparing', label: 'In Kitchen' },
            { id: 'ready_for_pickup', label: 'Ready / Dispatched' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-caramel text-ivory shadow-sm'
                  : 'bg-white/80 dark:bg-espresso-800/80 text-espresso/70 dark:text-ivory/70 border border-caramel/15 hover:border-caramel'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-espresso-800/60 rounded-3xl border border-caramel/15 p-6">
            <ShoppingBag className="w-8 h-8 text-caramel/50 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
              No orders found
            </h3>
            <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1">
              Try changing the search query or active filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isConfirmed = order.payment_status === 'payment_confirmed';
            const isVerificationNeeded =
              order.payment_status === 'payment_evidence_submitted' ||
              order.payment_status === 'payment_pending_verification';

            const whatsappMessage = formatOrderWhatsAppMessage(order, settings.store_name);
            const whatsappLink = createWhatsAppLink(order.customer_phone, whatsappMessage);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-5 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border transition-all cursor-pointer shadow-sm hover:shadow-warm ${
                  selectedOrder?.id === order.id
                    ? 'border-caramel ring-2 ring-caramel/20'
                    : isVerificationNeeded
                    ? 'border-amber-400 dark:border-amber-500/50 bg-amber-500/5'
                    : 'border-caramel/20 hover:border-caramel/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-espresso dark:text-ivory">
                        #{order.order_reference}
                      </span>
                      <span className="font-semibold text-sm text-espresso dark:text-ivory">
                        {order.customer_name}
                      </span>
                      <span className="text-xs text-espresso/50 dark:text-ivory/50">
                        • {order.customer_phone}
                      </span>
                    </div>

                    <p className="text-xs text-espresso/70 dark:text-ivory/70 line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="text-espresso/50 dark:text-ivory/50">
                        {formatDate(order.created_at)}
                      </span>
                      <span>•</span>
                      <span className="capitalize font-medium text-espresso/80 dark:text-ivory/80">
                        {order.order_type}
                      </span>
                      <span>•</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold ${
                          isConfirmed
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : isVerificationNeeded
                            ? 'bg-amber-500 text-espresso-950 animate-pulse'
                            : 'bg-caramel/15 text-caramel'
                        }`}
                      >
                        {isVerificationNeeded
                          ? '⚡ Transfer Proof Uploaded — Review'
                          : order.payment_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-caramel/10">
                    <span className="font-serif font-bold text-lg text-caramel dark:text-sand">
                      {formatCurrency(order.total_amount)}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-700 transition-colors"
                        title="Message customer on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg bg-caramel/15 text-caramel text-[11px] font-semibold hover:bg-caramel hover:text-white transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail & Bank Transfer Verification Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-espresso-950/70 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-screen max-w-2xl bg-ivory dark:bg-espresso-900 border-l border-caramel/25 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-5 border-b border-caramel/20 flex items-center justify-between bg-espresso-900 text-ivory">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand">
                    Order Details & Payment Verification
                  </span>
                  <h3 className="font-mono text-xl font-bold mt-0.5">
                    #{selectedOrder.order_reference}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-ivory/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* 1. Payment Verification Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-espresso-800 border-2 border-caramel/30 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-bold text-espresso dark:text-ivory flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-caramel" />
                      <span>Direct Bank Transfer Verification</span>
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        selectedOrder.payment_status === 'payment_confirmed'
                          ? 'bg-emerald-600 text-white'
                          : selectedOrder.payment_status === 'payment_evidence_submitted'
                          ? 'bg-amber-500 text-espresso-950'
                          : 'bg-caramel/20 text-caramel'
                      }`}
                    >
                      {selectedOrder.payment_status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-ivory dark:bg-espresso-900 border border-caramel/15 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-espresso/60 dark:text-ivory/60">Expected Transfer Amount:</span>
                      <span className="font-serif font-bold text-base text-caramel dark:text-sand">
                        {formatCurrency(selectedOrder.total_amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-caramel/10">
                      <span className="text-espresso/60 dark:text-ivory/60">Customer Transfer Ref / Sender:</span>
                      <span className="font-mono font-bold text-espresso dark:text-ivory">
                        {selectedOrder.transfer_reference || 'None entered yet'}
                      </span>
                    </div>

                    {selectedOrder.payment_evidence_url && (
                      <div className="pt-2 border-t border-caramel/10">
                        <span className="text-espresso/60 dark:text-ivory/60 block mb-1.5 font-semibold">
                          Customer Uploaded Proof Screenshot:
                        </span>
                        <div className="relative rounded-xl overflow-hidden border border-caramel/20 max-h-48 bg-black/10">
                          <img
                            src={selectedOrder.payment_evidence_url}
                            alt="Payment Evidence"
                            className="w-full h-auto object-contain cursor-pointer"
                            onClick={() => window.open(selectedOrder.payment_evidence_url, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verification CTA Buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {selectedOrder.payment_status !== 'payment_confirmed' ? (
                      <>
                        <button
                          onClick={() => handleConfirmPayment(selectedOrder.id)}
                          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Money Arrived in Bank</span>
                        </button>

                        <button
                          onClick={() => handleRejectPayment(selectedOrder.id)}
                          className="py-3 px-4 rounded-xl bg-red-600/15 hover:bg-red-600 hover:text-white text-red-600 font-semibold text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className="w-full p-2.5 rounded-xl bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Payment already verified and confirmed.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Order Fulfilment Status Controls */}
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-sm space-y-3">
                  <h4 className="font-serif text-base font-bold text-espresso dark:text-ivory">
                    Kitchen & Delivery Status
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { status: 'new' as OrderStatus, label: 'New Order' },
                      { status: 'accepted' as OrderStatus, label: 'Accepted' },
                      { status: 'preparing' as OrderStatus, label: 'In Kitchen' },
                      { status: 'ready_for_pickup' as OrderStatus, label: 'Ready for Pickup' },
                      { status: 'out_for_delivery' as OrderStatus, label: 'Out for Delivery' },
                      { status: 'completed' as OrderStatus, label: 'Delivered / Completed' },
                    ].map((step) => {
                      const isCurrent = selectedOrder.order_status === step.status;
                      return (
                        <button
                          key={step.status}
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, step.status)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                            isCurrent
                              ? 'bg-caramel text-ivory shadow-sm ring-2 ring-caramel/30'
                              : 'bg-ivory dark:bg-espresso-900 border border-caramel/15 text-espresso/80 dark:text-ivory/80 hover:border-caramel'
                          }`}
                        >
                          {step.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Items Ordered Breakdown */}
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-sm space-y-3">
                  <h4 className="font-serif text-base font-bold text-espresso dark:text-ivory">
                    Items in Order ({selectedOrder.items.length})
                  </h4>

                  <div className="divide-y divide-caramel/10 text-xs">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-start gap-3">
                        <div>
                          <p className="font-bold text-espresso dark:text-ivory">
                            {item.quantity}x {item.product_name}
                          </p>
                          {item.variation_details && (
                            <p className="text-[11px] text-caramel">{item.variation_details}</p>
                          )}
                          {item.custom_options && (
                            <div className="mt-1 p-2 rounded-lg bg-caramel/10 text-[11px] space-y-0.5">
                              <p>
                                <strong>Size:</strong> {item.custom_options.cake_size} |{' '}
                                <strong>Flavour:</strong> {item.custom_options.flavour}
                              </p>
                              {item.custom_options.cake_message && (
                                <p className="italic text-caramel">
                                  "{item.custom_options.cake_message}"
                                </p>
                              )}
                              {item.custom_options.special_instructions && (
                                <p className="text-espresso/70 dark:text-ivory/70">
                                  <strong>Notes:</strong> {item.custom_options.special_instructions}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-espresso dark:text-ivory shrink-0">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-caramel/15 space-y-1 text-xs text-espresso/70 dark:text-ivory/70">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery ({selectedOrder.delivery_zone_name || 'Standard'}):</span>
                      <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-espresso dark:text-ivory pt-2 border-t border-caramel/10">
                      <span>Total:</span>
                      <span className="font-serif text-lg text-caramel dark:text-sand">
                        {formatCurrency(selectedOrder.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Customer & Delivery Contact Information */}
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-sm space-y-3 text-xs">
                  <h4 className="font-serif text-base font-bold text-espresso dark:text-ivory">
                    Customer Information
                  </h4>

                  <div className="space-y-1.5 text-espresso/80 dark:text-ivory/80">
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedOrder.customer_phone}
                    </p>
                    {selectedOrder.customer_email && (
                      <p>
                        <strong>Email:</strong> {selectedOrder.customer_email}
                      </p>
                    )}
                    {selectedOrder.delivery_address && (
                      <p>
                        <strong>Address:</strong> {selectedOrder.delivery_address}
                      </p>
                    )}
                    {selectedOrder.delivery_time_slot && (
                      <p>
                        <strong>Time Slot:</strong> {selectedOrder.delivery_time_slot}
                      </p>
                    )}
                    {selectedOrder.customer_notes && (
                      <p className="p-2 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/15 mt-2">
                        <strong>Customer Remark:</strong> {selectedOrder.customer_notes}
                      </p>
                    )}
                    {selectedOrder.internal_notes && (
                      <p className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 mt-2 whitespace-pre-line font-mono text-[10px]">
                        <strong>Internal Activity Notes:</strong>
                        <br />
                        {selectedOrder.internal_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer with WhatsApp Action */}
              <div className="p-4 border-t border-caramel/20 bg-ivory dark:bg-espresso-950 flex items-center justify-between gap-3">
                <a
                  href={createWhatsAppLink(
                    selectedOrder.customer_phone,
                    formatOrderWhatsAppMessage(selectedOrder, settings.store_name)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-3 rounded-xl border border-caramel/25 text-espresso/80 dark:text-ivory/80 text-xs font-semibold hover:bg-caramel/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
