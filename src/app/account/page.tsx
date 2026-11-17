'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  Mail,
  Lock,
  LogOut,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  MessageCircle,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { DBStore, storeEvents } from '@/lib/store';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatCurrency, formatDate, createWhatsAppLink } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

export default function CustomerAccountPage() {
  const router = useRouter();
  const {
    user,
    customerProfile,
    isLoading: authLoading,
    signOut,
    updateProfile,
    changePassword,
  } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed' | 'unpaid'>('all');

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Settings for WhatsApp & support
  const [settings] = useState(DBStore.getSettings());

  // Protect Route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, authLoading, router]);

  // Load Customer Orders & Profile
  useEffect(() => {
    if (!user) return;

    setFullName(user.fullName || '');
    setPhone(user.phone || '');
    setEmail(user.email || '');

    const loadOrders = () => {
      const customerOrders = DBStore.getOrdersForCustomer(user.id, user.email, user.phone);
      // Sort newest first
      customerOrders.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(customerOrders);
    };

    loadOrders();

    const unsubscribe = storeEvents.subscribe('orders', loadOrders);
    return unsubscribe;
  }, [user]);

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-caramel" />
        <p className="text-sm font-medium text-espresso/70 dark:text-ivory/70">
          Loading your account...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // Stats calculation
  const totalOrdersCount = orders.length;
  const totalSpent = orders
    .filter((o) => o.payment_status === 'payment_confirmed')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const activeOrders = orders.filter(
    (o) => o.order_status !== 'completed' && o.order_status !== 'cancelled'
  );

  const awaitingPaymentOrders = orders.filter(
    (o) => o.payment_status === 'awaiting_payment'
  );

  // Filtered Orders for the "My Orders" tab
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'active') {
      return order.order_status !== 'completed' && order.order_status !== 'cancelled';
    }
    if (orderFilter === 'completed') {
      return order.order_status === 'completed';
    }
    if (orderFilter === 'unpaid') {
      return order.payment_status === 'awaiting_payment';
    }
    return true;
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      setProfileError('Phone number cannot be empty.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfile({
        fullName,
        phone,
        email: email !== user.email ? email : undefined,
      });

      if (!res.success) {
        setProfileError(res.error || 'Failed to update profile.');
      } else {
        setProfileSuccess(res.message || 'Profile saved successfully!');
      }
    } catch (err: any) {
      setProfileError(err.message || 'An unexpected error occurred.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain both letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await changePassword(newPassword);
      if (!res.success) {
        setPasswordError(res.error || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password successfully updated!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An error occurred.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out of DEE BAKES?')) {
      await signOut();
      router.push('/');
    }
  };

  // Status Badge Renderers
  const renderOrderStatusBadge = (status: OrderStatus) => {
    const config: Record<OrderStatus, { label: string; bg: string; text: string }> = {
      new: { label: 'Received', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300' },
      accepted: { label: 'Accepted', bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-800 dark:text-indigo-300' },
      preparing: { label: 'In Kitchen', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
      ready_for_pickup: { label: 'Ready for Pickup', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300' },
      out_for_delivery: { label: 'Out for Delivery', bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-800 dark:text-cyan-300' },
      completed: { label: 'Delivered', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
      cancelled: { label: 'Cancelled', bg: 'bg-stone-200 dark:bg-stone-800', text: 'text-stone-700 dark:text-stone-400' },
    };
    const c = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const renderPaymentStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
      awaiting_payment: { label: 'Awaiting Transfer', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
      payment_evidence_submitted: { label: 'Receipt Sent', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300' },
      payment_pending_verification: { label: 'Verifying Receipt', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300' },
      payment_confirmed: { label: 'Paid & Confirmed', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
      payment_rejected: { label: 'Payment Rejected', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-800 dark:text-red-300' },
      refunded: { label: 'Refunded', bg: 'bg-stone-200 dark:bg-stone-800', text: 'text-stone-700 dark:text-stone-400' },
    };
    const c = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-espresso-950 transition-colors py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white/80 dark:bg-espresso-900/80 backdrop-blur-md border border-caramel/20 rounded-3xl p-6 sm:p-8 mb-8 shadow-warm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-caramel/15 border border-caramel/30 flex items-center justify-center text-caramel font-serif text-2xl font-bold flex-shrink-0 shadow-sm">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-caramel/10 text-caramel mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Verified Customer</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory">
                Welcome back, {user.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70 flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-caramel" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-caramel" />
                    {user.phone}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-xl bg-caramel text-ivory text-sm font-medium hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Treats</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-caramel/20 pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-caramel text-ivory shadow-warm'
                : 'text-espresso/70 dark:text-ivory/70 hover:bg-caramel/10'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Account Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-caramel text-ivory shadow-warm'
                : 'text-espresso/70 dark:text-ivory/70 hover:bg-caramel/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'orders'
                    ? 'bg-ivory text-espresso'
                    : 'bg-caramel/20 text-caramel'
                }`}
              >
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-caramel text-ivory shadow-warm'
                : 'text-espresso/70 dark:text-ivory/70 hover:bg-caramel/10'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-espresso/60 dark:text-ivory/60">
                    Total Orders
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-caramel/15 text-caramel flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif text-espresso dark:text-ivory">
                  {totalOrdersCount}
                </div>
                <p className="text-xs text-espresso/50 dark:text-ivory/50 mt-1">
                  Lifetime orders placed
                </p>
              </div>

              <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-espresso/60 dark:text-ivory/60">
                    Active Orders
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">
                  {activeOrders.length}
                </div>
                <p className="text-xs text-espresso/50 dark:text-ivory/50 mt-1">
                  Currently in progress
                </p>
              </div>

              <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-espresso/60 dark:text-ivory/60">
                    Total Spent
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif text-espresso dark:text-ivory">
                  {formatCurrency(totalSpent)}
                </div>
                <p className="text-xs text-espresso/50 dark:text-ivory/50 mt-1">
                  Confirmed payments
                </p>
              </div>

              <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-espresso/60 dark:text-ivory/60">
                    Awaiting Payment
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-serif text-blue-600 dark:text-blue-400">
                  {awaitingPaymentOrders.length}
                </div>
                <p className="text-xs text-espresso/50 dark:text-ivory/50 mt-1">
                  Bank transfer pending
                </p>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-3xl p-6 sm:p-8 shadow-warm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-espresso dark:text-ivory">
                    Recent Orders
                  </h2>
                  <p className="text-xs text-espresso/60 dark:text-ivory/60">
                    Your latest bakery and kitchen orders
                  </p>
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-caramel hover:text-caramel-600 flex items-center gap-1"
                  >
                    <span>View All ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-ivory/40 dark:bg-espresso-800/40 border border-dashed border-caramel/20">
                  <div className="w-16 h-16 rounded-full bg-caramel/15 text-caramel mx-auto flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory mb-2">
                    No orders placed yet
                  </h3>
                  <p className="text-sm text-espresso/70 dark:text-ivory/70 max-w-md mx-auto mb-6">
                    Freshly made shawarma, brioche doughnuts, celebration cakes, and delicious Lagos pastries are waiting for you!
                  </p>
                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-caramel text-ivory font-medium hover:bg-caramel-600 transition-colors shadow-sm"
                  >
                    <span>Explore Our Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-ivory/40 dark:bg-espresso-800/40 border border-caramel/15 hover:border-caramel/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold font-mono text-sm text-espresso dark:text-ivory">
                            {order.order_reference}
                          </span>
                          {renderOrderStatusBadge(order.order_status)}
                          {renderPaymentStatusBadge(order.payment_status)}
                        </div>
                        <p className="text-xs text-espresso/60 dark:text-ivory/60 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-caramel" />
                            {formatDate(order.created_at)}
                          </span>
                          <span>•</span>
                          <span>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{order.order_type}</span>
                        </p>
                        <p className="text-xs text-espresso/80 dark:text-ivory/80 line-clamp-1">
                          {order.items.map((it) => `${it.quantity}x ${it.product_name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-caramel/10">
                        <div className="sm:text-right">
                          <div className="text-xs text-espresso/60 dark:text-ivory/60">Total</div>
                          <div className="font-serif font-bold text-base text-caramel">
                            {formatCurrency(order.total_amount)}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 rounded-xl bg-caramel/15 text-caramel hover:bg-caramel hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Need Assistance Banner */}
            <div className="bg-gradient-to-r from-caramel/20 via-sand/20 to-caramel/10 rounded-3xl p-6 border border-caramel/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
                  Have a Question About Your Treats?
                </h3>
                <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70">
                  Our bakery team is ready to assist you on WhatsApp for customized cakes and special deliveries.
                </p>
              </div>
              <a
                href={createWhatsAppLink(
                  settings.whatsapp_number,
                  `Hello Dee Bakes! I am logged into my account (${user.fullName}) and have an inquiry.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  orderFilter === 'all'
                    ? 'bg-caramel text-ivory shadow-warm'
                    : 'bg-white/80 dark:bg-espresso-900/80 text-espresso/70 dark:text-ivory/70 border border-caramel/20 hover:border-caramel/40'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('active')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  orderFilter === 'active'
                    ? 'bg-caramel text-ivory shadow-warm'
                    : 'bg-white/80 dark:bg-espresso-900/80 text-espresso/70 dark:text-ivory/70 border border-caramel/20 hover:border-caramel/40'
                }`}
              >
                Active / In-Kitchen ({activeOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('unpaid')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  orderFilter === 'unpaid'
                    ? 'bg-caramel text-ivory shadow-warm'
                    : 'bg-white/80 dark:bg-espresso-900/80 text-espresso/70 dark:text-ivory/70 border border-caramel/20 hover:border-caramel/40'
                }`}
              >
                Awaiting Transfer ({awaitingPaymentOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  orderFilter === 'completed'
                    ? 'bg-caramel text-ivory shadow-warm'
                    : 'bg-white/80 dark:bg-espresso-900/80 text-espresso/70 dark:text-ivory/70 border border-caramel/20 hover:border-caramel/40'
                }`}
              >
                Delivered / Completed (
                {orders.filter((o) => o.order_status === 'completed').length})
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-3xl p-12 text-center shadow-warm">
                <ShoppingBag className="w-12 h-12 text-caramel mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory mb-2">
                  No orders match this filter
                </h3>
                <p className="text-xs text-espresso/60 dark:text-ivory/60 mb-6">
                  Try viewing all orders or place a new order from our menu.
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-caramel text-ivory font-medium hover:bg-caramel-600 transition-colors text-sm shadow-sm"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-3xl p-6 shadow-warm hover:border-caramel/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-caramel/15 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-base text-espresso dark:text-ivory">
                            {order.order_reference}
                          </span>
                          {renderOrderStatusBadge(order.order_status)}
                          {renderPaymentStatusBadge(order.payment_status)}
                        </div>
                        <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-caramel" />
                          <span>Placed on {formatDate(order.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{order.order_type}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-espresso/60 dark:text-ivory/60">Total</div>
                          <div className="font-serif font-bold text-lg text-caramel">
                            {formatCurrency(order.total_amount)}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 rounded-xl bg-caramel text-ivory text-xs font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <span>Order Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-espresso/50 dark:text-ivory/50">
                        Items Ordered ({order.items.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-ivory/50 dark:bg-espresso-800/50 text-xs"
                          >
                            <span className="font-medium text-espresso dark:text-ivory">
                              {item.quantity}x {item.product_name}
                              {item.variation_details && (
                                <span className="text-espresso/60 dark:text-ivory/60 font-normal">
                                  {' '}
                                  ({item.variation_details})
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-caramel font-semibold">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick action footer */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-espresso/60 dark:text-ivory/60 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-caramel" />
                        <span>
                          {order.order_type === 'delivery'
                            ? order.delivery_address || 'Delivery Address'
                            : 'Self-Pickup at Dee Bakes Kitchen'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.payment_status === 'awaiting_payment' && (
                          <Link
                            href={`/order-confirmation/${order.order_reference}`}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Complete Payment / Submit Receipt</span>
                          </Link>
                        )}
                        <Link
                          href={`/track?ref=${order.order_reference}`}
                          className="px-3 py-1.5 rounded-lg border border-caramel/30 text-espresso dark:text-ivory font-semibold text-xs hover:bg-caramel/10 transition-colors flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 text-caramel" />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* Personal Details Card */}
            <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-3xl p-6 sm:p-8 shadow-warm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-caramel/15 text-caramel flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                    Personal Information
                  </h3>
                  <p className="text-xs text-espresso/60 dark:text-ivory/60">
                    Update your contact and delivery profile
                  </p>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0801 234 5678"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-espresso/50 dark:text-ivory/50">
                    Used for order dispatch notifications and driver calls.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-espresso/50 dark:text-ivory/50">
                    Updating your email will require confirming the link sent to your new inbox.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-3 px-6 rounded-2xl bg-caramel text-ivory font-medium hover:bg-caramel-600 transition-colors shadow-warm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {profileSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Profile Details</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white/80 dark:bg-espresso-900/80 border border-caramel/20 rounded-3xl p-6 sm:p-8 shadow-warm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-caramel/15 text-caramel flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                    Security & Password
                  </h3>
                  <p className="text-xs text-espresso/60 dark:text-ivory/60">
                    Keep your customer account protected
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso/50 dark:text-ivory/50 hover:text-caramel"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full py-3 px-6 rounded-2xl bg-caramel text-ivory font-medium hover:bg-caramel-600 transition-colors shadow-warm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-ivory dark:bg-espresso-900 border border-caramel/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-caramel/20">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-espresso dark:text-ivory">
                      Order {selectedOrder.order_reference}
                    </h3>
                  </div>
                  <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-0.5">
                    Placed on {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-espresso/70 dark:text-ivory/70 hover:bg-caramel/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-3 my-4 p-3 rounded-2xl bg-white/60 dark:bg-espresso-800/60 border border-caramel/15">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-espresso/50 dark:text-ivory/50 block">
                    Kitchen Status
                  </span>
                  {renderOrderStatusBadge(selectedOrder.order_status)}
                </div>
                <div className="border-l border-caramel/15 pl-3">
                  <span className="text-[11px] uppercase tracking-wider text-espresso/50 dark:text-ivory/50 block">
                    Payment Status
                  </span>
                  {renderPaymentStatusBadge(selectedOrder.payment_status)}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3 my-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70">
                  Itemized Order Breakdown
                </h4>
                <div className="divide-y divide-caramel/15 border border-caramel/15 rounded-2xl overflow-hidden bg-white/40 dark:bg-espresso-800/40">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-start justify-between text-xs gap-3">
                      <div>
                        <div className="font-semibold text-espresso dark:text-ivory">
                          {item.quantity}x {item.product_name}
                        </div>
                        {item.variation_details && (
                          <div className="text-espresso/60 dark:text-ivory/60 mt-0.5">
                            Variation: {item.variation_details}
                          </div>
                        )}
                        {item.custom_options && (
                          <div className="text-[11px] text-caramel mt-1 space-y-0.5">
                            <div>Size: {item.custom_options.cake_size}</div>
                            <div>Flavour: {item.custom_options.flavour}</div>
                            {item.custom_options.cake_message && (
                              <div>Message: &quot;{item.custom_options.cake_message}&quot;</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="font-mono font-bold text-caramel whitespace-nowrap">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-espresso-800/40 border border-caramel/15 space-y-2">
                  <div className="font-semibold text-caramel uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Fulfillment Info</span>
                  </div>
                  <p className="text-espresso/80 dark:text-ivory/80">
                    <strong>Type:</strong> <span className="capitalize">{selectedOrder.order_type}</span>
                  </p>
                  {selectedOrder.order_type === 'delivery' && (
                    <>
                      <p className="text-espresso/80 dark:text-ivory/80">
                        <strong>Zone:</strong> {selectedOrder.delivery_zone_name || 'Standard'}
                      </p>
                      <p className="text-espresso/80 dark:text-ivory/80">
                        <strong>Address:</strong> {selectedOrder.delivery_address}
                      </p>
                    </>
                  )}
                  {selectedOrder.delivery_date && (
                    <p className="text-espresso/80 dark:text-ivory/80">
                      <strong>Scheduled Date:</strong> {selectedOrder.delivery_date}
                    </p>
                  )}
                  {selectedOrder.delivery_time_slot && (
                    <p className="text-espresso/80 dark:text-ivory/80">
                      <strong>Time Slot:</strong> {selectedOrder.delivery_time_slot}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white/40 dark:bg-espresso-800/40 border border-caramel/15 space-y-2">
                  <div className="font-semibold text-caramel uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Summary</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-espresso/60 dark:text-ivory/60">Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-espresso/60 dark:text-ivory/60">Delivery Fee:</span>
                    <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-caramel/15 font-bold text-sm text-caramel">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                  {selectedOrder.transfer_reference && (
                    <p className="text-[11px] text-espresso/70 dark:text-ivory/70 pt-1">
                      <strong>Transfer Ref:</strong> {selectedOrder.transfer_reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-caramel/20">
                {selectedOrder.payment_status === 'awaiting_payment' && (
                  <Link
                    href={`/order-confirmation/${selectedOrder.order_reference}`}
                    className="px-4 py-2.5 rounded-xl bg-caramel text-ivory text-xs font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Upload Transfer Receipt</span>
                  </Link>
                )}
                <Link
                  href={`/track?ref=${selectedOrder.order_reference}`}
                  className="px-4 py-2.5 rounded-xl border border-caramel/30 text-espresso dark:text-ivory text-xs font-semibold hover:bg-caramel/10 transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-caramel" />
                  <span>Live Tracking</span>
                </Link>
                <a
                  href={createWhatsAppLink(
                    settings.whatsapp_number,
                    `Hello Dee Bakes! I have a question regarding my order ref: ${selectedOrder.order_reference}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
