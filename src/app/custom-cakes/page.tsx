'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, Cake, Check, ShoppingBag, MessageCircle, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/utils';
import { DBStore } from '@/lib/store';
import { Product } from '@/types';

export default function CustomCakesPage() {
  const { addToCart } = useCart();
  const settings = DBStore.getSettings();

  // Custom cake form state
  const [cakeSize, setCakeSize] = useState('8-inch Round (Serves 12-16)');
  const [flavour, setFlavour] = useState('Royal Red Velvet & Cream Cheese');
  const [designPreference, setDesignPreference] = useState('Vintage Lambeth Piping');
  const [tiers, setTiers] = useState('Single Tier');
  const [cakeMessage, setCakeMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [added, setAdded] = useState(false);

  // Pricing calculation
  const sizePricing: Record<string, number> = {
    '6-inch Round (Serves 6-8)': 25000,
    '8-inch Round (Serves 12-16)': 35000,
    '10-inch Round (Serves 20-25)': 48000,
    '2-Tier Celebration (Serves 30-40)': 65000,
    '3-Tier Grand Luxury (Serves 60+)': 110000,
  };

  const calculatedBasePrice = sizePricing[cakeSize] || 35000;

  const handleOrderCustomCake = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a virtual product or reference the custom cake product
    const customCakeProduct: Product = {
      id: 'prod-cake-custom',
      category_id: 'cat-cakes',
      category_name: 'Cakes',
      name: `Bespoke Cake: ${cakeSize}`,
      slug: 'bespoke-celebration-and-custom-occasion-cake',
      description: `Flavour: ${flavour} | Design: ${designPreference} | Inscription: "${cakeMessage || 'None'}"`,
      price: calculatedBasePrice,
      is_available: true,
      is_featured: true,
      is_bestseller: true,
      is_customizable: true,
      stock_quantity: -1,
      preparation_time: '24-48 hours notice',
      images: [
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      ],
    };

    addToCart(customCakeProduct, 1, undefined, {
      cake_size: cakeSize,
      flavour,
      design_preference: designPreference,
      tiers,
      cake_message: cakeMessage,
      requested_date: deliveryDate || 'As soon as ready',
      special_instructions: specialInstructions,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappInquiryHref = createWhatsAppLink(
    settings.whatsapp_number,
    `Hello Dee! I would love to discuss a custom cake with you:
• Size: ${cakeSize}
• Flavour: ${flavour}
• Design: ${designPreference}
• Message: "${cakeMessage || 'To be decided'}"
• Date needed: ${deliveryDate || 'Flexible'}`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-caramel/20 text-caramel dark:text-sand text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Bespoke Cake Atelier
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-espresso dark:text-ivory">
          Custom Cake Studio
        </h1>
        <p className="text-sm text-espresso/70 dark:text-ivory/70 leading-relaxed">
          Specify your dream cake dimensions, handcrafted flavor profiles, piping aesthetic, and personal inscription. Hand-baked fresh in our Lagos kitchen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Visual Showcase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] bg-caramel/10 relative border-2 border-caramel/20">
            <img
              src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"
              alt="Bespoke Cake"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-ivory">
              <span className="text-xs uppercase tracking-widest font-semibold text-sand">
                Handcrafted Artistry
              </span>
              <h3 className="font-serif text-2xl font-bold mt-1">
                Lambeth Vintage & Modern Floral
              </h3>
              <p className="text-xs text-ivory/80 mt-1 font-light">
                Every cake is a unique masterpiece tailored to your celebration.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice for Custom Orders</p>
              <p className="mt-0.5 opacity-90">
                Please allow a minimum of 24–48 hours for bespoke cake preparation. Need it urgently? Reach out to Dee on WhatsApp directly to check today's rush availability.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customizer Form */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-espresso-800/80 p-6 sm:p-8 rounded-3xl border border-caramel/25 shadow-warm">
          <form onSubmit={handleOrderCustomCake} className="space-y-6">
            {/* 1. Cake Size */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-espresso/80 dark:text-ivory/80 block mb-2">
                1. Select Cake Size & Servings:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(sizePricing).map(([size, price]) => {
                  const isSelected = cakeSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCakeSize(size)}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-caramel/15 border-caramel text-caramel dark:text-sand font-semibold ring-1 ring-caramel'
                          : 'border-caramel/20 text-espresso/80 dark:text-ivory/80 hover:border-caramel'
                      }`}
                    >
                      <span>{size}</span>
                      <span className="font-serif text-sm font-bold mt-1">
                        {formatCurrency(price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Cake Flavour */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-espresso/80 dark:text-ivory/80 block mb-2">
                2. Gourmet Flavour Profile:
              </label>
              <select
                value={flavour}
                onChange={(e) => setFlavour(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/30 text-xs font-medium text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
              >
                <option value="Royal Red Velvet & Cream Cheese">Royal Red Velvet & Bourbon Cream Cheese</option>
                <option value="Moist Belgian Chocolate Fudge">Moist Triple Belgian Chocolate Fudge</option>
                <option value="Madagascan Bourbon Vanilla Bean">Madagascan Bourbon Vanilla Bean Cloud</option>
                <option value="Salted Caramel Biscuit Crunch">Salted Butter Caramel & Biscoff Crunch</option>
                <option value="Strawberry Summer Cream">Fresh Strawberry & White Chocolate Velvet</option>
                <option value="Marble Symphony (Chocolate & Vanilla)">Marble Symphony (Chocolate & Vanilla Swirl)</option>
              </select>
            </div>

            {/* 3. Design Preference */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-espresso/80 dark:text-ivory/80 block mb-2">
                3. Design Preference & Piping Style:
              </label>
              <select
                value={designPreference}
                onChange={(e) => setDesignPreference(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/30 text-xs font-medium text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
              >
                <option value="Vintage Lambeth Piping">Vintage Lambeth Ruffle Piping (Frills & Ribbons)</option>
                <option value="Minimalist Floral Elegance">Minimalist Botanical with Fresh Macarons</option>
                <option value="Belgian Chocolate Drip & Berries">Chocolate Ganache Drip & Fresh Berries</option>
                <option value="24K Edible Gold Leaf Luxury">24K Edible Gold Leaf Accents & Pearls</option>
                <option value="Bespoke Birthday / Anniversary Theme">Bespoke Theme (Describe below in instructions)</option>
              </select>
            </div>

            {/* 4. Cake Inscription Message */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-espresso/80 dark:text-ivory/80 block mb-1">
                4. Personal Cake Message / Edible Inscription:
              </label>
              <span className="text-[11px] text-espresso/60 dark:text-ivory/60 block mb-2">
                Piped in elegant calligraphy on the cake top or presentation board.
              </span>
              <input
                type="text"
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g. Happy 30th Birthday Dee! / Forever & Always"
                maxLength={60}
                className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/30 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
              />
            </div>

            {/* 5. Requested Delivery Date */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-espresso/80 dark:text-ivory/80 block mb-2">
                5. Preferred Delivery or Pickup Date:
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/30 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel font-medium"
              />
            </div>

            {/* 6. Special Instructions */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-espresso/80 dark:text-ivory/80 block mb-2">
                6. Additional Notes or Colour Preferences:
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Please use champagne pink and ivory frosting, no nuts, delivery to Lekki Phase 1."
                rows={3}
                className="w-full p-3.5 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/30 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
              />
            </div>

            {/* Price Summary & Action */}
            <div className="pt-6 border-t border-caramel/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-espresso/60 dark:text-ivory/60 block">Estimated Price</span>
                <span className="font-serif text-3xl font-bold text-espresso dark:text-ivory">
                  {formatCurrency(calculatedBasePrice)}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={whatsappInquiryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Inquire</span>
                </a>

                <button
                  type="submit"
                  className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-caramel text-ivory hover:bg-caramel-600'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Custom Cake to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
