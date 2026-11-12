'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { DBStore } from '@/lib/store';
import { createWhatsAppLink } from '@/lib/utils';

export default function ContactPage() {
  const settings = DBStore.getSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Direct to WhatsApp
      const whatsappText = `Hello Dee! My name is ${name} (${phone}).\n\n${message}`;
      const url = createWhatsAppLink(settings.whatsapp_number, whatsappText);
      window.open(url, '_blank');
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-caramel dark:text-sand">
          We Are Here For You
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-espresso dark:text-ivory">
          Contact Dee Bakes
        </h1>
        <p className="text-xs sm:text-sm text-espresso/70 dark:text-ivory/70">
          Have an enquiry about party catering, event platters, custom celebration cakes, or your order? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Details & Direct WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-emerald-600 text-white shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">Fastest Response</h3>
                <p className="text-xs text-emerald-100">Direct WhatsApp with Dee</p>
              </div>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Our team operates in real-time on WhatsApp. Click below to chat directly with our head baker.
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-white text-emerald-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat on WhatsApp ({settings.phone_number})</span>
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm space-y-5 text-xs text-espresso/80 dark:text-ivory/80">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-caramel shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-espresso dark:text-ivory">Kitchen Address</p>
                <p className="mt-0.5">{settings.physical_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-caramel/10">
              <Clock className="w-5 h-5 text-caramel shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-espresso dark:text-ivory">Opening Hours</p>
                <p className="mt-0.5">{settings.opening_hours}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-caramel/10">
              <Mail className="w-5 h-5 text-caramel shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-espresso dark:text-ivory">Email Enquiries</p>
                <a href={`mailto:${settings.email}`} className="text-caramel hover:underline mt-0.5 block">
                  {settings.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Message Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white/80 dark:bg-espresso-800/80 border border-caramel/20 shadow-warm">
          <h3 className="font-serif text-2xl font-bold text-espresso dark:text-ivory mb-2">
            Send Us a Message
          </h3>
          <p className="text-xs text-espresso/60 dark:text-ivory/60 mb-6">
            Fill in your details below and we will automatically direct your enquiry to WhatsApp with your details pre-formatted.
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-600/15 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-bold text-sm">Message Sent to WhatsApp!</p>
              <p>Dee has received your note and will be with you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Babatunde"
                  className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  Your Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-4 py-3 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-espresso/80 dark:text-ivory/80 block mb-1">
                  How Can We Help You? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about event catering, custom cake quotes, delivery to your area..."
                  className="w-full p-4 rounded-xl bg-ivory dark:bg-espresso-900 border border-caramel/25 text-xs text-espresso dark:text-ivory focus:outline-none focus:border-caramel"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-caramel text-ivory font-semibold text-xs tracking-wider uppercase hover:bg-caramel-600 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Send via WhatsApp Chat</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
