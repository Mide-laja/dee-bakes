'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  Store,
  CreditCard,
  Building2,
  Copy,
  Check,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { formatCurrency, generateOrderReference } from '@/lib/utils';
import { DBStore } from '@/lib/store';
import { DeliveryZone, OrderType, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, customerProfile } = useCustomerAuth();
  const settings = DBStore.getSettings();
  const deliveryZones = DBStore.getDeliveryZones();

  // Form fields - prefilled if customer is logged in
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Update fields if user auth resolves after mount
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
    }
  }, [user]);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    deliveryZones.find((z) => z.is_active && z.fee > 0)?.id || ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('12:00 PM - 2:00 PM');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected delivery zone
  const activeZone =
    orderType === 'pickup'
      ? { id: 'pickup', name: 'Self-Pickup at Dee Bakes Kitchen', fee: 0, estimated_time: 'Ready in 45 mins' }
      : deliveryZones.find((z) => z.id === selectedZoneId) || {
          id: 'standard',
          name: 'Standard Delivery',
          fee: 2500,
          estimated_time: '45-60 mins',
        };

  const deliveryFee = orderType === 'pickup' ? 0 : activeZone.fee;
  const totalAmount = subtotal + deliveryFee;

  // Minimum order validation
  const minOrder = settings.min_order_amount || 0;
  const isBelowMin = subtotal < minOrder;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(settings.bank_account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Your order bag is empty.');
      return;
    }

    if (isBelowMin) {
      setErrorMsg(`Minimum order amount is ${formatCurrency(minOrder)}. Please add more treats.`);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your full name and phone number.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Please provide your complete delivery address in Lagos.');
      return;
    }

    setSubmitting(true);

    try {
      const orderRef = generateOrderReference();

      const newOrder = DBStore.createOrder({
        order_reference: orderRef,
        user_id: user?.id,
        customer_id: customerProfile?.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        order_type: orderType,
        delivery_zone_id: orderType === 'delivery' ? activeZone.id : undefined,
        delivery_zone_name: activeZone.name,
        delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        delivery_date: deliveryDate || undefined,
        delivery_time_slot: deliveryTimeSlot,
        subtotal,
        delivery_fee: deliveryFee,
        discount_amount: 0,
        total_amount: totalAmount,
        order_status: 'new',
        payment_status: 'awaiting_payment',
        payment_method: paymentMethod,
        customer_notes: customerNotes.trim() || undefined,
        items: items.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          order_id: '',
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: item.unit_price,
          quantity: item.quantity,
          variation_details: item.selected_variation
            ? `${item.selected_variation.name}: ${item.selected_variation.option_name}`
            : undefined,
          custom_options: item.custom_cake_options,
          subtotal: item.total_price,
          image_url: item.product.images[0],
        })),
      });

      // Clear the cart
      clearCart();

      // Route to the order confirmation / direct bank transfer payment page
      router.push(`/order-confirmation/${newOrder.order_reference}`);
    } catch (err) {
      console.error('Error submitting order', err);
      setErrorMsg('An unexpected error occurred while placing your order. Please try again.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-caramel/15 text-caramel flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-espresso dark:text-ivory">
          Your Bag is Empty
        </h1>
        <p className="text-xs text-espresso/60 dark:text-ivory/60">
          You haven't added any items to your order yet.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-caramel text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-caramel-600 transition-colors shadow-sm"
        >
          <span>Explore Delicious Treats</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
          Complete Your Order
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-1">
          Checkout & Payment
        </h1>
      </div>

      {errorMsg && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-5">
              {/* Account Connection Status Banner */}
              {user ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Signed in as <strong>{user.fullName}</strong>. This order will automatically link to your account dashboard.
                    </span>
                  </div>
                  <Link
                    href="/account"
                    className="underline font-semibold hover:text-emerald-600 shrink-0"
                  >
                    View Account
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-caramel/10 border border-caramel/20 text-espresso/80 dark:text-ivory/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-caramel shrink-0" />
                    <span>
                      Checking out as <strong>Guest</strong>. Have an account?
                    </span>
                  </div>
                  <Link
                    href="/login?redirect=/checkout"
                    className="text-caramel font-semibold underline hover:text-caramel-600 shrink-0"
                  >
                    Log In to Link Order
                  </Link>
                </div>
              )}

              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory flex items-center gap-2">
                <span>1. Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Folashade Adeleke"
                    className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0812 345 6789"
                    className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="For email order confirmation and invoice"
                  className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>
            </div>

            {/* 2. Order Fulfilment: Delivery or Pickup */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-5">
              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                2. Delivery or Kitchen Pickup
              </h3>

              {/* Fulfilment Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    orderType === 'delivery'
                      ? 'bg-caramel/15 border-caramel text-caramel dark:text-sand font-semibold ring-1 ring-caramel'
                      : 'border-caramel/20 text-espresso/70 dark:text-ivory/70 hover:border-caramel'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span className="text-xs font-medium">Doorstep Delivery (Lagos)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    orderType === 'pickup'
                      ? 'bg-caramel/15 border-caramel text-caramel dark:text-sand font-semibold ring-1 ring-caramel'
                      : 'border-caramel/20 text-espresso/70 dark:text-ivory/70 hover:border-caramel'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span className="text-xs font-medium">Kitchen Pickup (Free)</span>
                </button>
              </div>

              {orderType === 'delivery' ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                      Select Delivery Area / Zone *
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
                    >
                      {deliveryZones
                        .filter((z) => z.is_active && z.id !== 'zone-pickup')
                        .map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} — {formatCurrency(zone.fee)} ({zone.estimated_time})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                      Full Delivery Address *
                    </label>
                    <textarea
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. House 14, Plot 3, Admiralty Way, Lekki Phase 1 (Estate security code if any)"
                      rows={2}
                      className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-caramel/10 border border-caramel/20 text-xs text-espresso/80 dark:text-ivory/80 space-y-1">
                  <p className="font-semibold text-caramel dark:text-sand">
                    Pickup Location: DEE BAKES Kitchen
                  </p>
                  <p>{settings.physical_address}</p>
                  <p className="text-[11px] text-espresso/60 dark:text-ivory/60 mt-1">
                    Your treats will be packed fresh and ready for collection upon payment verification.
                  </p>
                </div>
              )}

              {/* Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                    Preferred Time Slot
                  </label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
                  >
                    <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM (Lunch)</option>
                    <option value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM (Afternoon)</option>
                    <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM (Late Afternoon)</option>
                    <option value="5:00 PM - 7:30 PM">5:00 PM - 7:30 PM (Evening / Dinner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1.5">
                  Order Remarks / Special Notes
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Extra pepper on shawarma, call when arriving"
                  className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>
            </div>

            {/* 3. Payment Method: Direct Bank Transfer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-4">
              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                3. Payment Method
              </h3>

              <div className="space-y-3">
                {/* Direct Nigerian Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-caramel/10 border-caramel ring-1 ring-caramel'
                      : 'border-caramel/20 hover:border-caramel'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-caramel/20 flex items-center justify-center text-caramel">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-espresso dark:text-ivory">
                          Direct Nigerian Bank Transfer (Recommended)
                        </h4>
                        <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                          Transfer directly to DEE BAKES verified bank account. Zero gateway fees.
                        </p>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-caramel flex items-center justify-center p-0.5">
                      {paymentMethod === 'bank_transfer' && (
                        <span className="w-2 h-2 rounded-full bg-caramel" />
                      )}
                    </span>
                  </div>

                  {/* Bank Details Preview Box */}
                  <div className="mt-4 p-4 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/20 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-espresso/60 dark:text-ivory/60">Bank:</span>
                      <span className="font-bold text-espresso dark:text-ivory">
                        {settings.bank_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-espresso/60 dark:text-ivory/60">Account Name:</span>
                      <span className="font-bold text-espresso dark:text-ivory">
                        {settings.bank_account_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-caramel/10">
                      <span className="text-espresso/60 dark:text-ivory/60">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-caramel dark:text-sand">
                          {settings.bank_account_number}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAccount();
                          }}
                          className="px-2 py-1 rounded bg-caramel/20 text-caramel dark:text-sand hover:bg-caramel hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Cash on Delivery if enabled in settings */}
                {settings.enable_cash_on_delivery && (
                  <div
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'bg-caramel/10 border-caramel ring-1 ring-caramel'
                        : 'border-caramel/20 hover:border-caramel'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-caramel/20 flex items-center justify-center text-caramel">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-espresso dark:text-ivory">
                            Cash on Delivery / Pickup
                          </h4>
                          <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                            Pay in cash or POS upon delivery or collection.
                          </p>
                        </div>
                      </div>
                      <span className="w-4 h-4 rounded-full border-2 border-caramel flex items-center justify-center p-0.5">
                        {paymentMethod === 'cash_on_delivery' && (
                          <span className="w-2 h-2 rounded-full bg-caramel" />
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-6">
              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory border-b border-caramel/15 pb-4">
                Order Summary ({items.length} items)
              </h3>

              {/* Items preview list */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-caramel/10">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-espresso dark:text-ivory line-clamp-1">
                          {item.quantity}x {item.product.name}
                        </p>
                        {item.selected_variation && (
                          <p className="text-[10px] text-caramel dark:text-sand">
                            {item.selected_variation.option_name}
                          </p>
                        )}
                        {item.custom_cake_options?.cake_message && (
                          <p className="text-[10px] italic text-espresso/60 dark:text-ivory/60">
                            "{item.custom_cake_options.cake_message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-espresso dark:text-ivory shrink-0">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 pt-4 border-t border-caramel/15 text-xs text-espresso/70 dark:text-ivory/70">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-espresso dark:text-ivory">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery ({activeZone.name})</span>
                  <span className="font-semibold text-espresso dark:text-ivory">
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-bold text-espresso dark:text-ivory pt-3 border-t border-caramel/20">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl sm:text-2xl text-caramel dark:text-sand">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/15 text-[11px] text-espresso/70 dark:text-ivory/70 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
                <span>
                  After clicking Place Order, your unique Order Reference will be generated along with bank transfer instructions and instant WhatsApp verification.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || isBelowMin}
                className="w-full py-4 rounded-xl bg-caramel text-ivory font-semibold text-sm tracking-wide hover:bg-caramel-600 transition-all shadow-md hover:shadow-warm active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Creating Your Order...</span>
                ) : (
                  <>
                    <span>Place Order & Transfer Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
