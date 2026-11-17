'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Logo } from '@/components/brand/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { signIn, user, isLoading } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectPath);
    }
  }, [user, isLoading, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn({
        email,
        password,
        rememberMe,
      });

      if (!res.success) {
        setErrorMsg(
          res.error?.includes('Invalid login credentials')
            ? 'Incorrect email address or password. Please try again.'
            : res.error || 'Unable to log in. Please check your credentials.'
        );
        setLoading(false);
        return;
      }

      // Successful login
      router.push(redirectPath);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-ivory dark:bg-espresso-950 transition-colors">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-[1.02] transition-transform">
            <Logo variant="full" size="md" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-caramel/10 text-caramel mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Back</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory tracking-tight">
            Customer Login
          </h1>
          <p className="mt-2 text-sm text-espresso/70 dark:text-ivory/70">
            Sign in to manage your orders, delivery addresses and profile.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-espresso-900/80 backdrop-blur-md border border-caramel/20 rounded-3xl p-6 sm:p-9 shadow-warm">
          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory placeholder:text-espresso/40 dark:placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-caramel hover:text-caramel-600 underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory placeholder:text-espresso/40 dark:placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso/50 dark:text-ivory/50 hover:text-caramel"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-caramel/40 text-caramel focus:ring-caramel"
                />
                <span className="text-xs text-espresso/75 dark:text-ivory/75">
                  Remember me on this device
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-caramel text-ivory font-medium tracking-wide hover:bg-caramel-600 active:scale-[0.99] transition-all duration-200 shadow-warm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Register */}
          <div className="mt-8 pt-6 border-t border-caramel/15 text-center">
            <p className="text-sm text-espresso/70 dark:text-ivory/70">
              Don&apos;t have a Dee Bakes account yet?{' '}
              <Link
                href="/signup"
                className="font-semibold text-caramel hover:text-caramel-600 underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-espresso/50 dark:text-ivory/50">
          <ShieldCheck className="w-4 h-4 text-caramel" />
          <span>Encrypted Customer Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-caramel" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
