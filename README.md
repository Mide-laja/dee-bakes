# DEE BAKES
## COMPLETE BRAND, WEBSITE & BUSINESS MANAGEMENT PLATFORM

> **Tagline:** *"Made with love. Crafted to delight."*  
> **Location:** Victoria Island & Lekki Phase 1, Lagos, Nigeria  
> **Brand Personality:** Elegant • Premium • Warm • Modern • Creative • Professional  

---

## 🌟 Executive Summary

**DEE BAKES** is a complete, production-ready digital ecosystem designed and engineered for a premier Nigerian food and artisan bakery brand. 

Rather than a simple frontend demonstration, this platform is an end-to-end ecommerce and business management engine. It enables customers across Lagos to experience cinematic food visuals, customize bespoke celebration cakes, order freshly rolled gourmet shawarmas, pastries, and party small chops, and settle payments directly via **Direct Nigerian Bank Transfer**.

Simultaneously, the business owner operates the entire enterprise from her smartphone via **DEE BAKES STUDIO**—a mobile-first administrative suite styled after WhatsApp Business with zero coding required.

---

## 🎨 Brand Identity & Design System

### 1. Typography
* **Headings / Serif:** `Cormorant Garamond` (Sophisticated, high-fashion editorial serif with delicate kerning).
* **Body / Sans:** `DM Sans` (Clean, geometric, highly legible on mobile displays).

### 2. Intentional Colour Palette
* **Primary Espresso (`#291B17`):** Rich, grounding dark chocolate and espresso base.
* **Warm Ivory (`#F6EFE5`):** Soft, inviting cream background representing freshly dusted pastry flour.
* **Caramel (`#A66D48`):** Luxurious warm amber-caramel accent for buttons, badges, and highlights.
* **Sand (`#D1B18B`):** Elegant golden sand for borders, tags, and subtle metallic contrasts.
* **Cocoa (`#6C4030`):** Earthy warm roasted cocoa tone for deep accents.

### 3. Dual Mode Architecture (Light & Dark)
* **Light Mode:** Warm Ivory surfaces, Deep Espresso typography, and Caramel buttons.
* **Dark Mode:** Deep Espresso (`#160D0B`) backgrounds, Warm Ivory typography, Sand borders, and subtle Caramel glows.
* Remembers user preference between visits via persistent local storage.

### 4. Brand Logo System
* **Primary Wordmark:** `DEE BAKES` with subtitle `Artisan Delights` and refined spacing.
* **Secondary DB Monogram:** Interlocking serif 'D' and artisan flourished 'B' seal with starlight markers.
* **Scalable SVG Assets:** Rendered crisply across light mode, dark mode, website favicon, and PWA homescreen icon.

---

## 📱 Customer-Facing Website (Phase 2 & 3)

1. **Cinematic Hero:**
   * Full-screen background video capturing a close-up food commercial of a freshly prepared shawarma sliced open, revealing juicy spiced chicken filling, fresh vegetables, and creamy spiced garlic sauce dripping naturally.
   * Autoplay, loop, muted playback with audio toggle, responsive cropping, and high-resolution poster fallback.
   * Brand headline: *"Good food. Beautiful moments."*
   * Supporting copy: *"Freshly made delights, crafted with love. Discover your next favourite treat."*
   * Replaceable video URL and poster through the admin dashboard.

2. **Database-Driven Product Catalogue:**
   * Dynamic categories: *Shawarma*, *Twisted Doughnuts*, *Cakes*, *Cupcakes*, *Pastries*, *Small Chops*, and *Special Treats*.
   * Instant search by keyword, category filter pills, and price sorting.
   * Product cards with high-res photography, preparation time, variation selection (e.g. Single vs. Double Sausage Jumbo), and quick Add-to-Bag.

3. **Custom Cake Atelier:**
   * Dedicated bespoke cake ordering system allowing clients to configure:
     * Cake dimensions / Servings (6-inch round, 8-inch, 10-inch, 2-tier celebration, 3-tier grand luxury).
     * Gourmet flavours (Royal Red Velvet, Moist Belgian Chocolate Fudge, Bourbon Vanilla Bean, Salted Caramel Biscoff).
     * Design preference (Vintage Lambeth Ruffle Piping, Minimalist Floral, 24K Edible Gold Leaf).
     * Personal edible cake inscription piped in calligraphy (e.g. *"Happy 30th Birthday Dee!"*).
     * Requested delivery date (with 24–48 hours notice alert) and custom design notes.

4. **Persistent Shopping Cart & Lagos Checkout:**
   * Sliding order bag drawer with live subtotal calculation, quantity adjustments, and minimum order threshold validation.
   * Zone-based delivery calculation (Lekki Phase 1, Victoria Island, Ajah/Sangotedo, Mainland, or Free Kitchen Self-Pickup).
   * All amounts strictly formatted in Nigerian Naira (`₦` / NGN).

---

## 💳 Direct Nigerian Bank Transfer System (Phase 5)

> **Important:** To eliminate third-party gateway transaction surcharges, DEE BAKES utilizes a direct manual Nigerian bank transfer model.

### Workflow:
1. **Order Creation:** Order is created in the database and assigned a unique reference code (e.g. `DB-2026-8821`).
2. **Bank Details Presentation:** Configured bank credentials retrieved dynamically from store settings:
   * **Bank Name:** Guaranty Trust Bank (GTBank)
   * **Account Name:** DEE BAKES CONFECTIONERY
   * **Account Number:** `0234567891` (with 1-click "Copy Account Number" button)
3. **Customer Transfer Remark:** Customer is instructed to paste their Order Reference into their bank transfer memo/remark.
4. **Proof of Payment:** Customer inputs their bank transfer reference/session ID and can attach a receipt screenshot.
5. **Separation of Statuses:**
   * **Order Status:** `new` ➔ `accepted` ➔ `preparing` ➔ `ready_for_pickup` ➔ `out_for_delivery` ➔ `completed` / `cancelled`.
   * **Payment Status:** `awaiting_payment` ➔ `payment_evidence_submitted` ➔ `payment_pending_verification` ➔ `payment_confirmed` ➔ `payment_rejected`.
   * Orders are never marked as paid automatically; only Dee can confirm receipt of funds.

---

## 💬 WhatsApp Business Integration (Phase 6)

* **Floating WhatsApp Action:** Fixed widget with quick shortcuts for general orders, bespoke cake consultations, and live tracking.
* **Automated Receipt Formatting:** When a customer clicks to chat with Dee regarding an order, a structured message is generated:
  ```text
  👋 Hello DEE BAKES! I just placed an order on your website.

  *ORDER REFERENCE:* #DB-2026-1049
  *Customer:* Folashade Adeleke
  *Phone:* +234 803 234 5678

  🛒 *ORDER SUMMARY:*
  • 1x Signature Gourmet Chicken Shawarma (Size: Double Sausage Jumbo) - ₦5,500
  • 1x Cinnamon Brown Sugar Twisted Doughnuts (Box of 6) - ₦6,500

  💰 *Subtotal:* ₦12,000
  🚚 *Delivery Fee:* ₦2,000
  *TOTAL AMOUNT:* *₦14,000*

  💳 *Payment Method:* Direct Bank Transfer
  📌 *Payment Status:* ⏳ Awaiting Transfer

  🚚 *Delivery Address:* Oceanview Towers, Lekki Phase 1
  📍 *Zone:* Lekki Phase 1, Ikoyi & Oniru
  📝 *Notes:* Mildly spiced shawarma please.
  ```

---

## 👩🏽‍🍳 DEE BAKES STUDIO — Administrative Dashboard (Phase 7)

Accessible at `/admin` (with staff login at `/admin/login`).

### Studio Capabilities:
1. **Smartphone-First UX:** WhatsApp Business style bottom navigation bar on mobile devices and full desktop sidebar.
2. **Live Store Open / Pause Toggle:** 1-click switch to pause incoming orders when kitchen capacity is reached, with a customizable customer alert banner.
3. **Database Overview:** Real metrics for Today's Confirmed Revenue, Today's Orders, Kitchen Pipeline, and Bestselling Items.
4. **Bank Transfer Verification Desk:** Dedicated queue to inspect customer transfer references, view receipt screenshots, confirm receipt of funds, reject fraudulent claims with internal notes, and open a direct WhatsApp chat with the customer.
5. **Product & Inventory Management:** Add new items, update prices, change descriptions, upload photography, mark items as Sold Out, and toggle Bestseller status.
6. **Customer Directory:** View customer order frequency, total spending, addresses, and instant WhatsApp chat shortcut.
7. **Business & Payment Settings:** Update bank account details, adjust delivery zone fees, change minimum order amount, and toggle Cash on Delivery.
8. **Storefront Live Editor:** Change hero video URL, poster image, homepage headline, and Instagram handle without touching source code.

### Default Studio Access Credentials:
* **Email:** `dee@deebakes.ng` (or `admin@deebakes.ng`)
* **Password:** `deebakes2026`
* *(A 1-click "Use Owner Credentials" button is provided on the login screen for testing convenience)*

---

## 🗄️ Database Architecture & Supabase Schema (Phase 8)

The application includes a complete PostgreSQL schema in [`supabase/schema.sql`](file:///c:/Users/Mide/Downloads/DEE%20BAKES/supabase/schema.sql) covering all 13 required tables:

1. `admin_users`
2. `categories`
3. `products`
4. `product_images`
5. `product_variations`
6. `orders`
7. `order_items`
8. `customers`
9. `payment_records`
10. `store_settings`
11. `delivery_zones`
12. `promotions`
13. `testimonials`

Includes Row Level Security (RLS) policies, indexes on references and phone numbers, and default seed data.

### Hybrid Resilience Layer:
The application incorporates a Data Access Layer:
* If Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are provided, it connects to Supabase PostgreSQL and Storage.
* If Supabase credentials are not yet configured (e.g. during local evaluation or preview), it falls back to a reactive browser data repository seeded with authentic Nigerian menu items and live orders. All product additions, bank setting updates, order creations, and verification actions persist across browser sessions.

---

## 🚀 Installation & Local Development

### Prerequisites:
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher

### Steps:

1. **Clone or navigate to the project directory:**
   ```bash
   cd "c:\Users\Mide\Downloads\DEE BAKES"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for Supabase):**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.
5. Under **Environment Variables**, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**. Vercel will build and deploy the production bundle in under 60 seconds.

---

## 📱 Progressive Web App (PWA) Mobile Installation

* **For Dee (Business Owner):** Open `/admin` on your smartphone browser (Safari on iPhone, Chrome on Android), tap **Share / Menu** ➔ **Add to Home Screen**. DEE BAKES STUDIO installs as a standalone app with the DB Monogram icon and full-screen experience.
* **For Customers:** Open the website on mobile and tap **Add to Home Screen** to keep DEE BAKES accessible right alongside food delivery apps.

---

## 📄 License
© 2026 DEE BAKES. All rights reserved. Handcrafted with love in Lagos, Nigeria.
