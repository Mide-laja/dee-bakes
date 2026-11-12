'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductModal } from '@/components/products/ProductModal';
import { DBStore, storeEvents } from '@/lib/store';
import { Product } from '@/types';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';

  const [products, setProducts] = useState(DBStore.getProducts());
  const [categories, setCategories] = useState(DBStore.getCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'bestsellers'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubP = storeEvents.subscribe('products', () => setProducts(DBStore.getProducts()));
    const unsubC = storeEvents.subscribe('categories', () => setCategories(DBStore.getCategories()));
    return () => {
      unsubP();
      unsubC();
    };
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category match
      const catMatch =
        selectedCategory === 'all' ||
        item.category_id === selectedCategory ||
        item.category_name?.toLowerCase().replace(/ +/g, '-') === selectedCategory;

      // Search match
      const queryMatch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return catMatch && queryMatch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestsellers') return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
          Artisan Selection
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-espresso dark:text-ivory mt-2">
          The Dee Bakes Menu
        </h1>
        <p className="text-sm text-espresso/70 dark:text-ivory/70 mt-2">
          Every treat is baked to order using authentic recipes and the finest gourmet ingredients.
        </p>
      </div>

      {/* Controls: Search & Filter & Sort */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/70 dark:bg-espresso-800/70 p-4 rounded-3xl border border-caramel/15 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shawarma, cakes, doughnuts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-caramel" />
          <span className="text-xs text-espresso/70 dark:text-ivory/70 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none font-medium"
          >
            <option value="featured">Featured First</option>
            <option value="bestsellers">Bestsellers First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-caramel text-ivory shadow-sm'
              : 'bg-white/70 dark:bg-espresso-800/70 text-espresso/80 dark:text-ivory/80 border border-caramel/20 hover:border-caramel'
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.filter((c) => c.is_active).map((cat) => {
          const isSelected =
            selectedCategory === cat.slug || selectedCategory === cat.id;
          const count = products.filter(
            (p) => p.category_id === cat.id || p.category_name === cat.name
          ).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-caramel text-ivory shadow-sm'
                  : 'bg-white/70 dark:bg-espresso-800/70 text-espresso/80 dark:text-ivory/80 border border-caramel/20 hover:border-caramel'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-espresso-800/40 rounded-3xl border border-caramel/15 p-8">
          <p className="font-serif text-2xl font-bold text-espresso dark:text-ivory">
            No treats match your criteria
          </p>
          <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1">
            Try adjusting your search query or select another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-6 py-2 rounded-full bg-caramel text-ivory text-xs font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
