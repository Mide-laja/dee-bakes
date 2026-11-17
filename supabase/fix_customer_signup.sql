-- ==============================================================================
-- DEE BAKES - INSTANT FIX FOR SUPABASE SIGNUP ERROR "{}"
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure customers table has user_id column
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

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- 3. Replace the signup trigger with a bulletproof, fault-tolerant version
-- This catches any exception and ensures auth.users insert NEVER aborts or returns a 500 {} error!
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
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'Customer'
    );
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

    SELECT id INTO v_existing_id 
    FROM public.customers 
    WHERE (email = NEW.email OR (phone = v_phone AND v_phone <> '')) 
      AND (user_id IS NULL OR user_id = NEW.id)
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        UPDATE public.customers
        SET user_id = NEW.id,
            name = COALESCE(NULLIF(name, ''), v_full_name),
            phone = COALESCE(NULLIF(phone, ''), v_phone),
            email = NEW.email
        WHERE id = v_existing_id;
    ELSE
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
    -- CRITICAL: Prevent rollback of auth.users insert!
    RAISE WARNING 'Customer profile sync notice: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created_create_customer ON auth.users;

CREATE TRIGGER on_auth_user_created_create_customer
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_customer_signup();

-- 5. Ensure RLS allows customer profile operations
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
CREATE POLICY "Customers can view own profile" ON public.customers FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile" ON public.customers FOR UPDATE
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers can insert profile" ON public.customers;
CREATE POLICY "Customers can insert profile" ON public.customers FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
