'use client';

import { useState, useEffect } from 'react';
import {
  Category,
  Customer,
  DeliveryZone,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  StoreSettings,
  Testimonial,
} from '@/types';
import {
  DEFAULT_STORE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_DELIVERY_ZONES,
  INITIAL_PRODUCTS,
  INITIAL_TESTIMONIALS,
} from './constants';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'db_products_v1',
  CATEGORIES: 'db_categories_v1',
  ORDERS: 'db_orders_v1',
  SETTINGS: 'db_settings_v1',
  DELIVERY_ZONES: 'db_zones_v1',
  CUSTOMERS: 'db_customers_v1',
  TESTIMONIALS: 'db_testimonials_v1',
};

// Simple event emitter for reactive store updates across tabs / components
class StoreEventEmitter {
  private listeners: Record<string, Array<() => void>> = {};

  subscribe(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  notify(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb());
    }
  }
}

export const storeEvents = new StoreEventEmitter();

/**
 * Custom React hook to subscribe to live store settings.
 * Automatically synchronizes whenever admin settings change or are fetched from Supabase.
 */
export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
    return safeGetItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS);
  });

  useEffect(() => {
    setSettings(safeGetItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS));
    const unsubscribe = storeEvents.subscribe('settings', () => {
      setSettings(safeGetItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS));
    });
    return unsubscribe;
  }, []);

  return settings;
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage`, err);
  }
}

// Initial sample orders for demonstration so admin dashboard isn't completely empty initially
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_reference: 'DB-2026-1049',
    customer_name: 'Folashade Adeleke',
    customer_phone: '+234 803 234 5678',
    customer_email: 'folashade@gmail.com',
    order_type: 'delivery',
    delivery_zone_id: 'zone-lekki-ikoyi',
    delivery_zone_name: 'Lekki Phase 1, Ikoyi & Oniru',
    delivery_address: 'Flat 4B, Oceanview Towers, Lekki Phase 1',
    delivery_date: '2026-11-09',
    delivery_time_slot: '1:00 PM - 2:00 PM',
    subtotal: 10500,
    delivery_fee: 2000,
    discount_amount: 0,
    total_amount: 12500,
    order_status: 'preparing',
    payment_status: 'payment_confirmed',
    payment_method: 'bank_transfer',
    transfer_reference: 'GTB-TRF-982341829',
    customer_notes: 'Please make the shawarma mildly spiced. Call when at the security gate.',
    internal_notes: 'Payment verified by Dee on GTB app. Preparing order.',
    items: [
      {
        id: 'item-1',
        order_id: 'ord-101',
        product_id: 'prod-shawarma-classic',
        product_name: 'Signature Gourmet Chicken Shawarma',
        unit_price: 5500,
        quantity: 1,
        variation_details: 'Size: Double Sausage Jumbo',
        subtotal: 5500,
        image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-2',
        order_id: 'ord-101',
        product_id: 'prod-doughnut-cinnamon',
        product_name: 'Cinnamon Brown Sugar Twisted Doughnuts (Box of 6)',
        unit_price: 6500,
        quantity: 1,
        subtotal: 6500,
        image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80',
      },
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ord-102',
    order_reference: 'DB-2026-8821',
    customer_name: 'Ibrahim Danjuma',
    customer_phone: '+234 818 901 2345',
    customer_email: 'ibrahim.d@outlook.com',
    order_type: 'delivery',
    delivery_zone_id: 'zone-vi',
    delivery_zone_name: 'Victoria Island & Marina',
    delivery_address: 'Plot 12A Karimu Kotun, Victoria Island',
    delivery_date: '2026-11-09',
    delivery_time_slot: '3:30 PM - 4:30 PM',
    subtotal: 19500,
    delivery_fee: 2500,
    discount_amount: 0,
    total_amount: 22000,
    order_status: 'accepted',
    payment_status: 'payment_evidence_submitted',
    payment_method: 'bank_transfer',
    transfer_reference: 'ZENITH-REF-4491028',
    payment_evidence_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    customer_notes: 'Extra pepper sauce for the small chops if possible.',
    items: [
      {
        id: 'item-3',
        order_id: 'ord-102',
        product_id: 'prod-small-chops-platter',
        product_name: 'Lagos Party Small Chops Platter (50 Pieces)',
        unit_price: 19500,
        quantity: 1,
        subtotal: 19500,
        image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80',
      },
    ],
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString(),
  },
];

let isInitialized = false;

export const DBStore = {
  // Initialize Cloud Sync with Supabase
  async initCloudSync() {
    if (isInitialized || typeof window === 'undefined') return;
    isInitialized = true;

    if (!isSupabaseConfigured() || !supabase) {
      console.log('DEE BAKES: Running in Local Offline Mode. Connect Supabase for multi-device sync.');
      return;
    }

    try {
      console.log('DEE BAKES: Initializing Cloud Sync with Supabase PostgreSQL...');

      // 1. Fetch Store Settings (via Cloud API / Supabase)
      await this.fetchSettingsFromCloud();

      // 2. Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*').order('display_order');
      if (catData && catData.length > 0) {
        safeSetItem(STORAGE_KEYS.CATEGORIES, catData);
        storeEvents.notify('categories');
      }

      // 3. Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodData && prodData.length > 0) {
        // Map to internal format if needed
        const mappedProducts: Product[] = prodData.map((p) => ({
          ...p,
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [INITIAL_PRODUCTS[0].images[0]],
        }));
        safeSetItem(STORAGE_KEYS.PRODUCTS, mappedProducts);
        storeEvents.notify('products');
      }

      // 4. Fetch Orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (orderData && orderData.length > 0) {
        const mappedOrders: Order[] = orderData.map((o) => ({
          ...o,
          items: (o.order_items || []).map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            variation_details: item.variation_details,
            custom_options: item.custom_options,
            subtotal: item.subtotal,
          })),
        }));
        safeSetItem(STORAGE_KEYS.ORDERS, mappedOrders);
        storeEvents.notify('orders');
      }

      // 5. Setup Realtime Subscription on orders
      supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
          console.log('DEE BAKES: Realtime order update detected from Supabase.');
          const { data: freshOrders } = await supabase!
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false });

          if (freshOrders) {
            const mappedOrders: Order[] = freshOrders.map((o) => ({
              ...o,
              items: (o.order_items || []).map((item: any) => ({
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                product_name: item.product_name,
                unit_price: item.unit_price,
                quantity: item.quantity,
                variation_details: item.variation_details,
                custom_options: item.custom_options,
                subtotal: item.subtotal,
              })),
            }));
            safeSetItem(STORAGE_KEYS.ORDERS, mappedOrders);
            storeEvents.notify('orders');
          }
        })
        .subscribe();

      // 6. Setup Realtime Subscription on store_settings
      supabase
        .channel('public:store_settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload: any) => {
          console.log('DEE BAKES: Realtime store_settings update detected from Supabase:', payload);
          if (payload.new) {
            const current = safeGetItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS);
            const updated = { ...current, ...payload.new };
            safeSetItem(STORAGE_KEYS.SETTINGS, updated);
            storeEvents.notify('settings');
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('DEE BAKES: Could not sync with Supabase', err);
    }
  },

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return safeGetItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  saveProduct(product: Partial<Product> & { name: string; price: number }): Product {
    const products = this.getProducts();
    let updatedProduct: Product;

    if (product.id) {
      // Edit
      updatedProduct = {
        ...products.find((p) => p.id === product.id)!,
        ...product,
      };
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        products[index] = updatedProduct;
      }
    } else {
      // Create
      const slug =
        product.slug ||
        product.name
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
      updatedProduct = {
        id: `prod-${Date.now()}`,
        category_id: product.category_id || 'cat-shawarma',
        category_name: product.category_name,
        name: product.name,
        slug,
        description: product.description || '',
        price: product.price,
        compare_at_price: product.compare_at_price,
        is_available: product.is_available !== false,
        is_featured: !!product.is_featured,
        is_bestseller: !!product.is_bestseller,
        is_customizable: !!product.is_customizable,
        stock_quantity: product.stock_quantity ?? -1,
        preparation_time: product.preparation_time || '30 mins',
        images: product.images && product.images.length ? product.images : [INITIAL_PRODUCTS[0].images[0]],
        variations: product.variations || [],
      };
      products.unshift(updatedProduct);
    }

    safeSetItem(STORAGE_KEYS.PRODUCTS, products);
    storeEvents.notify('products');

    // Async sync to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      supabase.from('products').upsert({
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        description: updatedProduct.description,
        price: updatedProduct.price,
        compare_at_price: updatedProduct.compare_at_price,
        is_available: updatedProduct.is_available,
        is_featured: updatedProduct.is_featured,
        is_bestseller: updatedProduct.is_bestseller,
        is_customizable: updatedProduct.is_customizable,
        stock_quantity: updatedProduct.stock_quantity,
        preparation_time: updatedProduct.preparation_time,
      }).then(({ error }) => {
        if (error) console.warn('Supabase product sync error:', error);
      });
    }

    return updatedProduct;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    safeSetItem(STORAGE_KEYS.PRODUCTS, products);
    storeEvents.notify('products');

    if (isSupabaseConfigured() && supabase) {
      supabase.from('products').delete().eq('id', id).then();
    }
  },

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return safeGetItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategory(category: Partial<Category> & { name: string }): Category {
    const categories = this.getCategories();
    let updatedCategory: Category;

    if (category.id) {
      updatedCategory = {
        ...categories.find((c) => c.id === category.id)!,
        ...category,
      };
      const index = categories.findIndex((c) => c.id === category.id);
      if (index !== -1) categories[index] = updatedCategory;
    } else {
      const slug =
        category.slug ||
        category.name
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
      updatedCategory = {
        id: `cat-${Date.now()}`,
        name: category.name,
        slug,
        description: category.description || '',
        image_url: category.image_url || INITIAL_CATEGORIES[0].image_url,
        display_order: category.display_order || categories.length + 1,
        is_active: category.is_active !== false,
      };
      categories.push(updatedCategory);
    }

    safeSetItem(STORAGE_KEYS.CATEGORIES, categories);
    storeEvents.notify('categories');

    if (isSupabaseConfigured() && supabase) {
      supabase.from('categories').upsert({
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        image_url: updatedCategory.image_url,
        display_order: updatedCategory.display_order,
        is_active: updatedCategory.is_active,
      }).then();
    }

    return updatedCategory;
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories().filter((c) => c.id !== id);
    safeSetItem(STORAGE_KEYS.CATEGORIES, categories);
    storeEvents.notify('categories');

    if (isSupabaseConfigured() && supabase) {
      supabase.from('categories').delete().eq('id', id).then();
    }
  },

  // --- ORDERS ---
  getOrders(): Order[] {
    return safeGetItem<Order[]>(STORAGE_KEYS.ORDERS, SEED_ORDERS);
  },

  getOrderByReference(reference: string): Order | undefined {
    return this.getOrders().find(
      (o) => o.order_reference.toLowerCase() === reference.toLowerCase()
    );
  },

  getOrdersForCustomer(userId?: string, email?: string, phone?: string): Order[] {
    const orders = this.getOrders();
    return orders.filter((o) => {
      if (userId && o.user_id && o.user_id === userId) return true;
      if (email && o.customer_email && o.customer_email.toLowerCase() === email.toLowerCase()) return true;
      if (phone && o.customer_phone && o.customer_phone.replace(/\D/g, '') === phone.replace(/\D/g, '')) return true;
      return false;
    });
  },

  createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    safeSetItem(STORAGE_KEYS.ORDERS, orders);
    storeEvents.notify('orders');

    // Sync to Supabase
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .insert({
          order_reference: newOrder.order_reference,
          user_id: newOrder.user_id,
          customer_id: newOrder.customer_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          order_type: newOrder.order_type,
          delivery_zone_id: newOrder.delivery_zone_id,
          delivery_address: newOrder.delivery_address,
          delivery_date: newOrder.delivery_date,
          delivery_time_slot: newOrder.delivery_time_slot,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.delivery_fee,
          discount_amount: newOrder.discount_amount,
          total_amount: newOrder.total_amount,
          order_status: newOrder.order_status,
          payment_status: newOrder.payment_status,
          payment_method: newOrder.payment_method,
          customer_notes: newOrder.customer_notes,
        })
        .select()
        .single()
        .then(({ data: createdRow, error }) => {
          if (!error && createdRow && newOrder.items.length > 0) {
            const itemsToInsert = newOrder.items.map((it) => ({
              order_id: createdRow.id,
              product_name: it.product_name,
              unit_price: it.unit_price,
              quantity: it.quantity,
              variation_details: it.variation_details,
              custom_options: it.custom_options,
              subtotal: it.subtotal,
            }));
            supabase!.from('order_items').insert(itemsToInsert).then();
          }
        });
    }

    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, internalNote?: string): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_reference === orderId);
    if (index === -1) return null;

    orders[index].order_status = status;
    orders[index].updated_at = new Date().toISOString();
    if (internalNote) {
      orders[index].internal_notes = `${orders[index].internal_notes ? orders[index].internal_notes + '\n' : ''}[${new Date().toLocaleTimeString()}]: ${internalNote}`;
    }
    safeSetItem(STORAGE_KEYS.ORDERS, orders);
    storeEvents.notify('orders');

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .update({
          order_status: status,
          internal_notes: orders[index].internal_notes,
          updated_at: orders[index].updated_at,
        })
        .or(`id.eq.${orderId},order_reference.eq.${orderId}`)
        .then();
    }

    return orders[index];
  },

  updateOrderPayment(
    orderId: string,
    paymentStatus: PaymentStatus,
    extra?: { transferReference?: string; evidenceUrl?: string; adminNote?: string }
  ): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_reference === orderId);
    if (index === -1) return null;

    orders[index].payment_status = paymentStatus;
    if (extra?.transferReference) orders[index].transfer_reference = extra.transferReference;
    if (extra?.evidenceUrl) orders[index].payment_evidence_url = extra.evidenceUrl;
    if (extra?.adminNote) {
      orders[index].internal_notes = `${orders[index].internal_notes ? orders[index].internal_notes + '\n' : ''}[Payment Update - ${new Date().toLocaleTimeString()}]: ${extra.adminNote}`;
    }
    orders[index].updated_at = new Date().toISOString();

    safeSetItem(STORAGE_KEYS.ORDERS, orders);
    storeEvents.notify('orders');

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          transfer_reference: orders[index].transfer_reference,
          payment_evidence_url: orders[index].payment_evidence_url,
          internal_notes: orders[index].internal_notes,
          updated_at: orders[index].updated_at,
        })
        .or(`id.eq.${orderId},order_reference.eq.${orderId}`)
        .then();
    }

    return orders[index];
  },

  // --- SETTINGS ---
  getSettings(): StoreSettings {
    return safeGetItem<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS);
  },

  /**
   * Fetches the latest business settings from the cloud (Server API or Supabase directly).
   * Overwrites local cache and notifies all reactive subscribers.
   */
  async fetchSettingsFromCloud(): Promise<StoreSettings> {
    const current = this.getSettings();
    if (typeof window === 'undefined') return current;

    try {
      // 1. Try server API route first (supports secure Service Role key)
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          const merged: StoreSettings = { ...DEFAULT_STORE_SETTINGS, ...json.settings };
          safeSetItem(STORAGE_KEYS.SETTINGS, merged);
          storeEvents.notify('settings');
          return merged;
        }
      }
    } catch {
      // API fetch failed or offline; fallback to direct Supabase
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (!error && data) {
          const merged: StoreSettings = { ...DEFAULT_STORE_SETTINGS, ...data };
          safeSetItem(STORAGE_KEYS.SETTINGS, merged);
          storeEvents.notify('settings');
          return merged;
        }
      } catch (err) {
        console.warn('DEE BAKES: Error fetching settings from Supabase client', err);
      }
    }

    return current;
  },

  /**
   * Persists business settings to Supabase and notifies all reactive UI components.
   * Returns a promise with success status and actual error message on failure.
   */
  async updateSettings(
    settings: Partial<StoreSettings>
  ): Promise<{ success: boolean; data?: StoreSettings; error?: string }> {
    const current = this.getSettings();
    const payload: StoreSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    let lastError: string | null = null;

    // 1. Attempt update via Server API route (uses Service Role Key if available, avoids client RLS hurdles)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          const merged: StoreSettings = { ...current, ...json.settings };
          safeSetItem(STORAGE_KEYS.SETTINGS, merged);
          storeEvents.notify('settings');
          return { success: true, data: merged };
        } else if (json.error) {
          lastError = json.error;
        }
      } else {
        const json = await res.json().catch(() => null);
        lastError = json?.error || `Server API responded with HTTP status ${res.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Network request failed';
    }

    // 2. Direct client fallback with Supabase (if API route wasn't reachable)
    if (isSupabaseConfigured() && supabase) {
      try {
        const dbPayload = {
          id: 1,
          store_name: payload.store_name,
          tagline: payload.tagline,
          phone_number: payload.phone_number,
          whatsapp_number: payload.whatsapp_number,
          email: payload.email,
          physical_address: payload.physical_address,
          bank_name: payload.bank_name,
          bank_account_name: payload.bank_account_name,
          bank_account_number: payload.bank_account_number,
          bank_payment_instructions: payload.bank_payment_instructions,
          is_store_open: payload.is_store_open,
          pause_orders: payload.pause_orders,
          pause_message: payload.pause_message,
          min_order_amount: payload.min_order_amount,
          enable_cash_on_delivery: payload.enable_cash_on_delivery,
          hero_headline: payload.hero_headline,
          hero_subheadline: payload.hero_subheadline,
          hero_video_url: payload.hero_video_url,
          hero_poster_url: payload.hero_poster_url,
          about_story: payload.about_story,
          opening_hours: payload.opening_hours,
          instagram_handle: payload.instagram_handle,
          updated_at: payload.updated_at,
        };

        const { data, error } = await supabase
          .from('store_settings')
          .upsert(dbPayload, { onConflict: 'id' })
          .select()
          .single();

        if (!error && data) {
          const merged: StoreSettings = { ...current, ...data };
          safeSetItem(STORAGE_KEYS.SETTINGS, merged);
          storeEvents.notify('settings');
          return { success: true, data: merged };
        } else if (error) {
          lastError = error.message;
        }
      } catch (err: any) {
        lastError = err?.message || 'Database error occurred';
      }
    }

    // 3. If Supabase is not configured (local dev offline mode), save locally
    if (!isSupabaseConfigured()) {
      safeSetItem(STORAGE_KEYS.SETTINGS, payload);
      storeEvents.notify('settings');
      return { success: true, data: payload };
    }

    // 4. Return explicit failure with the real error message
    return {
      success: false,
      error:
        lastError ||
        'Failed to persist settings to Supabase. Please ensure the admin_settings_migration.sql script has been executed in your Supabase SQL editor.',
    };
  },

  // --- DELIVERY ZONES ---
  getDeliveryZones(): DeliveryZone[] {
    return safeGetItem<DeliveryZone[]>(STORAGE_KEYS.DELIVERY_ZONES, INITIAL_DELIVERY_ZONES);
  },

  saveDeliveryZone(zone: Partial<DeliveryZone> & { name: string; fee: number }): DeliveryZone {
    const zones = this.getDeliveryZones();
    let updatedZone: DeliveryZone;

    if (zone.id) {
      updatedZone = {
        ...zones.find((z) => z.id === zone.id)!,
        ...zone,
      };
      const index = zones.findIndex((z) => z.id === zone.id);
      if (index !== -1) zones[index] = updatedZone;
    } else {
      updatedZone = {
        id: `zone-${Date.now()}`,
        name: zone.name,
        description: zone.description || '',
        fee: zone.fee,
        estimated_time: zone.estimated_time || '45-60 mins',
        is_active: zone.is_active !== false,
      };
      zones.push(updatedZone);
    }

    safeSetItem(STORAGE_KEYS.DELIVERY_ZONES, zones);
    storeEvents.notify('zones');

    if (isSupabaseConfigured() && supabase) {
      supabase.from('delivery_zones').upsert(updatedZone).then();
    }

    return updatedZone;
  },

  // --- CUSTOMERS ---
  getCustomers(): Customer[] {
    const orders = this.getOrders();
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const phone = order.customer_phone.trim();
      const existing = customerMap.get(phone);
      const isPaid = order.payment_status === 'payment_confirmed';

      if (existing) {
        existing.total_orders += 1;
        if (isPaid) existing.total_spent += order.total_amount;
        if (!existing.email && order.customer_email) existing.email = order.customer_email;
        if (!existing.default_address && order.delivery_address) existing.default_address = order.delivery_address;
        if (new Date(order.created_at) > new Date(existing.last_order_date || '1970-01-01')) {
          existing.last_order_date = order.created_at;
        }
      } else {
        customerMap.set(phone, {
          id: `cust-${phone.replace(/\D/g, '')}`,
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
          default_address: order.delivery_address,
          total_orders: 1,
          total_spent: isPaid ? order.total_amount : 0,
          last_order_date: order.created_at,
          created_at: order.created_at,
        });
      }
    });

    return Array.from(customerMap.values());
  },

  // --- TESTIMONIALS ---
  getTestimonials(): Testimonial[] {
    return safeGetItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  },
};
