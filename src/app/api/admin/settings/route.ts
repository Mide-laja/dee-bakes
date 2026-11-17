import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { StoreSettings } from '@/types';

// Server-side Supabase client using Service Role key (if available) or Anon key
function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const key = serviceRoleKey || anonKey;
  if (!supabaseUrl || !key) return null;

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// GET /api/admin/settings - Retrieve latest business settings from Supabase
export async function GET() {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase is not configured on the server.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error fetching settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update business settings in Supabase
export async function POST(request: Request) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase credentials are not configured on the server.' },
        { status: 503 }
      );
    }

    const body: Partial<StoreSettings> = await request.json();

    const payload = {
      id: 1,
      store_name: body.store_name,
      tagline: body.tagline,
      phone_number: body.phone_number,
      whatsapp_number: body.whatsapp_number,
      email: body.email,
      physical_address: body.physical_address,
      bank_name: body.bank_name,
      bank_account_name: body.bank_account_name,
      bank_account_number: body.bank_account_number,
      bank_payment_instructions: body.bank_payment_instructions,
      is_store_open: body.is_store_open ?? true,
      pause_orders: body.pause_orders ?? false,
      pause_message: body.pause_message,
      min_order_amount: body.min_order_amount ?? 3000,
      enable_cash_on_delivery: body.enable_cash_on_delivery ?? false,
      hero_headline: body.hero_headline,
      hero_subheadline: body.hero_subheadline,
      hero_video_url: body.hero_video_url,
      hero_poster_url: body.hero_poster_url,
      about_story: body.about_story,
      opening_hours: body.opening_hours,
      instagram_handle: body.instagram_handle,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('API /api/admin/settings update error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to save settings to database.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    console.error('API /api/admin/settings unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected server error while saving settings.' },
      { status: 500 }
    );
  }
}
