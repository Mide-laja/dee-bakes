'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Building2,
  Store,
  Layout,
  BarChart3,
  Tag,
  Plus,
  Trash2,
  Edit,
  Check,
  Save,
  Power,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Truck,
  Sliders,
} from 'lucide-react';
import { DBStore, storeEvents } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Category, DeliveryZone, Promotion, StoreSettings } from '@/types';

function MoreContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'payment';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [settings, setSettings] = useState<StoreSettings>(DBStore.getSettings());
  const [categories, setCategories] = useState<Category[]>(DBStore.getCategories());
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(DBStore.getDeliveryZones());
  const [orders, setOrders] = useState(DBStore.getOrders());
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states for settings
  const [bankName, setBankName] = useState(settings.bank_name);
  const [bankAccountName, setBankAccountName] = useState(settings.bank_account_name);
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bank_account_number);
  const [bankInstructions, setBankInstructions] = useState(settings.bank_payment_instructions);
  const [enableCod, setEnableCod] = useState(settings.enable_cash_on_delivery);

  // Business settings
  const [storeName, setStoreName] = useState(settings.store_name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phoneNumber, setPhoneNumber] = useState(settings.phone_number);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [physicalAddress, setPhysicalAddress] = useState(settings.physical_address);
  const [minOrder, setMinOrder] = useState(settings.min_order_amount.toString());
  const [pauseOrders, setPauseOrders] = useState(settings.pause_orders);
  const [pauseMessage, setPauseMessage] = useState(settings.pause_message);
  const [openingHours, setOpeningHours] = useState(settings.opening_hours);

  // Storefront settings
  const [heroHeadline, setHeroHeadline] = useState(settings.hero_headline);
  const [heroSubheadline, setHeroSubheadline] = useState(settings.hero_subheadline);
  const [heroVideoUrl, setHeroVideoUrl] = useState(settings.hero_video_url);
  const [heroPosterUrl, setHeroPosterUrl] = useState(settings.hero_poster_url);
  const [aboutStory, setAboutStory] = useState(settings.about_story);
  const [instagramHandle, setInstagramHandle] = useState(settings.instagram_handle);

  // Category modal
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImg, setNewCatImg] = useState('');

  // Zone editing
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneFeeInput, setZoneFeeInput] = useState('');

  useEffect(() => {
    const unsub = storeEvents.subscribe('settings', () => {
      setSettings(DBStore.getSettings());
    });
    return unsub;
  }, []);

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DBStore.updateSettings({
      bank_name: bankName,
      bank_account_name: bankAccountName,
      bank_account_number: bankAccountNumber,
      bank_payment_instructions: bankInstructions,
      enable_cash_on_delivery: enableCod,
    });
    showSaveFeedback();
  };

  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DBStore.updateSettings({
      store_name: storeName,
      tagline,
      phone_number: phoneNumber,
      whatsapp_number: whatsappNumber,
      physical_address: physicalAddress,
      min_order_amount: parseFloat(minOrder) || 0,
      pause_orders: pauseOrders,
      pause_message: pauseMessage,
      opening_hours: openingHours,
    });
    showSaveFeedback();
  };

  const handleSaveStorefront = (e: React.FormEvent) => {
    e.preventDefault();
    DBStore.updateSettings({
      hero_headline: heroHeadline,
      hero_subheadline: heroSubheadline,
      hero_video_url: heroVideoUrl,
      hero_poster_url: heroPosterUrl,
      about_story: aboutStory,
      instagram_handle: instagramHandle,
    });
    showSaveFeedback();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    DBStore.saveCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      image_url:
        newCatImg.trim() ||
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    });

    setCategories(DBStore.getCategories());
    setNewCatName('');
    setNewCatDesc('');
    setNewCatImg('');
    showSaveFeedback();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      DBStore.deleteCategory(id);
      setCategories(DBStore.getCategories());
    }
  };

  const handleUpdateZoneFee = (zone: DeliveryZone) => {
    const newFee = parseFloat(zoneFeeInput);
    if (!isNaN(newFee)) {
      DBStore.saveDeliveryZone({
        ...zone,
        fee: newFee,
      });
      setDeliveryZones(DBStore.getDeliveryZones());
      setEditingZone(null);
      showSaveFeedback();
    }
  };

  const showSaveFeedback = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Compute analytics
  const confirmedOrders = orders.filter((o) => o.payment_status === 'payment_confirmed');
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const avgOrderValue = confirmedOrders.length > 0 ? totalRevenue / confirmedOrders.length : 0;
  const deliveryOrdersCount = orders.filter((o) => o.order_type === 'delivery').length;
  const pickupOrdersCount = orders.filter((o) => o.order_type === 'pickup').length;

  const tabs = [
    { id: 'payment', label: 'Bank & Payments', icon: CreditCard },
    { id: 'business', label: 'Business & Delivery', icon: Store },
    { id: 'storefront', label: 'Storefront Editor', icon: Layout },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-caramel dark:text-sand">
            Studio Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory mt-0.5">
            Settings & Operations
          </h1>
          <p className="text-xs text-espresso/60 dark:text-ivory/60">
            Configure Nigerian bank details, delivery zones, hero video, and categories.
          </p>
        </div>

        {savedNotice && (
          <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-caramel/15">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-caramel text-caramel dark:text-sand font-bold'
                  : 'border-transparent text-espresso/60 dark:text-ivory/60 hover:text-espresso dark:hover:text-ivory'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BANK & PAYMENT SETTINGS */}
      {activeTab === 'payment' && (
        <div className="max-w-3xl space-y-6">
          <form
            onSubmit={handleSavePaymentSettings}
            className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm space-y-6 text-xs"
          >
            <div className="flex items-center gap-3 border-b border-caramel/15 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-caramel/15 flex items-center justify-center text-caramel">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
                  Direct Nigerian Bank Account Details
                </h3>
                <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                  These details are displayed to customers during checkout and on their invoice.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Guaranty Trust Bank (GTBank)"
                  className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="e.g. DEE BAKES CONFECTIONERY"
                  className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="e.g. 0234567891"
                className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-mono font-bold text-sm tracking-wider"
              />
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Payment Instructions for Customers *
              </label>
              <textarea
                rows={3}
                value={bankInstructions}
                onChange={(e) => setBankInstructions(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
              />
            </div>

            {/* Additional payment method: Cash on Delivery toggle */}
            <div className="pt-2 border-t border-caramel/15">
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-ivory dark:bg-espresso-900 border border-caramel/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCod}
                  onChange={(e) => setEnableCod(e.target.checked)}
                  className="w-4 h-4 rounded text-caramel focus:ring-0"
                />
                <div>
                  <span className="font-bold text-sm text-espresso dark:text-ivory block">
                    Enable Cash on Delivery / Pickup Option
                  </span>
                  <span className="text-[11px] text-espresso/60 dark:text-ivory/60">
                    Allows customers to pay in cash or via POS machine upon collecting their food.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-caramel text-ivory font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Bank Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BUSINESS & DELIVERY ZONES */}
      {activeTab === 'business' && (
        <div className="max-w-4xl space-y-8">
          {/* General Business Form */}
          <form
            onSubmit={handleSaveBusinessSettings}
            className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm space-y-6 text-xs"
          >
            <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory border-b border-caramel/15 pb-3">
              Store Operations & Contact
            </h3>

            {/* Store Order Pause Toggle */}
            <div className="p-4 rounded-2xl bg-ivory dark:bg-espresso-900 border border-caramel/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-espresso dark:text-ivory block">
                  Store Order Capacity Control
                </span>
                <span className="text-[11px] text-espresso/60 dark:text-ivory/60">
                  Temporarily pause new orders if the kitchen is at full capacity.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPauseOrders(!pauseOrders)}
                className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  !pauseOrders
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{!pauseOrders ? 'Store Active (Accepting)' : 'Orders Paused'}</span>
              </button>
            </div>

            {pauseOrders && (
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Notice Displayed to Customers when Paused
                </label>
                <input
                  type="text"
                  value={pauseMessage}
                  onChange={(e) => setPauseMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  WhatsApp Number (with country code e.g. 2348123456789)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Physical Kitchen Address
              </label>
              <input
                type="text"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Minimum Order Amount in NGN (₦)
                </label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-caramel text-ivory font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Business Settings</span>
              </button>
            </div>
          </form>

          {/* Delivery Zones & Fees Editor */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-caramel/15 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory flex items-center gap-2">
                  <Truck className="w-5 h-5 text-caramel" />
                  <span>Delivery Zones & Charges (Lagos)</span>
                </h3>
                <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                  Update delivery fees charged to customers automatically during checkout.
                </p>
              </div>
            </div>

            <div className="divide-y divide-caramel/10">
              {deliveryZones.map((zone) => (
                <div key={zone.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-sm text-espresso dark:text-ivory">{zone.name}</h5>
                    <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                      {zone.description} • Est: {zone.estimated_time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingZone?.id === zone.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={zoneFeeInput}
                          onChange={(e) => setZoneFeeInput(e.target.value)}
                          className="w-24 px-2.5 py-1 rounded-lg bg-ivory dark:bg-espresso-900 border border-caramel text-xs font-bold"
                          placeholder="Fee in ₦"
                        />
                        <button
                          onClick={() => handleUpdateZoneFee(zone)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white"
                          title="Save fee"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingZone(null)}
                          className="p-1.5 rounded-lg text-espresso/60 dark:text-ivory/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-serif font-bold text-sm text-caramel dark:text-sand">
                          {zone.fee === 0 ? 'FREE' : formatCurrency(zone.fee)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingZone(zone);
                            setZoneFeeInput(zone.fee.toString());
                          }}
                          className="p-1.5 rounded-lg text-caramel hover:bg-caramel/10"
                          title="Edit fee"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOREFRONT EDITOR */}
      {activeTab === 'storefront' && (
        <div className="max-w-3xl space-y-6">
          <form
            onSubmit={handleSaveStorefront}
            className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm space-y-5 text-xs"
          >
            <div className="flex items-center justify-between border-b border-caramel/15 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
                  Cinematic Hero & Storefront Media
                </h3>
                <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                  Update homepage hero video, headlines, story, and social links in real time.
                </p>
              </div>
              <a
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-caramel font-semibold hover:underline"
              >
                <span>Preview Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Hero Video MP4 URL (Background Close-Up Food Commercial)
              </label>
              <input
                type="text"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="/videos/hero-shawarma.mp4 or https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
              />
              <span className="text-[10px] text-espresso/50 dark:text-ivory/50 mt-1 block">
                Direct URL to looping MP4 video of sliced shawarma with dripping creamy sauce.
              </span>
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Hero Poster Fallback Image URL
              </label>
              <input
                type="text"
                value={heroPosterUrl}
                onChange={(e) => setHeroPosterUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Hero Headline *
              </label>
              <input
                type="text"
                required
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory font-serif text-sm font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Hero Supporting Text
              </label>
              <textarea
                rows={2}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="w-full p-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory"
              />
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                About Narrative / Brand Story
              </label>
              <textarea
                rows={4}
                value={aboutStory}
                onChange={(e) => setAboutStory(e.target.value)}
                className="w-full p-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory"
              />
            </div>

            <div>
              <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@deebakesng"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-caramel text-ivory font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Publish Storefront Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="max-w-4xl space-y-6">
          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="p-6 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm space-y-4 text-xs"
          >
            <h4 className="font-serif text-base font-bold text-espresso dark:text-ivory">
              Add New Product Category
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Waffles & Crepes"
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Fluffy artisan Belgian waffles"
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newCatImg}
                  onChange={(e) => setNewCatImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-espresso dark:text-ivory"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-caramel text-ivory font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-sm flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-caramel/10">
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-espresso dark:text-ivory">
                      {cat.name}
                    </h5>
                    <p className="text-[11px] text-espresso/60 dark:text-ivory/60 line-clamp-1 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & REVENUE BREAKDOWN */}
      {activeTab === 'analytics' && (
        <div className="max-w-4xl space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm">
              <span className="text-xs text-espresso/60 dark:text-ivory/60 block">
                Total Confirmed Revenue
              </span>
              <span className="font-serif text-2xl font-bold text-caramel dark:text-sand block mt-1">
                {formatCurrency(totalRevenue)}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm">
              <span className="text-xs text-espresso/60 dark:text-ivory/60 block">
                Average Order Value
              </span>
              <span className="font-serif text-2xl font-bold text-espresso dark:text-ivory block mt-1">
                {formatCurrency(avgOrderValue)}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm">
              <span className="text-xs text-espresso/60 dark:text-ivory/60 block">
                Doorstep Deliveries
              </span>
              <span className="font-serif text-2xl font-bold text-espresso dark:text-ivory block mt-1">
                {deliveryOrdersCount}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm">
              <span className="text-xs text-espresso/60 dark:text-ivory/60 block">
                Kitchen Pickups
              </span>
              <span className="font-serif text-2xl font-bold text-espresso dark:text-ivory block mt-1">
                {pickupOrdersCount}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-warm space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-espresso dark:text-ivory">
              Payment Method Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Direct Bank Transfer:</span>
                <span className="font-bold">
                  {orders.filter((o) => o.payment_method === 'bank_transfer').length} orders
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cash on Delivery / Pickup:</span>
                <span className="font-bold">
                  {orders.filter((o) => o.payment_method === 'cash_on_delivery').length} orders
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading settings...</div>}>
      <MoreContent />
    </Suspense>
  );
}
