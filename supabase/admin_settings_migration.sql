-- ==============================================================================
-- DEE BAKES - ADMIN SETTINGS & STOREFRONT PERSISTENCE MIGRATION
-- Run this migration in your Supabase SQL Editor to permanently fix settings persistence.
-- ==============================================================================

-- 1. Ensure all columns exist on public.store_settings
DO $$
BEGIN
    -- Business Information Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'store_name') THEN
        ALTER TABLE public.store_settings ADD COLUMN store_name TEXT NOT NULL DEFAULT 'DEE BAKES';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'tagline') THEN
        ALTER TABLE public.store_settings ADD COLUMN tagline TEXT NOT NULL DEFAULT 'Made with love. Crafted to delight.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'phone_number') THEN
        ALTER TABLE public.store_settings ADD COLUMN phone_number TEXT NOT NULL DEFAULT '+234 812 345 6789';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'whatsapp_number') THEN
        ALTER TABLE public.store_settings ADD COLUMN whatsapp_number TEXT NOT NULL DEFAULT '2348123456789';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'email') THEN
        ALTER TABLE public.store_settings ADD COLUMN email TEXT DEFAULT 'orders@deebakes.ng';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'physical_address') THEN
        ALTER TABLE public.store_settings ADD COLUMN physical_address TEXT DEFAULT 'Victoria Island, Lagos, Nigeria';
    END IF;

    -- Bank Transfer Configuration Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'bank_name') THEN
        ALTER TABLE public.store_settings ADD COLUMN bank_name TEXT NOT NULL DEFAULT 'Guaranty Trust Bank (GTBank)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'bank_account_name') THEN
        ALTER TABLE public.store_settings ADD COLUMN bank_account_name TEXT NOT NULL DEFAULT 'DEE BAKES CONFECTIONERY';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'bank_account_number') THEN
        ALTER TABLE public.store_settings ADD COLUMN bank_account_number TEXT NOT NULL DEFAULT '0234567891';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'bank_payment_instructions') THEN
        ALTER TABLE public.store_settings ADD COLUMN bank_payment_instructions TEXT DEFAULT 'Please include your Order Reference as the transfer remark. After payment, upload your payment receipt or transfer reference.';
    END IF;

    -- Operations & Storefront Controls
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'is_store_open') THEN
        ALTER TABLE public.store_settings ADD COLUMN is_store_open BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'pause_orders') THEN
        ALTER TABLE public.store_settings ADD COLUMN pause_orders BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'pause_message') THEN
        ALTER TABLE public.store_settings ADD COLUMN pause_message TEXT DEFAULT 'We are currently at full capacity for today. Please check back tomorrow morning!';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'min_order_amount') THEN
        ALTER TABLE public.store_settings ADD COLUMN min_order_amount NUMERIC(12, 2) DEFAULT 3000.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'enable_cash_on_delivery') THEN
        ALTER TABLE public.store_settings ADD COLUMN enable_cash_on_delivery BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'hero_headline') THEN
        ALTER TABLE public.store_settings ADD COLUMN hero_headline TEXT DEFAULT 'Good food. Beautiful moments.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'hero_subheadline') THEN
        ALTER TABLE public.store_settings ADD COLUMN hero_subheadline TEXT DEFAULT 'Freshly made delights, crafted with love. Discover your next favourite treat.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'hero_video_url') THEN
        ALTER TABLE public.store_settings ADD COLUMN hero_video_url TEXT DEFAULT '/videos/hero-shawarma.mp4';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'hero_poster_url') THEN
        ALTER TABLE public.store_settings ADD COLUMN hero_poster_url TEXT DEFAULT '/images/hero-shawarma-poster.jpg';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'about_story') THEN
        ALTER TABLE public.store_settings ADD COLUMN about_story TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'opening_hours') THEN
        ALTER TABLE public.store_settings ADD COLUMN opening_hours TEXT DEFAULT 'Monday - Saturday: 8:00 AM - 8:00 PM | Sunday: 10:00 AM - 6:00 PM';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'instagram_handle') THEN
        ALTER TABLE public.store_settings ADD COLUMN instagram_handle TEXT DEFAULT '@deebakesng';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'updated_at') THEN
        ALTER TABLE public.store_settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Seed default row (id = 1) if not already present
INSERT INTO public.store_settings (
    id,
    store_name,
    tagline,
    phone_number,
    whatsapp_number,
    email,
    physical_address,
    bank_name,
    bank_account_name,
    bank_account_number,
    bank_payment_instructions,
    is_store_open,
    pause_orders,
    min_order_amount,
    opening_hours,
    instagram_handle
) VALUES (
    1,
    'DEE BAKES',
    'Made with love. Crafted to delight.',
    '+234 812 345 6789',
    '2348123456789',
    'orders@deebakes.ng',
    'Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    'Guaranty Trust Bank (GTBank)',
    'DEE BAKES CONFECTIONERY',
    '0234567891',
    'Please include your Order Reference as the transfer remark. After payment, upload your payment receipt or transfer reference.',
    TRUE,
    FALSE,
    3000.00,
    'Monday - Saturday: 8:00 AM - 8:00 PM | Sunday: 10:00 AM - 6:00 PM',
    '@deebakesng'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Configure Row Level Security (RLS) Policies on store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to store settings
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
ON public.store_settings
FOR SELECT
USING (TRUE);

-- Allow authenticated users and API to update store settings
DROP POLICY IF EXISTS "Allow update store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public can update store settings" ON public.store_settings;
CREATE POLICY "Public can update store settings"
ON public.store_settings
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

-- Allow inserting the singleton settings record
DROP POLICY IF EXISTS "Allow insert store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public can insert store settings" ON public.store_settings;
CREATE POLICY "Public can insert store settings"
ON public.store_settings
FOR INSERT
WITH CHECK (id = 1);

-- 4. Enable RLS permissions on administrative collections (categories, delivery zones, products)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Public can insert categories" ON public.categories;
CREATE POLICY "Public can insert categories" ON public.categories FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public can update categories" ON public.categories;
CREATE POLICY "Public can update categories" ON public.categories FOR UPDATE USING (TRUE);
DROP POLICY IF EXISTS "Public can delete categories" ON public.categories;
CREATE POLICY "Public can delete categories" ON public.categories FOR DELETE USING (TRUE);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active delivery zones" ON public.delivery_zones;
CREATE POLICY "Public can view active delivery zones" ON public.delivery_zones FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Public can insert delivery zones" ON public.delivery_zones;
CREATE POLICY "Public can insert delivery zones" ON public.delivery_zones FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public can update delivery zones" ON public.delivery_zones;
CREATE POLICY "Public can update delivery zones" ON public.delivery_zones FOR UPDATE USING (TRUE);
DROP POLICY IF EXISTS "Public can delete delivery zones" ON public.delivery_zones;
CREATE POLICY "Public can delete delivery zones" ON public.delivery_zones FOR DELETE USING (TRUE);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view available products" ON public.products;
CREATE POLICY "Public can view available products" ON public.products FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Public can insert products" ON public.products;
CREATE POLICY "Public can insert products" ON public.products FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public can update products" ON public.products;
CREATE POLICY "Public can update products" ON public.products FOR UPDATE USING (TRUE);
DROP POLICY IF EXISTS "Public can delete products" ON public.products;
CREATE POLICY "Public can delete products" ON public.products FOR DELETE USING (TRUE);

-- 5. Enable Supabase Realtime for store_settings, delivery_zones, and categories
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_zones;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;
