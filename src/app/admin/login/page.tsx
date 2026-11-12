'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Logo } from '@/components/brand/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('dee@deebakes.ng');
  const [password, setPassword] = useState('deebakes2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = login(email, password);
    if (success) {
      router.push('/admin');
    } else {
      setError('Invalid credentials. Please verify your email and password.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('dee@deebakes.ng');
    setPassword('deebakes2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-espresso-950 text-ivory flex flex-col justify-center items-center px-4 py-12">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-caramel/10 via-transparent to-espresso-950 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <Logo variant="full" theme="dark" size="lg" />
          </div>
          <div className="pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-caramel/30 text-sand border border-caramel/40">
              DEE BAKES STUDIO
            </span>
          </div>
          <p className="text-xs text-ivory/60 pt-1">
            Business & Order Management Platform for Head Baker Dee
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-espresso-900/90 border border-caramel/30 shadow-2xl backdrop-blur-md space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-ivory/80 block mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dee@deebakes.ng"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-espresso-800 border border-caramel/30 text-xs text-ivory focus:outline-none focus:border-caramel"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ivory/80 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-caramel absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-espresso-800 border border-caramel/30 text-xs text-ivory focus:outline-none focus:border-caramel"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-caramel text-ivory font-semibold text-xs tracking-wider uppercase hover:bg-caramel-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Access Studio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Quick Demo Sign-in Helper */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sand text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Use Owner Credentials (dee@deebakes.ng)</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-ivory/50 hover:text-sand transition-colors inline-flex items-center gap-1"
          >
            <span>← Back to Customer Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
