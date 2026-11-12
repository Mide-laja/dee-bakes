'use client';

import React, { useState } from 'react';
import { X, Check, ShoppingBag, Clock, Sparkles, Plus, Minus } from 'lucide-react';
import { Product, ProductVariation } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(product?.images[0] || '');
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product?.variations?.find((v) => v.is_default) || product?.variations?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentPrice = product.price + (selectedVariation ? selectedVariation.price_modifier : 0);
  const activeImage = selectedImage || product.images[0];

  const handleAdd = () => {
    if (product.is_customizable) {
      window.location.href = `/custom-cakes?product=${product.slug}`;
      return;
    }

    addToCart(product, quantity, selectedVariation);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-espresso-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-ivory dark:bg-espresso-900 border border-caramel/25 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-ivory/80 dark:bg-espresso-800/80 text-espresso dark:text-ivory hover:bg-caramel hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="p-6 flex flex-col justify-between bg-caramel/5">
            <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-inner bg-caramel/10 relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img ? 'border-caramel scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Customisation */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-caramel uppercase tracking-wider mb-1">
                <span>{product.category_name}</span>
                {product.preparation_time && (
                  <span className="flex items-center gap-1 text-espresso/60 dark:text-ivory/60 font-normal">
                    • <Clock className="w-3 h-3" /> {product.preparation_time}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl font-bold text-espresso dark:text-ivory">
                {product.name}
              </h2>

              <p className="text-sm text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
                {product.description}
              </p>

              {/* Variations */}
              {product.variations && product.variations.length > 0 && !product.is_customizable && (
                <div className="mt-5">
                  <label className="text-xs font-bold uppercase text-espresso/80 dark:text-ivory/80 block mb-2">
                    Choose Option / Size:
                  </label>
                  <div className="space-y-1.5">
                    {product.variations.map((v) => {
                      const isSelected = selectedVariation?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariation(v)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-caramel/15 border-caramel text-caramel dark:text-sand font-semibold'
                              : 'border-caramel/20 text-espresso/80 dark:text-ivory/80 hover:border-caramel'
                          }`}
                        >
                          <span>{v.option_name}</span>
                          <span>
                            {v.price_modifier > 0
                              ? `+${formatCurrency(v.price_modifier)}`
                              : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and CTA */}
            <div className="mt-6 pt-5 border-t border-caramel/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-espresso/50 dark:text-ivory/50 block">Total</span>
                  <span className="font-serif text-2xl font-bold text-espresso dark:text-ivory">
                    {formatCurrency(currentPrice * quantity)}
                  </span>
                </div>

                {!product.is_customizable && (
                  <div className="flex items-center gap-3 border border-caramel/30 rounded-xl px-3 py-1.5 bg-ivory/60 dark:bg-espresso-800">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-espresso/70 dark:text-ivory/70 hover:text-caramel p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-semibold text-sm min-w-[20px] text-center text-espresso dark:text-ivory">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-espresso/70 dark:text-ivory/70 hover:text-caramel p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={!product.is_available}
                className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  !product.is_available
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-caramel text-ivory hover:bg-caramel-600 active:scale-[0.99]'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Order Bag!</span>
                  </>
                ) : product.is_customizable ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Open Bespoke Cake Studio</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Bag • {formatCurrency(currentPrice * quantity)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
