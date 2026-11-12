'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  ShoppingBag,
  Clock,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { DBStore, storeEvents } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Product, ProductVariation } from '@/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [products, setProducts] = useState<Product[]>(DBStore.getProducts());
  const [categories, setCategories] = useState(DBStore.getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(actionParam === 'new');

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('30 mins');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(false);

  useEffect(() => {
    const unsub = storeEvents.subscribe('products', () => {
      setProducts(DBStore.getProducts());
    });
    return unsub;
  }, []);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || 'cat-shawarma');
    setPrice('');
    setComparePrice('');
    setDescription('');
    setImageUrl('');
    setPrepTime('30 mins');
    setIsAvailable(true);
    setIsFeatured(false);
    setIsBestseller(false);
    setIsCustomizable(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id);
    setPrice(p.price.toString());
    setComparePrice(p.compare_at_price ? p.compare_at_price.toString() : '');
    setDescription(p.description);
    setImageUrl(p.images[0] || '');
    setPrepTime(p.preparation_time || '30 mins');
    setIsAvailable(p.is_available);
    setIsFeatured(p.is_featured);
    setIsBestseller(p.is_bestseller);
    setIsCustomizable(p.is_customizable);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCat = categories.find((c) => c.id === categoryId);
    const parsedPrice = parseFloat(price) || 0;
    const parsedCompare = comparePrice ? parseFloat(comparePrice) : undefined;

    DBStore.saveProduct({
      id: editingProduct?.id,
      name: name.trim(),
      category_id: categoryId,
      category_name: selectedCat?.name || 'Bakery',
      price: parsedPrice,
      compare_at_price: parsedCompare,
      description: description.trim(),
      preparation_time: prepTime,
      is_available: isAvailable,
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_customizable: isCustomizable,
      images: imageUrl.trim() ? [imageUrl.trim()] : editingProduct?.images || [
        'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
      ],
      variations: editingProduct?.variations || [],
    });

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) {
      DBStore.deleteProduct(id);
    }
  };

  const toggleAvailability = (p: Product) => {
    DBStore.saveProduct({
      ...p,
      is_available: !p.is_available,
    });
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-caramel dark:text-sand">
            Product Catalogue
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso dark:text-ivory mt-0.5">
            Treats & Inventory
          </h1>
          <p className="text-xs text-espresso/60 dark:text-ivory/60">
            Create, edit prices, mark sold out, or add new delicacies.
          </p>
        </div>

        <button
          onClick={openNewProductModal}
          className="px-4 py-2.5 rounded-xl bg-caramel text-ivory text-xs font-semibold hover:bg-caramel-600 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name or category..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-espresso-800 border border-caramel/20 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
        />
      </div>

      {/* Product Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="p-4 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/20 shadow-sm flex flex-col justify-between"
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-caramel/10 relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white uppercase text-center px-1">
                    Sold Out
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-caramel uppercase tracking-wider block">
                  {product.category_name}
                </span>
                <h4 className="font-serif font-bold text-sm text-espresso dark:text-ivory truncate mt-0.5">
                  {product.name}
                </h4>
                <p className="font-serif font-bold text-base text-espresso dark:text-ivory mt-1">
                  {formatCurrency(product.price)}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.is_bestseller && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-caramel/20 text-caramel">
                      Bestseller
                    </span>
                  )}
                  {product.is_customizable && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Bespoke
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 mt-3 border-t border-caramel/10 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleAvailability(product)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  product.is_available
                    ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/25'
                    : 'bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25'
                }`}
              >
                {product.is_available ? 'In Stock' : 'Mark Available'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-1.5 rounded-lg text-espresso/70 dark:text-ivory/70 hover:bg-caramel/10 hover:text-caramel transition-colors"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-espresso-950/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative bg-ivory dark:bg-espresso-900 border border-caramel/25 rounded-3xl max-w-xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-caramel/15 pb-4 mb-5">
              <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                {editingProduct ? 'Edit Product' : 'Add New Bakery Treat'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-espresso/60 dark:text-ivory/60 hover:bg-caramel/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Double Sausage Gourmet Shawarma"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-espresso-800 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-espresso-800 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                    Price in NGN (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-espresso-800 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe delicious fillings, textures, seasonings..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-espresso-800 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>

              <div>
                <label className="font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Product Image URL (Unsplash or Supabase URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-espresso-800 border border-caramel/25 text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-caramel/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-caramel focus:ring-0"
                  />
                  <span className="font-medium text-espresso dark:text-ivory">In Stock</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-caramel/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-caramel focus:ring-0"
                  />
                  <span className="font-medium text-espresso dark:text-ivory">Bestseller</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-caramel/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-caramel focus:ring-0"
                  />
                  <span className="font-medium text-espresso dark:text-ivory">Featured</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-caramel/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="rounded text-caramel focus:ring-0"
                  />
                  <span className="font-medium text-espresso dark:text-ivory">Bespoke Cake</span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-caramel/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-caramel/20 text-espresso/70 dark:text-ivory/70 hover:bg-caramel/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-caramel text-ivory font-semibold hover:bg-caramel-600 transition-colors shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
