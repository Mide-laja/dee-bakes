'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  MoreHorizontal,
  LogOut,
  Power,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { DBStore, storeEvents } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Logo } from '@/components/brand/Logo';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAdminAuth();
  const [settings, setSettings] = useState(DBStore.getSettings());
  const [orders, setOrders] = useState(DBStore.getOrders());

  useEffect(() => {
    const unsubS = storeEvents.subscribe('settings', () => setSettings(DBStore.getSettings()));
    const unsubO = storeEvents.subscribe('orders', () => setOrders(DBStore.getOrders()));
    return () => {
      unsubS();
      unsubO();
    };
  }, []);

  // Check login route exemption
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-espresso-950 text-ivory">
        <p className="text-xs">Authenticating Studio Session...</p>
      </div>
    );
  }

  const pendingVerificationCount = orders.filter(
    (o) =>
      o.payment_status === 'payment_evidence_submitted' ||
      o.payment_status === 'payment_pending_verification'
  ).length;

  const newOrdersCount = orders.filter((o) => o.order_status === 'new').length;

  const toggleStorePause = () => {
    const next = !settings.pause_orders;
    DBStore.updateSettings({ pause_orders: next });
  };

  const navItems = [
    { name: 'Home', href: '/admin', icon: Home, badge: 0 },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingVerificationCount + newOrdersCount,
    },
    { name: 'Products', href: '/admin/products', icon: Package, badge: 0 },
    { name: 'Customers', href: '/admin/customers', icon: Users, badge: 0 },
    { name: 'More', href: '/admin/more', icon: MoreHorizontal, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFEA] dark:bg-[#160D0B] text-espresso dark:text-ivory flex flex-col md:flex-row">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-espresso-900 text-ivory p-6 border-r border-caramel/20 shrink-0">
        <div className="space-y-8">
          {/* Logo & Sub-tag */}
          <div className="space-y-1">
            <Logo variant="full" theme="dark" size="sm" />
            <div className="flex items-center gap-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                Studio Suite
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isSupabaseConfigured() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isSupabaseConfigured() ? 'Cloud Live' : 'Demo Local'}
              </span>
            </div>
          </div>

          {/* Quick Store Open/Pause Switch */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ivory/80">Store Taking Orders:</span>
              <button
                onClick={toggleStorePause}
                className={`p-1.5 rounded-full transition-colors ${
                  !settings.pause_orders
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
                title="Toggle Store Pause"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-ivory/60">
              {!settings.pause_orders ? '🟢 Live & accepting orders' : '🟠 Paused (Capacity)'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-caramel text-ivory shadow-sm'
                      : 'text-ivory/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-espresso-950">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-caramel flex items-center justify-center font-bold text-xs text-white">
                D
              </div>
              <div>
                <p className="font-semibold leading-none">{user?.name}</p>
                <p className="text-[10px] text-ivory/50 mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-ivory/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-ivory/70 text-[11px] font-medium transition-colors"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Top Header */}
        <header className="sticky top-0 z-30 bg-espresso-900 text-ivory px-4 py-3 flex items-center justify-between shadow-md md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-caramel flex items-center justify-center font-serif font-bold text-sm">
              DB
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm tracking-wide leading-tight">
                DEE BAKES STUDIO
              </h2>
              <p className="text-[10px] text-ivory/60 flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    !settings.pause_orders ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {!settings.pause_orders ? 'Kitchen Open' : 'Orders Paused'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleStorePause}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                !settings.pause_orders
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              <Power className="w-3 h-3" />
              <span>{!settings.pause_orders ? 'Open' : 'Pause'}</span>
            </button>

            <button
              onClick={logout}
              className="p-1.5 text-ivory/60 hover:text-white"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (WhatsApp Business Style) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-espresso-900/98 backdrop-blur-md border-t border-caramel/20 px-2 py-2 flex items-center justify-around text-ivory">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-sand font-bold' : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1 rounded-full text-[9px] font-bold bg-amber-500 text-espresso-950">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
