'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { DBStore, storeEvents, useStoreSettings } from '@/lib/store';
import { formatCurrency, formatDate, createWhatsAppLink } from '@/lib/utils';
import { Customer } from '@/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(DBStore.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const settings = useStoreSettings();

  useEffect(() => {
    const unsub = storeEvents.subscribe('orders', () => {
      setCustomers(DBStore.getCustomers());
    });
    return unsub;
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-caramel dark:text-sand">
            Patron Database
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory mt-0.5">
            Customer Directory
          </h1>
          <p className="text-xs text-espresso/60 dark:text-ivory/60">
            Track customer order frequencies, lifetime spending, and WhatsApp contact history.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-caramel/15 text-caramel">
          {customers.length} Patrons
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone or email..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-espresso-800 border border-caramel/20 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const whatsappUrl = createWhatsAppLink(
            customer.phone,
            `Hello ${customer.name}! This is Dee from DEE BAKES checking in with you.`
          );

          return (
            <div
              key={customer.id}
              className="p-5 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-caramel/20 text-caramel flex items-center justify-center font-bold font-serif text-sm">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-espresso dark:text-ivory">
                        {customer.name}
                      </h4>
                      <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>

                {customer.email && (
                  <p className="text-[11px] text-espresso/60 dark:text-ivory/60 mt-2 truncate flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-caramel shrink-0" />
                    <span>{customer.email}</span>
                  </p>
                )}

                {customer.default_address && (
                  <p className="text-[11px] text-espresso/60 dark:text-ivory/60 mt-1 line-clamp-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-caramel shrink-0" />
                    <span>{customer.default_address}</span>
                  </p>
                )}
              </div>

              {/* Stats & Activity */}
              <div className="pt-3 border-t border-caramel/15 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-espresso/50 dark:text-ivory/50 block">Orders</span>
                  <span className="font-bold text-espresso dark:text-ivory">
                    {customer.total_orders} placed
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-espresso/50 dark:text-ivory/50 block">
                    Confirmed Spent
                  </span>
                  <span className="font-serif font-bold text-sm text-caramel dark:text-sand">
                    {formatCurrency(customer.total_spent)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
