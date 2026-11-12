'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Award, ShieldCheck, ArrowRight, Instagram, Phone } from 'lucide-react';
import { DBStore } from '@/lib/store';
import { Logo } from '@/components/brand/Logo';

export default function AboutPage() {
  const settings = DBStore.getSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
          Our Heritage & Passion
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-espresso dark:text-ivory leading-tight">
          "Made with love. Crafted to delight."
        </h1>
        <p className="text-sm sm:text-base text-espresso/70 dark:text-ivory/70 leading-relaxed font-light">
          DEE BAKES is an artisan culinary brand rooted in Lagos, Nigeria, dedicated to elevating everyday comfort food and milestone celebrations into unforgettable gourmet experiences.
        </p>
      </div>

      {/* Narrative & Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-caramel/10 relative border-2 border-caramel/20">
          <img
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80"
            alt="Dee Bakes Kitchen"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-5 text-sm text-espresso/80 dark:text-ivory/80 leading-relaxed">
          <h2 className="font-serif text-3xl font-bold text-espresso dark:text-ivory">
            The Artisan Kitchen Story
          </h2>
          <p>
            What began as an uncompromising search for the perfect shawarma in Lagos blossomed into a full-scale culinary atelier. We realized that bakery products were often treated either as industrial commodities or out-of-reach luxuries.
          </p>
          <p>
            At Dee Bakes, we bridged that divide. We roll every shawarma flatbread fresh, slow-roast marinated chicken breast with hand-blended Lebanese and Nigerian spices, twist our brioche doughnut dough by hand every dawn, and pipe vintage lambeth cake frills with obsessive precision.
          </p>
          <p>
            When you take a bite of any Dee Bakes creation, you taste pure butter, genuine bourbon vanilla, succulent grilled poultry, and the unmistakable warmth of culinary mastery.
          </p>

          <div className="pt-4 flex items-center gap-4">
            <Link
              href="/menu"
              className="px-6 py-3 rounded-full bg-caramel text-ivory text-xs font-semibold uppercase tracking-wider hover:bg-caramel-600 transition-colors shadow-sm"
            >
              Explore Our Menu
            </Link>
            <Link
              href="/custom-cakes"
              className="px-6 py-3 rounded-full border border-caramel text-caramel dark:text-sand text-xs font-semibold uppercase tracking-wider hover:bg-caramel hover:text-white transition-colors"
            >
              Custom Cakes
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-caramel/20">
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/20 shadow-warm">
          <Sparkles className="w-8 h-8 text-caramel mb-4" />
          <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
            Artisanal Integrity
          </h3>
          <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
            No synthetic shortcuts or pre-mix powders. Every sponge, cream, glaze, and marinade is made from scratch.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/20 shadow-warm">
          <Heart className="w-8 h-8 text-caramel mb-4" />
          <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
            Nigerian Hospitality
          </h3>
          <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
            We treat every order like catering for our own family. Generous portions, rich seasoning, and genuine care.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/70 dark:bg-espresso-800/70 border border-caramel/20 shadow-warm">
          <Award className="w-8 h-8 text-caramel mb-4" />
          <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
            Verified Direct Banking
          </h3>
          <p className="text-xs text-espresso/70 dark:text-ivory/70 mt-2 leading-relaxed">
            Direct transfers straight into our Nigerian bank account with rapid, personal verification by Dee.
          </p>
        </div>
      </div>
    </div>
  );
}
