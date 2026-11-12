'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs sm:text-sm text-espresso/80 dark:text-ivory/80 leading-relaxed">
      <div className="border-b border-caramel/20 pb-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory">
          Privacy Policy
        </h1>
        <p className="text-xs text-espresso/60 dark:text-ivory/60 mt-1">
          Effective Date: {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
          1. Information We Collect
        </h2>
        <p>
          At DEE BAKES, we respect your personal privacy. When placing an order, we collect only the necessary details required to bake and deliver your food: your full name, telephone number (for delivery dispatch and WhatsApp confirmation), delivery address, and bank transfer reference.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
          2. Direct Bank Transfers and Financial Privacy
        </h2>
        <p>
          We do not collect or store debit/credit card CVV or ATM PIN numbers on our servers. All direct bank transfers are conducted securely between your banking application and our verified Nigerian commercial bank account. Payment evidence uploaded by customers is used strictly by Dee and authorized kitchen managers to verify funds arrival.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-espresso dark:text-ivory">
          3. Contact Us
        </h2>
        <p>
          If you have any questions about this privacy statement, please contact us at orders@deebakes.ng or via WhatsApp at +234 812 345 6789.
        </p>
      </div>
    </div>
  );
}
