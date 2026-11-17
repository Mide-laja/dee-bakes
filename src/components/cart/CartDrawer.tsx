'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { DBStore, useStoreSettings } from '@/lib/store';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, subtotal, itemCount } =
    useCart();
  const settings = useStoreSettings();

  if (!isCartOpen) return null;

  const minOrder = settings.min_order_amount || 0;
  const isBelowMin = subtotal < minOrder;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-espresso-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ivory dark:bg-espresso-900 border-l border-caramel/20 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-caramel/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-caramel" />
              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                Your Order Bag ({itemCount})
              </h3>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="p-1.5 rounded-lg text-espresso/60 dark:text-ivory/60 hover:bg-caramel/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-caramel/15 flex items-center justify-center text-caramel mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-80" />
                </div>
                <h4 className="font-serif text-xl font-medium text-espresso dark:text-ivory">
                  Your bag is empty
                </h4>
                <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1 max-w-xs">
                  Discover our freshly rolled shawarmas, hand-twisted brioche doughnuts and artisan cakes.
                </p>
                <Link
                  href="/menu"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-caramel text-ivory font-medium text-sm hover:bg-caramel-600 transition-all shadow-sm"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-white/70 dark:bg-espresso-800/80 border border-caramel/15 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-caramel/10">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1561651823-34feb02250e4'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium text-sm text-espresso dark:text-ivory line-clamp-1">
                          {item.product.name}
                        </h5>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                          className="text-red-400 hover:text-red-600 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variation badge */}
                      {item.selected_variation && (
                        <p className="text-[11px] text-caramel dark:text-sand font-medium mt-0.5">
                          {item.selected_variation.name}: {item.selected_variation.option_name}
                        </p>
                      )}

                      {/* Custom Cake Specifications */}
                      {item.custom_cake_options && (
                        <div className="mt-1 text-[11px] text-espresso/70 dark:text-ivory/70 bg-caramel/10 p-1.5 rounded-lg space-y-0.5">
                          <p>
                            <strong>Size:</strong> {item.custom_cake_options.cake_size} |{' '}
                            <strong>Flavour:</strong> {item.custom_cake_options.flavour}
                          </p>
                          {item.custom_cake_options.cake_message && (
                            <p className="italic text-caramel">
                              "{item.custom_cake_options.cake_message}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity controls and price */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-caramel/10">
                      <div className="flex items-center gap-2 border border-caramel/25 rounded-lg px-2 py-0.5 bg-ivory/50 dark:bg-espresso-900/50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-espresso/70 dark:text-ivory/70 hover:text-caramel p-0.5"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-1 text-espresso dark:text-ivory min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-espresso/70 dark:text-ivory/70 hover:text-caramel p-0.5"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-semibold text-sm text-espresso dark:text-ivory">
                        {formatCurrency(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-caramel/20 bg-ivory/80 dark:bg-espresso-950/80 space-y-3">
              <div className="space-y-1.5 text-xs text-espresso/70 dark:text-ivory/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-espresso dark:text-ivory text-sm">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery calculation</span>
                  <span className="italic">Calculated at checkout</span>
                </div>
              </div>

              {isBelowMin && (
                <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/15 p-2 rounded-lg">
                  Minimum order amount is {formatCurrency(minOrder)}. Add{' '}
                  {formatCurrency(minOrder - subtotal)} more to checkout.
                </div>
              )}

              <Link
                href="/checkout"
                onClick={closeCart}
                className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isBelowMin
                    ? 'bg-espresso-400 dark:bg-espresso-700 text-ivory/60 cursor-not-allowed pointer-events-none'
                    : 'bg-caramel text-ivory hover:bg-caramel-600 hover:shadow-warm active:scale-[0.99]'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-[10px] text-espresso/50 dark:text-ivory/50">
                Direct Nigerian Bank Transfer & WhatsApp Confirmation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
