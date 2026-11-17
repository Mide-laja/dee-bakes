'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import {
  Instagram,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useStoreSettings } from '@/lib/store';

export const Footer: React.FC = () => {
  const settings = useStoreSettings();

  return (
    <footer className="bg-espresso-900 text-ivory border-t border-caramel/20 pt-16 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-ivory/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Logo variant="full" theme="dark" size="lg" />
            <p className="text-sm text-ivory/70 leading-relaxed font-sans pr-4">
              "{settings.tagline}"
            </p>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Lagos’s premier artisan kitchen delivering freshly rolled shawarmas, hand-twisted brioche doughnuts, bespoke cakes and golden party pastries.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://instagram.com/${settings.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-caramel/20 flex items-center justify-center text-ivory hover:bg-caramel hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold tracking-wider text-sand uppercase">
              Explore Menu
            </h4>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li>
                <Link href="/menu?category=shawarma" className="hover:text-sand transition-colors">
                  Gourmet Shawarma
                </Link>
              </li>
              <li>
                <Link href="/menu?category=twisted-doughnuts" className="hover:text-sand transition-colors">
                  Twisted Brioche Doughnuts
                </Link>
              </li>
              <li>
                <Link href="/custom-cakes" className="hover:text-sand transition-colors">
                  Custom Celebration Cakes
                </Link>
              </li>
              <li>
                <Link href="/menu?category=cupcakes" className="hover:text-sand transition-colors">
                  Artisan Cupcakes Platter
                </Link>
              </li>
              <li>
                <Link href="/menu?category=pastries" className="hover:text-sand transition-colors">
                  Golden Beef Pies & Pastries
                </Link>
              </li>
              <li>
                <Link href="/menu?category=small-chops" className="hover:text-sand transition-colors">
                  Lagos Party Small Chops
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Delivery */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold tracking-wider text-sand uppercase">
              Kitchen Hours & Delivery
            </h4>
            <div className="space-y-3 text-xs text-ivory/80">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ivory">Operating Hours</p>
                  <p className="text-ivory/60 mt-0.5">{settings.opening_hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ivory">Direct Bank Transfer</p>
                  <p className="text-ivory/60 mt-0.5">
                    Safe direct transfers to our Nigerian bank account with rapid admin verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold tracking-wider text-sand uppercase">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-xs text-ivory/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-caramel shrink-0 mt-0.5" />
                <span>{settings.physical_address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-caramel shrink-0" />
                <a href={`tel:${settings.phone_number}`} className="hover:text-sand">
                  {settings.phone_number}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-caramel shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-sand">
                  {settings.email}
                </a>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/track"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-caramel/20 text-sand text-xs hover:bg-caramel hover:text-white transition-all font-medium border border-caramel/30"
              >
                Track Your Order Status
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/50 gap-4">
          <p>© {new Date().getFullYear()} DEE BAKES. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-sand">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-sand">
              Terms of Service
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-ivory/40 hover:text-sand transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Studio Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
