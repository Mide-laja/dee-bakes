'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs sm:text-sm text-espresso/80 dark:text-ivory/80 leading-relaxed">
      <div className="border-b border-caramel/20 pb-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory">
          Terms of Service & Order Guidelines
        </h1>
        <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1">
          Last Updated: {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
          1. Order Placement & Direct Bank Transfer Verification
        </h2>
        <p>
          By placing an order on DEE BAKES, you acknowledge that orders are confirmed for kitchen preparation once direct bank transfer funds have been verified in our account by Dee. Please ensure your Order Reference is included as your transfer remark or memo.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
          2. Custom Cakes & Notice Periods
        </h2>
        <p>
          Bespoke and tiered celebration cakes require a minimum notice period of 24 to 48 hours to ensure proper design, baking, and temperature settling. Urgent rush orders must be confirmed directly with Dee on WhatsApp prior to ordering.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
          3. Deliveries & Pickup
        </h2>
        <p>
          We deliver to major zones across Lagos (Lekki Phase 1, Ikoyi, Victoria Island, Ajah, and Mainland). Self-pickup is also available free of charge at our kitchen located in Lekki Phase 1.
        </p>
      </div>
    </div>
  );
}
