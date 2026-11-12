'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Flame,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { DBStore, storeEvents } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>(DBStore.getOrders());
  const [products, setProducts] = useState(DBStore.getProducts());
  const [settings, setSettings] = useState(DBStore.getSettings());

  useEffect(() => {
    const unsubO = storeEvents.subscribe('orders', () => setOrders(DBStore.getOrders()));
    const unsubP = storeEvents.subscribe('products', () => setProducts(DBStore.getProducts()));
    const unsubS = storeEvents.subscribe('settings', () => setSettings(DBStore.getSettings()));
    return () => {
      unsubO();
      unsubP();
      unsubS();
    };
  }, []);

  // Compute real database metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.created_at) >= todayStart);
  const totalOrders = orders.length;

  // Today's revenue from confirmed payments only
  const todayConfirmedRevenue = todayOrders
    .filter((o) => o.payment_status === 'payment_confirmed')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const totalConfirmedRevenue = orders
    .filter((o) => o.payment_status === 'payment_confirmed')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingVerificationOrders = orders.filter(
    (o) =>
      o.payment_status === 'payment_evidence_submitted' ||
      o.payment_status === 'payment_pending_verification'
  );

  const pendingKitchenOrders = orders.filter(
    (o) => o.order_status === 'new' || o.order_status === 'accepted' || o.order_status === 'preparing'
  );

  const completedOrders = orders.filter((o) => o.order_status === 'completed');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-caramel dark:text-sand">
            Dee Bakes Studio Overview
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory mt-0.5">
            Good day, Dee! 👩🏽‍🍳
          </h1>
          <p className="text-xs text-espresso/60 dark:text-ivory/60">
            Real-time bakery performance, bank transfers, and order pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products?action=new"
            className="px-4 py-2 rounded-xl bg-caramel text-ivory text-xs font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Treat</span>
          </Link>
          <Link
            href="/admin/orders?filter=verification"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Payments ({pendingVerificationOrders.length})</span>
          </Link>
        </div>
      </div>

      {/* Pending Payment Verification Alert Banner if any exist */}
      {pendingVerificationOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">
                {pendingVerificationOrders.length} Direct Bank Transfer(s) Awaiting Your Verification
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                Customers have uploaded transfer proof or reference numbers to your Nigerian bank account.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?filter=verification"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs shrink-0 hover:bg-amber-700 transition-colors"
          >
            Review Transfers
          </Link>
        </div>
      )}

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Today's Confirmed Revenue */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-espresso/60 dark:text-ivory/60">
            <span>Today's Confirmed Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory">
              {formatCurrency(todayConfirmedRevenue)}
            </span>
            <p className="text-[10px] text-espresso/50 dark:text-ivory/50 mt-1">
              All-time: {formatCurrency(totalConfirmedRevenue)}
            </p>
          </div>
        </div>

        {/* Metric 2: Today's Orders */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-espresso/60 dark:text-ivory/60">
            <span>Today's Orders</span>
            <div className="p-2 rounded-xl bg-caramel/15 text-caramel">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory">
              {todayOrders.length}
            </span>
            <p className="text-[10px] text-espresso/50 dark:text-ivory/50 mt-1">
              Total orders to date: {totalOrders}
            </p>
          </div>
        </div>

        {/* Metric 3: Pending Kitchen Orders */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-espresso/60 dark:text-ivory/60">
            <span>Active in Kitchen</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory">
              {pendingKitchenOrders.length}
            </span>
            <p className="text-[10px] text-espresso/50 dark:text-ivory/50 mt-1">
              New, accepted & preparing
            </p>
          </div>
        </div>

        {/* Metric 4: Completed Orders */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-espresso/60 dark:text-ivory/60">
            <span>Fulfilled & Delivered</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory">
              {completedOrders.length}
            </span>
            <p className="text-[10px] text-espresso/50 dark:text-ivory/50 mt-1">
              Successful deliveries
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Best Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-5">
          <div className="flex items-center justify-between border-b border-caramel/15 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
                Recent Orders
              </h3>
              <p className="text-xs text-espresso/60 dark:text-ivory/60">
                Incoming orders from the customer storefront
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-caramel hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-caramel/10">
            {orders.slice(0, 5).map((order) => {
              const isPaid = order.payment_status === 'payment_confirmed';
              const isPendingProof =
                order.payment_status === 'payment_evidence_submitted' ||
                order.payment_status === 'payment_pending_verification';

              return (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-espresso dark:text-ivory">
                        #{order.order_reference}
                      </span>
                      <span className="text-espresso/50 dark:text-ivory/50">•</span>
                      <span className="font-semibold text-espresso dark:text-ivory">
                        {order.customer_name}
                      </span>
                      <span className="text-espresso/50 dark:text-ivory/50">
                        ({order.items.length} items)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-espresso/60 dark:text-ivory/60">
                      <span>{formatDate(order.created_at)}</span>
                      <span>•</span>
                      <span className="capitalize">{order.order_type}</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : isPendingProof
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-caramel/15 text-caramel'
                        }`}
                      >
                        {order.payment_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-serif font-bold text-sm text-espresso dark:text-ivory">
                      {formatCurrency(order.total_amount)}
                    </span>
                    <Link
                      href={`/admin/orders?id=${order.id}`}
                      className="p-1.5 rounded-lg bg-ivory dark:bg-espresso-900 border border-caramel/25 text-caramel hover:bg-caramel hover:text-white transition-colors"
                      title="Manage order"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Bestsellers & Store Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Bank Details Glance */}
          <div className="p-6 rounded-3xl bg-caramel/10 border border-caramel/25 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-caramel dark:text-sand font-bold">
              <CreditCard className="w-4 h-4" />
              <span>Configured Bank Account</span>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-espresso dark:text-ivory">{settings.bank_name}</p>
              <p className="text-espresso/70 dark:text-ivory/70">{settings.bank_account_name}</p>
              <p className="font-mono font-bold text-sm text-caramel dark:text-sand">
                {settings.bank_account_number}
              </p>
            </div>
            <Link
              href="/admin/more?tab=payment"
              className="text-[11px] text-caramel font-semibold hover:underline block pt-1"
            >
              Edit Bank Details in Settings →
            </Link>
          </div>

          {/* Top Selling Treats */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso dark:text-ivory flex items-center gap-2">
              <Flame className="w-4 h-4 text-caramel" />
              <span>Bestselling Treats</span>
            </h4>

            <div className="space-y-3">
              {products
                .filter((p) => p.is_bestseller)
                .slice(0, 4)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-caramel/10">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-espresso dark:text-ivory line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-caramel">{product.category_name}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-espresso dark:text-ivory shrink-0">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                ))}
            </div>

            <Link
              href="/admin/products"
              className="w-full py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/20 text-espresso/80 dark:text-ivory/80 text-xs font-semibold hover:bg-caramel/10 transition-colors block text-center mt-2"
            >
              Manage Catalogue ({products.length} Products)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
