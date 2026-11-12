'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Heart,
  ShieldCheck,
  Truck,
  Flame,
  Award,
  Instagram,
  Star,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductModal } from '@/components/products/ProductModal';
import { DBStore, storeEvents } from '@/lib/store';
import { Product } from '@/types';

export default function HomePage() {
  const [settings, setSettings] = useState(DBStore.getSettings());
  const [products, setProducts] = useState(DBStore.getProducts());
  const [categories, setCategories] = useState(DBStore.getCategories());
  const [testimonials, setTestimonials] = useState(DBStore.getTestimonials());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const unsubSettings = storeEvents.subscribe('settings', () => setSettings(DBStore.getSettings()));
    const unsubProducts = storeEvents.subscribe('products', () => setProducts(DBStore.getProducts()));
    const unsubCategories = storeEvents.subscribe('categories', () => setCategories(DBStore.getCategories()));
    return () => {
      unsubSettings();
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);
  const bestsellers = products.filter((p) => p.is_bestseller).slice(0, 4);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. CINEMATIC HERO */}
      <HeroSection settings={settings} />

      {/* 2. PRODUCT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
            Artisan Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-2">
            Curated For Connoisseurs
          </h2>
          <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70 mt-2">
            Every category represents our commitment to fresh, gourmet bakery craft and savory excellence.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.filter((c) => c.is_active).map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-warm hover:shadow-warm-lg transition-all duration-300 block"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-ivory">
                <h3 className="font-serif text-xl sm:text-2xl font-bold group-hover:text-sand transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-ivory/80 line-clamp-1 mt-1 font-light">
                  {cat.description}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-sand font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CHEF SPECIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
              Handpicked Delights
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-1">
              Chef’s Featured Creations
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-caramel hover:text-caramel-600 dark:hover:text-sand transition-colors group"
          >
            <span>View Complete Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. BRAND STORY & INTRODUCTION */}
      <section className="bg-ivory-200/50 dark:bg-espresso-900/40 py-20 border-y border-caramel/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Visual Mosaic */}
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border-4 border-white dark:border-espresso-800">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80"
                  alt="DEE BAKES Artisan Craft"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-1/2 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-espresso-800 hidden sm:block">
                <img
                  src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80"
                  alt="Twisted brioche doughnuts"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge Overlay */}
              <div className="absolute top-6 -left-4 sm:-left-6 bg-caramel text-ivory p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <Award className="w-8 h-8 text-sand shrink-0" />
                <div>
                  <p className="font-serif text-lg font-bold leading-none">Artisan Quality</p>
                  <p className="text-[10px] tracking-widest uppercase text-ivory/80 mt-0.5">
                    Made Daily in Lagos
                  </p>
                </div>
              </div>
            </div>

            {/* Narrative */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
                The Dee Bakes Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso dark:text-ivory leading-tight">
                "Made with love. Crafted to delight."
              </h2>
              <p className="text-sm sm:text-base text-espresso/80 dark:text-ivory/80 leading-relaxed font-light">
                {settings.about_story}
              </p>
              <p className="text-sm text-espresso/70 dark:text-ivory/70 leading-relaxed">
                Whether you’re ordering our signature jumbo chicken shawarma dripping with spiced cream sauce for lunch, celebrating a milestone with a custom tiered red velvet cake, or treating loved ones to our cloud-like twisted doughnuts, we promise every bite is unforgettable.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="px-6 py-3 rounded-full bg-espresso dark:bg-ivory text-ivory dark:text-espresso font-semibold text-xs tracking-wider uppercase hover:bg-caramel dark:hover:bg-sand transition-colors"
                >
                  Our Full Story
                </Link>
                <Link
                  href="/custom-cakes"
                  className="px-6 py-3 rounded-full border border-caramel text-caramel dark:text-sand font-semibold text-xs tracking-wider uppercase hover:bg-caramel hover:text-white transition-colors"
                >
                  Custom Cake Studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE DEE BAKES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
            The Gold Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-2">
            Why Dee Bakes Stands Apart
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/15 shadow-warm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-caramel/15 text-caramel flex items-center justify-center mb-5">
              <Flame className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
              Fresh Daily Bakes
            </h3>
            <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
              Nothing is frozen or mass-manufactured. Our dough is kneaded and fillings prepared fresh every single morning.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/15 shadow-warm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-caramel/15 text-caramel flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
              Premium Ingredients
            </h3>
            <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
              Real French butter, Madagascar bourbon vanilla, Belgian cocoa, and prime cuts of farm-raised Nigerian poultry.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/15 shadow-warm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-caramel/15 text-caramel flex items-center justify-center mb-5">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
              Island & Mainland Delivery
            </h3>
            <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
              Dedicated couriers equipped with insulated packaging so your shawarmas arrive steaming and cakes in pristine condition.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/15 shadow-warm flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-caramel/15 text-caramel flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
              Direct Bank Transfers
            </h3>
            <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
              Zero payment gateway fees. Pay directly to our verified GTBank account with rapid WhatsApp confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
              Loved Across Lagos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-1">
              Our All-Time Bestsellers
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-caramel hover:text-caramel-600 dark:hover:text-sand transition-colors group"
          >
            <span>Explore All Treats</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 7. CUSTOM CAKE PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-espresso-900 text-ivory p-8 sm:p-14 shadow-2xl border border-caramel/30">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel/30 text-sand text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Bespoke Cake Studio
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-ivory leading-tight">
              Designing Memories, One Layer at a Time
            </h2>
            <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed font-light">
              Planning a wedding, birthday, or corporate celebration in Lagos? Choose your tier architecture, gourmet flavours, luxury vintage lambeth piping, and personalized inscription.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/custom-cakes"
                className="px-8 py-3.5 rounded-full bg-caramel text-ivory font-semibold text-sm hover:bg-caramel-600 transition-all shadow-md active:scale-95"
              >
                Launch Cake Customizer
              </Link>
              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                  'Hello Dee! I would like to consult with you on creating a bespoke cake for an upcoming event.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-ivory font-semibold text-sm transition-all border border-white/20"
              >
                Consult on WhatsApp
              </a>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-30 pointer-events-none overflow-hidden hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"
              alt="Custom cake"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER TESTIMONIALS */}
      <section className="bg-ivory-200/40 dark:bg-espresso-900/40 py-20 border-y border-caramel/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
              Customer Love
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-2">
              Words From Our Patrons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/15 shadow-warm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-espresso/80 dark:text-ivory/80 leading-relaxed italic">
                    "{test.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-caramel/15">
                  {test.avatar_url && (
                    <img
                      src={test.avatar_url}
                      alt={test.customer_name}
                      className="w-10 h-10 rounded-full object-cover border border-caramel/30"
                    />
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-sm text-espresso dark:text-ivory">
                      {test.customer_name}
                    </h4>
                    <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                      {test.customer_role_or_location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. INSTAGRAM GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
              Visual Feasts
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory mt-1">
              Follow Us {settings.instagram_handle}
            </h2>
          </div>
          <a
            href={`https://instagram.com/${settings.instagram_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-caramel hover:text-caramel-600 dark:hover:text-sand transition-colors"
          >
            <Instagram className="w-4 h-4" />
            <span>Visit Instagram</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              src: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
              alt: 'Gourmet Chicken Shawarma',
            },
            {
              src: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80',
              alt: 'Twisted Brioche Doughnuts',
            },
            {
              src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
              alt: 'Luxury Celebration Cake',
            },
            {
              src: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
              alt: 'Lagos Party Small Chops',
            },
          ].map((item, i) => (
            <a
              key={i}
              href={`https://instagram.com/${settings.instagram_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm block bg-caramel/10"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-espresso-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="w-8 h-8 text-ivory" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 10. NEWSLETTER & VIP CLUB */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/25 shadow-warm text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
            Exclusive Treats
          </span>
          <h2 className="font-serif text-3xl font-bold text-espresso dark:text-ivory">
            Join The Dee Bakes Tasting Club
          </h2>
          <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70 max-w-lg mx-auto leading-relaxed">
            Be the first to hear about secret seasonal pastry drops, holiday cake booking slots, and get 10% off your next weekend order.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Thank you for subscribing! Check your inbox for your 10% discount welcome note.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-full bg-ivory dark:bg-espresso-900 border border-caramel/30 focus:outline-none focus:border-caramel text-xs text-espresso dark:text-ivory"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-caramel text-ivory font-semibold text-xs tracking-wider uppercase hover:bg-caramel-600 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
