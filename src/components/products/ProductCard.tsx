'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart, Sparkles, Clock, Check } from 'lucide-react';
import { Product, ProductVariation } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product.variations?.find((v) => v.is_default) || product.variations?.[0]
  );
  const [added, setAdded] = useState(false);

  const currentPrice = product.price + (selectedVariation ? selectedVariation.price_modifier : 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.is_customizable) {
      // Redirect to custom cake builder
      window.location.href = `/custom-cakes?product=${product.slug}`;
      return;
    }

    addToCart(product, 1, selectedVariation);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 hover:border-caramel/50 transition-all duration-300 overflow-hidden shadow-warm hover:shadow-warm-lg flex flex-col justify-between">
      {/* Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-caramel/10 cursor-pointer">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1561651823-34feb02250e4'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_bestseller && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-caramel text-ivory shadow-sm">
              Bestseller
            </span>
          )}
          {product.is_featured && !product.is_bestseller && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sand text-espresso-900 shadow-sm">
              Chef’s Pick
            </span>
          )}
          {product.is_customizable && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-700 text-ivory shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Bespoke
            </span>
          )}
        </div>

        {/* Quick View Button on hover */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            aria-label="Quick View"
            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-espresso-900/90 text-espresso dark:text-ivory opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-caramel hover:text-white"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Prep Time */}
          <div className="flex items-center justify-between text-[11px] text-espresso/60 dark:text-ivory/60 mb-1.5 font-medium">
            <span className="text-caramel uppercase tracking-wider">{product.category_name}</span>
            {product.preparation_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.preparation_time}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg font-semibold text-espresso dark:text-ivory line-clamp-1 group-hover:text-caramel transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-espresso/70 dark:text-ivory/70 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Variations selector if multiple exist */}
          {product.variations && product.variations.length > 0 && !product.is_customizable && (
            <div className="mt-3 pt-2 border-t border-caramel/10">
              <label className="text-[10px] uppercase font-semibold text-espresso/60 dark:text-ivory/60 block mb-1">
                Select Option:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {product.variations.map((v) => {
                  const isSelected = selectedVariation?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariation(v)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-caramel text-ivory border-caramel font-medium'
                          : 'bg-ivory/50 dark:bg-espresso-900/50 text-espresso/80 dark:text-ivory/80 border-caramel/20 hover:border-caramel'
                      }`}
                    >
                      {v.option_name}
                      {v.price_modifier > 0 && ` (+${formatCurrency(v.price_modifier)})`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pricing and Action Button */}
        <div className="mt-4 pt-3 border-t border-caramel/15 flex items-center justify-between">
          <div>
            <span className="text-xs text-espresso/50 dark:text-ivory/50 block">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold text-espresso dark:text-ivory">
                {formatCurrency(currentPrice)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-espresso/40 dark:text-ivory/40 line-through">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              !product.is_available
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-caramel text-ivory hover:bg-caramel-600 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : product.is_customizable ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customize</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
