'use client';

import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, Cake, ShoppingBag, HelpCircle } from 'lucide-react';
import { DBStore } from '@/lib/store';
import { createWhatsAppLink } from '@/lib/utils';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const settings = DBStore.getSettings();

  const handleQuickChat = (message: string) => {
    const link = createWhatsAppLink(settings.whatsapp_number, message);
    window.open(link, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-4 w-72 sm:w-80 bg-white dark:bg-espresso-800 rounded-2xl shadow-2xl border border-caramel/20 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-serif text-lg font-bold">
                DB
              </div>
              <div>
                <h4 className="font-semibold text-sm">Dee Bakes Support</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  Typically replies in minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-2 text-xs">
            <button
              onClick={() =>
                handleQuickChat(
                  'Hello Dee! I would love to place an order or ask a question about your menu.'
                )
              }
              className="w-full p-2.5 rounded-xl bg-ivory dark:bg-espresso-700/60 hover:bg-caramel/10 text-espresso dark:text-ivory flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-caramel" />
                <span>General Order Enquiry</span>
              </div>
              <ChevronRight className="w-4 h-4 text-espresso/40 dark:text-ivory/40" />
            </button>

            <button
              onClick={() =>
                handleQuickChat(
                  'Hello Dee! I would like to consult with you about designing a custom celebration cake.'
                )
              }
              className="w-full p-2.5 rounded-xl bg-ivory dark:bg-espresso-700/60 hover:bg-caramel/10 text-espresso dark:text-ivory flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Cake className="w-4 h-4 text-caramel" />
                <span>Bespoke Cake Consultation</span>
              </div>
              <ChevronRight className="w-4 h-4 text-espresso/40 dark:text-ivory/40" />
            </button>

            <button
              onClick={() =>
                handleQuickChat(
                  'Hello! I would like to check the delivery status of my pending order.'
                )
              }
              className="w-full p-2.5 rounded-xl bg-ivory dark:bg-espresso-700/60 hover:bg-caramel/10 text-espresso dark:text-ivory flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-caramel" />
                <span>Order Tracking Help</span>
              </div>
              <ChevronRight className="w-4 h-4 text-espresso/40 dark:text-ivory/40" />
            </button>
          </div>

          <div className="bg-ivory/60 dark:bg-espresso-900/50 p-2.5 text-center text-[10px] text-espresso/60 dark:text-ivory/60 border-t border-caramel/10">
            Direct WhatsApp chat with Dee Bakes Kitchen
          </div>
        </div>
      )}

      {/* Floating Action Circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Dee Bakes on WhatsApp"
        className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25 group-hover:opacity-40" />
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};

export default WhatsAppButton;
