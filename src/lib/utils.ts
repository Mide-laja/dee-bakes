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
