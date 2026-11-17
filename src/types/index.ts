export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'payment_evidence_submitted'
  | 'payment_pending_verification'
  | 'payment_confirmed'
  | 'payment_rejected'
  | 'refunded';

export type PaymentMethod = 'bank_transfer' | 'cash_on_delivery';

export type OrderType = 'delivery' | 'pickup';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Size", "Flavour"
  option_name: string; // e.g. "Jumbo (Double Sausage)", "Standard"
  price_modifier: number;
  is_default?: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  is_available: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_customizable: boolean;
  stock_quantity: number; // -1 for made-to-order
  preparation_time?: string;
  images: string[];
  variations?: ProductVariation[];
}

export interface CustomCakeOptions {
  cake_size: string; // '6-inch (Serves 6-8)', '8-inch (Serves 12-16)', '10-inch (Serves 20-25)', '2-Tier Celebration', '3-Tier Grand Luxury'
  flavour: string; // 'Rich Red Velvet', 'Moist Belgian Chocolate', 'Vanilla Bean Dream', 'Caramel Biscuit Crunch', 'Strawberry Cream'
  design_preference: string; // 'Minimalist Floral', 'Vintage Lambeth Piping', 'Chocolate Drip & Macarons', 'Gold Leaf Elegance', 'Bespoke Theme'
  tiers?: string;
  cake_message?: string;
  requested_date: string;
  special_instructions?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID (product ID + variation hash)
  product: Product;
  quantity: number;
  selected_variation?: ProductVariation;
  custom_cake_options?: CustomCakeOptions;
  unit_price: number;
  total_price: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  fee: number;
  estimated_time: string;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  variation_details?: string;
  custom_options?: CustomCakeOptions;
  subtotal: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_reference: string;
  user_id?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: OrderType;
  delivery_zone_id?: string;
  delivery_zone_name?: string;
  delivery_address?: string;
  delivery_date?: string;
  delivery_time_slot?: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  transfer_reference?: string;
  payment_evidence_url?: string;
  customer_notes?: string;
  internal_notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  default_address?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  tagline: string;
  phone_number: string;
  whatsapp_number: string;
  email: string;
  physical_address: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_payment_instructions: string;
  is_store_open: boolean;
  pause_orders: boolean;
  pause_message: string;
  min_order_amount: number;
  enable_cash_on_delivery: boolean;
  hero_headline: string;
  hero_subheadline: string;
  hero_video_url: string;
  hero_poster_url: string;
  about_story: string;
  opening_hours: string;
  instagram_handle: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_role_or_location: string;
  comment: string;
  rating: number;
  avatar_url?: string;
  is_featured: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  is_active: boolean;
}
