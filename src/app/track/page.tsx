'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { DBStore } from '@/lib/store';
import { formatCurrency, formatDate, createWhatsAppLink } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [query, setQuery] = useState(initialRef);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const settings = DBStore.getSettings();

  useEffect(() => {
    if (initialRef) {
      const found = DBStore.getOrderByReference(initialRef);
      if (found) {
        setSearchedOrder(found);
        setHasSearched(true);
      }
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim().toUpperCase();
    const allOrders = DBStore.getOrders();
    const found = allOrders.find(
      (o) =>
        o.order_reference.toUpperCase() === trimmed ||
        o.customer_phone.replace(/\D/g, '').includes(trimmed.replace(/\D/g, ''))
    );

    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const statusSteps: Array<{ key: OrderStatus; label: string }> = [
    { key: 'new', label: 'Order Received' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'In Kitchen' },
    { key: 'ready_for_pickup', label: 'Ready / Dispatched' },
    { key: 'completed', label: 'Delivered' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
      case 'out_for_delivery':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.order_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
          Real-Time Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-espresso dark:text-ivory">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70">
          Enter your Order Reference (e.g. DB-2026-8821) or phone number to view live preparation and delivery status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. DB-2026-8821 or 08123456789"
            className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-espresso-800 border border-caramel/30 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-full bg-caramel text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-caramel-600 transition-colors shadow-sm"
        >
          Track
        </button>
      </form>

      {/* Results Display */}
      {hasSearched && (
        <div className="animate-in fade-in duration-300">
          {!searchedOrder ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-white/60 dark:bg-espresso-800/60 border border-caramel/20">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                No Order Found
              </h3>
              <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1 max-w-sm mx-auto">
                We couldn't find an order with that reference. Please check the spelling or contact Dee on WhatsApp.
              </p>
              <a
                href={createWhatsAppLink(
                  settings.whatsapp_number,
                  `Hello Dee! I need assistance tracking my order with search query: ${query}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Ask Dee on WhatsApp</span>
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Stepper Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/25 shadow-warm space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-caramel/15 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-caramel dark:text-sand">
                      Order Reference
                    </span>
                    <h2 className="font-mono text-2xl font-bold text-espresso dark:text-ivory">
                      #{searchedOrder.order_reference}
                    </h2>
                    <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-0.5">
                      Placed by {searchedOrder.customer_name} • {formatDate(searchedOrder.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        searchedOrder.payment_status === 'payment_confirmed'
                          ? 'bg-emerald-600/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      Payment: {searchedOrder.payment_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar / Steps */}
                {searchedOrder.order_status === 'cancelled' ? (
                  <div className="p-4 rounded-2xl bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-semibold text-center">
                    This order was cancelled.
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {statusSteps.map((step, idx) => {
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                              isComplete
                                ? 'bg-caramel text-ivory shadow-md ring-4 ring-caramel/20'
                                : 'bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso/40 dark:text-ivory/40'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-medium leading-tight ${
                              isCurrent
                                ? 'text-caramel dark:text-sand font-bold'
                                : isComplete
                                ? 'text-espresso dark:text-ivory'
                                : 'text-espresso/40 dark:text-ivory/40'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Items & Financials Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/25 shadow-warm space-y-4">
                <h4 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
                  Order Items
                </h4>

                <div className="divide-y divide-caramel/10 text-xs">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-espresso dark:text-ivory">
                          {item.quantity}x {item.product_name}
                        </p>
                        {item.variation_details && (
                          <p className="text-[10px] text-caramel">{item.variation_details}</p>
                        )}
                        {item.custom_options?.cake_message && (
                          <p className="text-[10px] italic text-espresso/60 dark:text-ivory/60">
                            "{item.custom_options.cake_message}"
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-espresso dark:text-ivory">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-caramel/15 flex justify-between items-baseline text-xs font-bold text-espresso dark:text-ivory">
                  <span>Total Paid / Payable:</span>
                  <span className="font-serif text-xl text-caramel dark:text-sand">
                    {formatCurrency(searchedOrder.total_amount)}
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/order-confirmation/${searchedOrder.order_reference}`}
                    className="text-xs font-semibold text-caramel hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Bank Transfer Details & Upload Proof</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
