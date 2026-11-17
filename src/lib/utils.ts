import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Order } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number into Nigerian Naira (NGN)
 * e.g., 4500 -> "₦4,500"
 */
export function formatCurrency(amount: number, includeDecimals = false): string {
  if (isNaN(amount)) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format a date string nicely
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Generate a clean WhatsApp click-to-chat link
 */
export function createWhatsAppLink(phone: string, text: string): string {
  // Strip non-digits from phone number
  const cleanedPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Build standard formatted WhatsApp message for an Order
 */
export function formatOrderWhatsAppMessage(order: Order, storeName = 'DEE BAKES'): string {
  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product_name}${
          item.variation_details ? ` (${item.variation_details})` : ''
        } - ${formatCurrency(item.subtotal)}`
    )
    .join('\n');

  const customNotes = order.customer_notes ? `\n📝 *Notes:* ${order.customer_notes}` : '';
  const deliveryInfo =
    order.order_type === 'delivery'
      ? `🚚 *Delivery Address:* ${order.delivery_address || 'To be confirmed'}\n📍 *Zone:* ${
          order.delivery_zone_name || 'Standard'
        }`
      : `🏪 *Pickup:* Self-collection at ${storeName} Kitchen`;

  const paymentStatusMap: Record<string, string> = {
    awaiting_payment: '⏳ Awaiting Transfer',
    payment_evidence_submitted: '🧾 Receipt Submitted (Pending Verification)',
    payment_pending_verification: '🔍 Pending Verification',
    payment_confirmed: '✅ Confirmed Paid',
    payment_rejected: '❌ Transfer Rejected',
    refunded: '↩️ Refunded',
  };

  const message = `👋 Hello ${storeName}! I just placed an order on your website.

*ORDER REFERENCE:* #${order.order_reference}
*Customer:* ${order.customer_name}
*Phone:* ${order.customer_phone}

🛒 *ORDER SUMMARY:*
${itemsList}

💰 *Subtotal:* ${formatCurrency(order.subtotal)}
🚚 *Delivery Fee:* ${formatCurrency(order.delivery_fee)}
*TOTAL AMOUNT:* *${formatCurrency(order.total_amount)}*

💳 *Payment Method:* ${order.payment_method === 'bank_transfer' ? 'Direct Bank Transfer' : 'Cash on Delivery'}
📌 *Payment Status:* ${paymentStatusMap[order.payment_status] || order.payment_status}
${order.transfer_reference ? `🔢 *Transfer Ref:* ${order.transfer_reference}` : ''}

${deliveryInfo}${customNotes}

Please confirm receipt of my order. Thank you!`;

  return message;
}

/**
 * Generate a unique, recognizable Order Reference
 * e.g., "DB-2026-8492"
 */
export function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DB-${year}-${random}`;
}

/**
 * Format any Supabase or network authentication error into a clear, user-friendly message.
 * Prevents raw objects or "{}" from being rendered to the user.
 */
export function formatAuthErrorMessage(error: any): string {
  if (!error) {
    return 'An unexpected authentication error occurred. Please try again.';
  }

  // Handle plain string error
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed === '' || trimmed === '{}' || trimmed === '[object Object]') {
      return 'Database error saving user: Supabase encountered an issue while saving the user profile. Please verify your Supabase database triggers or contact support.';
    }
    return trimmed;
  }

  // Extract all common error properties from Supabase AuthError / Error objects
  const message = error.message || error.error_description || error.description || error.msg;
  const code = error.code || error.error;
  const status = error.status || error.statusCode;

  // Known Supabase error code patterns
  if (
    code === 'user_already_exists' ||
    (typeof message === 'string' &&
      (message.toLowerCase().includes('already registered') ||
        message.toLowerCase().includes('user already exists')))
  ) {
    return 'An account with this email address already exists. Please log in instead or reset your password.';
  }

  if (
    code === 'weak_password' ||
    (typeof message === 'string' && message.toLowerCase().includes('password'))
  ) {
    if (typeof message === 'string' && message.length > 10 && message !== '{}') {
      return message;
    }
    return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
  }

  if (code === 'over_email_send_rate_limit') {
    return 'Too many registration attempts. Supabase email limit reached. Please wait a few minutes before trying again.';
  }

  if (code === 'signup_disabled') {
    return 'Signups are currently disabled in your Supabase project settings. Please enable email signups in the Supabase Dashboard.';
  }

  if (
    code === 'invalid_credentials' ||
    (typeof message === 'string' && message.toLowerCase().includes('invalid login credentials'))
  ) {
    return 'Incorrect email address or password. Please verify your credentials.';
  }

  if (
    code === 'email_not_confirmed' ||
    (typeof message === 'string' && message.toLowerCase().includes('email not confirmed'))
  ) {
    return 'Your email address has not been confirmed. Please check your inbox for the confirmation link.';
  }

  // Check if message is a clean, readable string
  if (typeof message === 'string') {
    const trimmed = message.trim();
    if (trimmed && trimmed !== '{}' && trimmed !== '[object Object]') {
      if (trimmed.toLowerCase().includes('database error saving new user')) {
        return 'Database error saving new user: A database trigger in Supabase failed during registration. Please apply the updated supabase/fix_customer_signup.sql script in your Supabase SQL Editor.';
      }
      return trimmed;
    }
  }

  // HTTP 500 error from GoTrue
  if (status === 500) {
    return 'Server database error (HTTP 500): Supabase failed to save the new user. This is usually caused by an unhandled database trigger on auth.users. Please update your database trigger in Supabase.';
  }

  return 'Unable to complete registration. Please check your network and try again.';
}
