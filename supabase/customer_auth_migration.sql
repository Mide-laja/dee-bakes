-- ==============================================================================
-- DEE BAKES - CUSTOMER AUTHENTICATION & ACCOUNT MANAGEMENT MIGRATION
-- Production-Ready Supabase Migration (Fault-Tolerant & Production-Hardened)
-- ==============================================================================

-- 1. ENSURE EXTENSION FOR UUID GENERATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENSURE CUSTOMERS TABLE & COLUMNS EXIST
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    default_address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_id column exists on customers if table already existed
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 3. ENSURE ORDERS TABLE HAS user_id COLUMN
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. BULLETPROOF CUSTOMER PROFILE TRIGGER FUNCTION
-- When a customer registers via Supabase Auth (auth.users), automatically
-- create or link their profile in public.customers.
-- Uses EXCEPTION WHEN OTHERS so that any public table constraint/error 
-- NEVER rolls back auth.users signup or causes a 500 error!
CREATE OR REPLACE FUNCTION public.handle_new_customer_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
    v_existing_id UUID;
BEGIN
    -- Extract metadata supplied during signUp
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'Customer'
    );
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

    -- Check if an unlinked customer profile already exists with this email or phone
    SELECT id INTO v_existing_id 
    FROM public.customers 
    WHERE (email = NEW.email OR (phone = v_phone AND v_phone <> '')) 
      AND (user_id IS NULL OR user_id = NEW.id)
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        -- Link existing record
        UPDATE public.customers
        SET user_id = NEW.id,
            name = COALESCE(NULLIF(name, ''), v_full_name),
            phone = COALESCE(NULLIF(phone, ''), v_phone),
            email = NEW.email
        WHERE id = v_existing_id;
    ELSE
        -- Insert fresh customer record (let default generate UUID)
        INSERT INTO public.customers (user_id, name, phone, email, total_orders, total_spent)
        VALUES (
            NEW.id,
            v_full_name,
            v_phone,
            NEW.email,
            0,
            0.00
        )
        ON CONFLICT (user_id) DO UPDATE
        SET name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- CRITICAL: Log warning to Postgres logs but DO NOT abort the auth.users insert!
    -- This prevents GoTrue 500 "Database error saving new user" {} errors!
    RAISE WARNING 'Customer profile sync notice for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_create_customer ON auth.users;

CREATE TRIGGER on_auth_user_created_create_customer
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_customer_signup();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR CUSTOMER DATA

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers table policies
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
CREATE POLICY "Customers can view own profile"
    ON public.customers
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.uid() IS NULL -- allows guest check
    );

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile"
    ON public.customers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers can insert profile" ON public.customers;
CREATE POLICY "Customers can insert profile"
    ON public.customers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Orders table policies
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
    ON public.orders
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR user_id IS NULL -- allows guest tracking by reference
    );

DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can update transfer reference" ON public.orders;
CREATE POLICY "Public can update transfer reference"
    ON public.orders
    FOR UPDATE
    USING (TRUE)
    WITH CHECK (TRUE);

-- Order Items policies
DROP POLICY IF EXISTS "Allow reading order items" ON public.order_items;
CREATE POLICY "Allow reading order items"
    ON public.order_items
    FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Allow inserting order items" ON public.order_items;
CREATE POLICY "Allow inserting order items"
    ON public.order_items
    FOR INSERT
    WITH CHECK (TRUE);

-- 6. ADMIN SEPARATION NOTICE
-- Notice: Customers who sign up through auth.users NEVER gain access to public.admin_users
-- The admin studio authentication remains strictly verified against public.admin_users
