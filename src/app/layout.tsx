import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { CloudSyncInitializer } from '@/components/common/CloudSyncInitializer';

export const metadata: Metadata = {
  title: 'DEE BAKES | Premium Artisan Bakery & Gourmet Treats Lagos',
  description:
    'Experience freshly rolled gourmet shawarmas, hand-twisted brioche doughnuts, bespoke celebration cakes, and delicious Lagos pastries crafted with love.',
  keywords: [
    'Dee Bakes',
    'Lagos bakery',
    'gourmet shawarma Lagos',
    'twisted doughnuts Nigeria',
    'custom cakes Lekki',
    'artisan cupcakes Lagos',
    'Nigerian small chops platter',
    'direct bank transfer bakery',
  ],
  authors: [{ name: 'DEE BAKES' }],
  creator: 'DEE BAKES',
  publisher: 'DEE BAKES',
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://deebakes.ng',
    title: 'DEE BAKES — Good food. Beautiful moments.',
    description:
      'Lagos’s premier artisan kitchen delivering freshly rolled shawarmas, hand-twisted brioche doughnuts, bespoke celebration cakes and golden pastries.',
    siteName: 'DEE BAKES',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'DEE BAKES Artisan Food & Bakery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEE BAKES | Artisan Bakery & Gourmet Treats',
    description: 'Freshly made delights, crafted with love. Discover your next favourite treat.',
    images: ['https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
};

export const viewport: Viewport = {
  themeColor: '#291B17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-ivory dark:bg-espresso-950 text-espresso dark:text-ivory selection:bg-caramel selection:text-white">
        <ThemeProvider>
          <CartProvider>
            <CloudSyncInitializer />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
