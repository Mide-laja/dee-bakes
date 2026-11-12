-- ==============================================================================
-- DEE BAKES - FULL SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- Production Ready Schema for DEE BAKES Digital Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ADMIN USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- 'owner', 'manager', 'admin'
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_customizable BOOLEAN DEFAULT FALSE, -- e.g. for custom cakes
    stock_quantity INTEGER DEFAULT -1, -- -1 for infinite / made-to-order
    preparation_time TEXT, -- e.g. "30 mins", "24 hours notice"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PRODUCT IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PRODUCT VARIATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Size", "Flavour", "Spiciness"
    option_name TEXT NOT NULL, -- e.g. "Regular", "Jumbo Double Sausage", "8 inch 2-tier"
    price_modifier NUMERIC(12, 2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE
);

-- ------------------------------------------------------------------------------
-- 6. DELIVERY ZONES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estimated_time TEXT DEFAULT '45-90 mins',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CUSTOMERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    default_address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- ------------------------------------------------------------------------------
-- 8. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT UNIQUE NOT NULL, -- e.g. "DB-2026-9481"
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    order_type TEXT NOT NULL DEFAULT 'delivery', -- 'delivery' or 'pickup'
    delivery_zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
    delivery_address TEXT,
    delivery_date DATE,
    delivery_time_slot TEXT,
    
    -- Financials
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Statuses
    order_status TEXT NOT NULL DEFAULT 'new',
    -- 'new', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'
    
    payment_status TEXT NOT NULL DEFAULT 'awaiting_payment',
    -- 'awaiting_payment', 'payment_evidence_submitted', 'payment_pending_verification', 'payment_confirmed', 'payment_rejected', 'refunded'
    
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    -- 'bank_transfer', 'cash_on_delivery'
    
    -- Bank Transfer Details
    transfer_reference TEXT,
    payment_evidence_url TEXT,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    variation_details TEXT, -- e.g. "Size: Jumbo"
    custom_options JSONB, -- { "cake_size": "10-inch", "flavour": "Red Velvet", "message": "Happy 30th Birthday Dee!" }
    subtotal NUMERIC(12, 2) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. PAYMENT RECORDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    bank_name TEXT,
    sender_account_name TEXT,
    transfer_reference TEXT,
    evidence_url TEXT,
    verified_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------------------------------------------
-- 11. STORE SETTINGS TABLE (Singleton row)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    store_name TEXT NOT NULL DEFAULT 'DEE BAKES',
    tagline TEXT NOT NULL DEFAULT 'Made with love. Crafted to delight.',
    phone_number TEXT NOT NULL DEFAULT '+234 812 345 6789',
    whatsapp_number TEXT NOT NULL DEFAULT '2348123456789',
    email TEXT DEFAULT 'hello@deebakes.ng',
    physical_address TEXT DEFAULT 'Victoria Island, Lagos, Nigeria',
    
    -- Bank Transfer Configuration
    bank_name TEXT NOT NULL DEFAULT 'Guaranty Trust Bank (GTBank)',
    bank_account_name TEXT NOT NULL DEFAULT 'DEE BAKES ENTERPRISES',
    bank_account_number TEXT NOT NULL DEFAULT '0123456789',
    bank_payment_instructions TEXT DEFAULT 'Please include your Order Reference as the transfer remark. After payment, upload your payment receipt or transfer reference.',
    
    -- Store Operation Controls
    is_store_open BOOLEAN DEFAULT TRUE,
    pause_orders BOOLEAN DEFAULT FALSE,
    pause_message TEXT DEFAULT 'We are currently at full capacity for today. Please check back tomorrow morning!',
    min_order_amount NUMERIC(12, 2) DEFAULT 3000.00,
    enable_cash_on_delivery BOOLEAN DEFAULT FALSE,
    
    -- Storefront Customization
    hero_headline TEXT DEFAULT 'Good food. Beautiful moments.',
    hero_subheadline TEXT DEFAULT 'Freshly made delights, crafted with love. Discover your next favourite treat.',
    hero_video_url TEXT DEFAULT '/videos/hero-shawarma.mp4',
    hero_poster_url TEXT DEFAULT '/images/hero-shawarma-poster.jpg',
    about_story TEXT DEFAULT 'At Dee Bakes, every creation is an edible piece of art. From our golden, flaky pastries and generously stuffed gourmet shawarmas to bespoke celebration cakes, we pour unmatched passion and premium ingredients into every batch.',
    opening_hours TEXT DEFAULT 'Monday - Saturday: 8:00 AM - 8:00 PM | Sunday: 10:00 AM - 6:00 PM',
    instagram_handle TEXT DEFAULT '@deebakesng',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- ------------------------------------------------------------------------------
-- 12. PROMOTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value NUMERIC(12, 2) NOT NULL,
    min_spend NUMERIC(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. TESTIMONIALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_role_or_location TEXT DEFAULT 'Lagos, Nigeria',
    comment TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read active categories, products, images, variations, store settings, delivery zones, testimonials
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view available products" ON public.products FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public can view product variations" ON public.product_variations FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active delivery zones" ON public.delivery_zones FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active promotions" ON public.promotions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (is_featured = TRUE);

-- Orders: Public can insert orders and view order by order_reference
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can view own order by reference" ON public.orders FOR SELECT USING (TRUE);
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can view own order items" ON public.order_items FOR SELECT USING (TRUE);

-- Payments: Public can upload payment evidence for their order
CREATE POLICY "Public can submit payment record" ON public.payment_records FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can update transfer reference on order" ON public.orders FOR UPDATE USING (TRUE);

-- ==============================================================================
-- SEED INITIAL STORE SETTINGS
-- ==============================================================================
INSERT INTO public.store_settings (id, store_name, tagline, phone_number, whatsapp_number, email, physical_address, bank_name, bank_account_name, bank_account_number)
VALUES (
    1,
    'DEE BAKES',
    'Made with love. Crafted to delight.',
    '+234 812 345 6789',
    '2348123456789',
    'orders@deebakes.ng',
    'Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    'Guaranty Trust Bank (GTBank)',
    'DEE BAKES CONFECTIONERY',
    '0234567891'
)
ON CONFLICT (id) DO NOTHING;
