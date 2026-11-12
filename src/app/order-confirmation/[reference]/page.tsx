'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Building2,
  Copy,
  Check,
  MessageCircle,
  Upload,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DBStore, storeEvents } from '@/lib/store';
import {
  formatCurrency,
  formatDate,
  formatOrderWhatsAppMessage,
  createWhatsAppLink,
} from '@/lib/utils';
import { Order } from '@/types';

export default function OrderConfirmationPage() {
  const params = useParams();
  const reference = params?.reference as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState(DBStore.getSettings());
  const [copied, setCopied] = useState(false);
  const [transferRefInput, setTransferRefInput] = useState('');
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [evidenceSubmittedSuccess, setEvidenceSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (reference) {
      const found = DBStore.getOrderByReference(reference);
      if (found) {
        setOrder(found);
        setTransferRefInput(found.transfer_reference || '');
        setEvidenceUrlInput(found.payment_evidence_url || '');
      }
    }

    const unsub = storeEvents.subscribe('orders', () => {
      if (reference) {
        const found = DBStore.getOrderByReference(reference);
        if (found) setOrder(found);
      }
    });

    return unsub;
  }, [reference]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-espresso dark:text-ivory">
          Order Not Found
        </h1>
        <p className="text-xs text-espresso/60 dark:text-ivory/60">
          We could not locate an order matching reference "{reference}".
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-caramel text-ivory text-xs font-semibold"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(settings.bank_account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.total_amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPaymentEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRefInput.trim() && !evidenceUrlInput.trim()) {
      alert('Please enter your transfer reference or paste/upload your payment receipt.');
      return;
    }

    setIsSubmittingEvidence(true);

    try {
      DBStore.updateOrderPayment(order.id, 'payment_evidence_submitted', {
        transferReference: transferRefInput.trim(),
        evidenceUrl:
          evidenceUrlInput.trim() ||
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        adminNote: `Customer submitted transfer reference: ${transferRefInput.trim()}`,
      });

      setEvidenceSubmittedSuccess(true);
      setIsSubmittingEvidence(false);
    } catch (err) {
      console.error('Error submitting evidence', err);
      setIsSubmittingEvidence(false);
    }
  };

  const handleSimulatedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a live environment with Supabase, this uploads to Supabase Storage bucket 'receipts'.
      // For immediate preview, create an object URL or data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceUrlInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const whatsappMessage = formatOrderWhatsAppMessage(order, settings.store_name);
  const whatsappHref = createWhatsAppLink(settings.whatsapp_number, whatsappMessage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
          Order Successfully Placed
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-espresso dark:text-ivory">
          Order #{order.order_reference}
        </h1>
        <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70 max-w-lg mx-auto">
          Thank you, <span className="font-semibold">{order.customer_name}</span>. Please complete your direct Nigerian bank transfer below so Dee can verify and prepare your delights.
        </p>
      </div>

      {/* Payment Status Pill */}
      <div className="flex items-center justify-center">
        {order.payment_status === 'payment_confirmed' ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold text-xs shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Payment Confirmed by Dee — Your order is being processed!</span>
          </div>
        ) : order.payment_status === 'payment_evidence_submitted' ||
          order.payment_status === 'payment_pending_verification' ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Transfer Reference Submitted — Pending Admin Verification by Dee</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-caramel/20 text-caramel dark:text-sand border border-caramel/30 font-semibold text-xs">
            <Clock className="w-4 h-4" />
            <span>Awaiting Direct Bank Transfer</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bank Account Details Card */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-espresso-800/90 border border-caramel/25 shadow-warm space-y-6">
            <div className="flex items-center justify-between border-b border-caramel/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-caramel/15 flex items-center justify-center text-caramel">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory">
                    Direct Bank Transfer Details
                  </h3>
                  <p className="text-[11px] text-espresso/60 dark:text-ivory/60">
                    Official DEE BAKES Nigerian Bank Account
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details Table */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-ivory dark:bg-espresso-900 border border-caramel/15 flex items-center justify-between">
                <div>
                  <span className="text-espresso/60 dark:text-ivory/60 text-[10px] uppercase font-bold tracking-wider block">
                    Bank Name
                  </span>
                  <span className="font-bold text-sm text-espresso dark:text-ivory">
                    {settings.bank_name}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory dark:bg-espresso-900 border border-caramel/15 flex items-center justify-between">
                <div>
                  <span className="text-espresso/60 dark:text-ivory/60 text-[10px] uppercase font-bold tracking-wider block">
                    Account Name
                  </span>
                  <span className="font-bold text-sm text-espresso dark:text-ivory">
                    {settings.bank_account_name}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-caramel/10 border border-caramel/30 flex items-center justify-between">
                <div>
                  <span className="text-caramel dark:text-sand text-[10px] uppercase font-bold tracking-wider block">
                    Account Number
                  </span>
                  <span className="font-mono font-bold text-lg text-espresso dark:text-ivory">
                    {settings.bank_account_number}
                  </span>
                </div>
                <button
                  onClick={handleCopyAccount}
                  className="px-3.5 py-1.5 rounded-xl bg-caramel text-ivory text-xs font-semibold hover:bg-caramel-600 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Number'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-ivory dark:bg-espresso-900 border border-caramel/15 flex items-center justify-between">
                <div>
                  <span className="text-espresso/60 dark:text-ivory/60 text-[10px] uppercase font-bold tracking-wider block">
                    Exact Amount to Transfer
                  </span>
                  <span className="font-serif font-bold text-xl text-caramel dark:text-sand">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                <button
                  onClick={handleCopyAmount}
                  className="text-xs text-caramel hover:underline font-semibold"
                >
                  Copy Amount
                </button>
              </div>
            </div>

            {/* Transfer Remark Instruction */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Important Transfer Remark / Memo:</span>
              </p>
              <p>
                Please input <strong className="font-mono text-sm">{order.order_reference}</strong> as your bank transfer description or remark so we can identify your funds immediately.
              </p>
            </div>

            {/* Payment Verification Form */}
            <form onSubmit={handleSubmitPaymentEvidence} className="space-y-4 pt-2">
              <h4 className="font-serif text-lg font-bold text-espresso dark:text-ivory flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-caramel" />
                <span>Submit Your Transfer Proof</span>
              </h4>

              {evidenceSubmittedSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-600/15 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proof Submitted Successfully!</span>
                  </p>
                  <p>
                    Dee has been notified of your transfer reference. You can also send the receipt on WhatsApp below for priority verification!
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                      Bank Transfer Reference / Session ID / Sender Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={transferRefInput}
                      onChange={(e) => setTransferRefInput(e.target.value)}
                      placeholder="e.g. GTB/TRF/98129381 or Folashade Adeleke"
                      className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                      Upload Payment Receipt Screenshot (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-caramel/40 hover:border-caramel bg-ivory dark:bg-espresso-900 text-xs font-medium text-espresso/80 dark:text-ivory/80 flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4 text-caramel" />
                        <span>Choose Receipt Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSimulatedImageUpload}
                          className="hidden"
                        />
                      </label>
                      {evidenceUrlInput && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Screenshot attached
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEvidence}
                    className="w-full py-3.5 rounded-xl bg-caramel text-ivory font-semibold text-xs tracking-wider uppercase hover:bg-caramel-600 transition-colors shadow-sm"
                  >
                    {isSubmittingEvidence ? 'Submitting Proof...' : 'Submit Payment Reference'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary & WhatsApp Quick Action */}
        <div className="md:col-span-5 space-y-6">
          {/* WhatsApp Direct Verification Action */}
          <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Verify Instantly on WhatsApp</h4>
                <p className="text-xs text-emerald-100">
                  Chat directly with Dee to confirm your payment
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed">
              Click below to send your pre-formatted order summary & transfer proof directly to Dee’s WhatsApp.
            </p>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-white text-emerald-900 font-bold text-xs tracking-wide uppercase hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span>Confirm on WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Order Summary Details */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso dark:text-ivory border-b border-caramel/15 pb-3">
              Order Details
            </h4>

            <div className="space-y-3 text-xs text-espresso/70 dark:text-ivory/70">
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono font-bold text-espresso dark:text-ivory">
                  {order.order_reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Placed on:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfilment:</span>
                <span className="capitalize font-medium text-espresso dark:text-ivory">
                  {order.order_type} ({order.delivery_zone_name || 'Standard'})
                </span>
              </div>
              {order.delivery_address && (
                <div>
                  <span className="block mb-0.5">Address:</span>
                  <span className="font-medium text-espresso dark:text-ivory">
                    {order.delivery_address}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="pt-3 border-t border-caramel/15 space-y-2 text-xs">
              <span className="font-semibold text-espresso dark:text-ivory block mb-1">
                Ordered Items:
              </span>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs py-1">
                  <div>
                    <span className="font-medium text-espresso dark:text-ivory">
                      {item.quantity}x {item.product_name}
                    </span>
                    {item.variation_details && (
                      <span className="text-[10px] text-caramel block">
                        {item.variation_details}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-espresso dark:text-ivory">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-caramel/20 flex justify-between items-baseline">
              <span className="font-bold text-sm text-espresso dark:text-ivory">Total:</span>
              <span className="font-serif text-2xl font-bold text-caramel dark:text-sand">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/track"
              className="text-xs font-semibold text-caramel hover:underline inline-flex items-center gap-1.5"
            >
              <span>Track Order Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
