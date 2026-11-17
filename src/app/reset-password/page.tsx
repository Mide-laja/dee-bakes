'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Logo } from '@/components/brand/Logo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useCustomerAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Password must contain both letters and numbers.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update password. Your reset link may have expired.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-ivory dark:bg-espresso-950 transition-colors">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-[1.02] transition-transform">
            <Logo variant="full" size="md" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-caramel/10 text-caramel mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Set New Password</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-espresso dark:text-ivory tracking-tight">
            Create New Password
          </h1>
          <p className="mt-2 text-sm text-espresso/70 dark:text-ivory/70">
            Please choose a strong password for your Dee Bakes account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-espresso-900/80 backdrop-blur-md border border-caramel/20 rounded-3xl p-6 sm:p-9 shadow-warm">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-espresso dark:text-ivory mb-2">
                  Password Updated!
                </h3>
                <p className="text-sm text-espresso/70 dark:text-ivory/70 leading-relaxed">
                  Your new password is now active. You will be redirected to the login page shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-caramel text-ivory font-medium hover:bg-caramel-600 transition-colors shadow-sm"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars (letters & numbers)"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your new password"
                    className="w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory placeholder:text-espresso/40 dark:placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso/50 dark:text-ivory/50 hover:text-caramel"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-caramel text-ivory font-medium tracking-wide hover:bg-caramel-600 active:scale-[0.99] transition-all duration-200 shadow-warm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-espresso/50 dark:text-ivory/50">
          <ShieldCheck className="w-4 h-4 text-caramel" />
          <span>Secure End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}
