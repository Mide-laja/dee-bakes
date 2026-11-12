'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  Sun,
  Moon,
  Phone,
  MessageCircle,
  Search,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { DBStore, storeEvents } from '@/lib/store';
import { createWhatsAppLink } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(DBStore.getSettings());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = storeEvents.subscribe('settings', () => {
      setSettings(DBStore.getSettings());
    });
    return unsubscribe;
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Menu', href: '/menu' },
    { name: 'Custom Cakes', href: '/custom-cakes' },
    { name: 'Track Order', href: '/track' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const whatsappHref = createWhatsAppLink(
    settings.whatsapp_number,
    `Hello ${settings.store_name}! I am browsing your website and would love to make an inquiry.`
  );

  return (
    <>
      {/* Top Announcement Bar if store has special notes */}
      {settings.pause_orders && (
        <div className="bg-amber-800 text-ivory px-4 py-2 text-xs md:text-sm text-center font-medium flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>Notice: {settings.pause_message}</span>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-header shadow-warm border-b border-caramel/20 py-3'
            : 'bg-ivory/95 dark:bg-espresso-900/95 py-4 border-b border-caramel/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <Logo variant="full" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-caramel font-semibold'
                      : 'text-espresso/80 dark:text-ivory/80 hover:text-caramel dark:hover:text-sand'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-caramel rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* WhatsApp Direct Action */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all duration-200 border border-emerald-600/30"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme Mode"
              className="p-2 rounded-full text-espresso/70 dark:text-ivory/80 hover:bg-caramel/10 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-300" />
              ) : (
                <Moon className="w-5 h-5 text-espresso-700" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              aria-label="View Shopping Cart"
              className="relative p-2.5 rounded-full bg-caramel text-ivory hover:bg-caramel-600 transition-all duration-200 shadow-sm hover:shadow-warm flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-espresso text-ivory dark:bg-ivory dark:text-espresso font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-ivory dark:border-espresso animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-lg text-espresso/80 dark:text-ivory/80 hover:bg-caramel/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] z-30 bg-espresso-950/60 backdrop-blur-sm transition-opacity">
          <div className="bg-ivory dark:bg-espresso-900 w-full max-h-[85vh] overflow-y-auto border-b border-caramel/20 p-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-caramel/15 text-caramel font-semibold'
                        : 'text-espresso/90 dark:text-ivory/90 hover:bg-caramel/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="pt-4 mt-2 border-t border-caramel/20 flex flex-col gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-emerald-600 text-white shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat With Us on WhatsApp</span>
                </a>

                <Link
                  href="/admin/login"
                  className="text-center text-xs text-espresso/60 dark:text-ivory/60 hover:text-caramel py-2 flex items-center justify-center gap-1.5"
                >
                  <span>DEE BAKES Studio Staff Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
