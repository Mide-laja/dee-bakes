'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { formatAuthErrorMessage } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, user } = useCustomerAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already logged in, show quick banner
  if (user && !success && !verificationNotice) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-ivory-50 dark:bg-espresso-900 border border-caramel/25 rounded-3xl p-8 text-center shadow-warm">
          <div className="w-16 h-16 rounded-full bg-caramel/15 text-caramel mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-espresso dark:text-ivory mb-2">
            You are already signed in
          </h2>
          <p className="text-sm text-espresso/70 dark:text-ivory/70 mb-6">
            Signed in as <strong className="text-caramel">{user.fullName}</strong> ({user.email}).
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/account"
              className="w-full py-3 px-6 rounded-full bg-caramel text-ivory font-medium hover:bg-caramel-600 transition-colors shadow-sm"
            >
              Go to My Account
            </Link>
            <Link
              href="/menu"
              className="w-full py-3 px-6 rounded-full border border-caramel/30 text-espresso dark:text-ivory font-medium hover:bg-caramel/10 transition-colors"
            >
              Explore Our Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setVerificationNotice(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please enter a valid phone number (e.g. 0801 234 5678).');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({
        fullName,
        email,
        phone,
        password,
      });

      if (!result.success) {
        setErrorMsg(formatAuthErrorMessage(result.error));
        setLoading(false);
        return;
      }

      if (result.requireEmailVerification) {
        setVerificationNotice(
          result.message ||
            'We have sent a verification email to your address. Please click the link inside to verify your account.'
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/account');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(formatAuthErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-ivory dark:bg-espresso-950 transition-colors">
      <div className="max-w-xl w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-[1.02] transition-transform">
            <Logo variant="full" size="md" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-caramel/10 text-caramel mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join the Dee Bakes Family</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-espresso dark:text-ivory tracking-tight">
            Create Customer Account
          </h1>
          <p className="mt-2 text-sm text-espresso/70 dark:text-ivory/70 max-w-sm mx-auto">
            Order faster, track your artisan treats in real-time, and view your complete order history.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white/80 dark:bg-espresso-900/80 backdrop-blur-md border border-caramel/20 rounded-3xl p-6 sm:p-10 shadow-warm">
          {/* Email Verification Banner */}
          {verificationNotice && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-center mb-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold">Check Your Email</h3>
              <p className="text-sm leading-relaxed">{verificationNotice}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <span>Already confirmed? Proceed to Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-center mb-6 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-serif text-xl font-bold">Welcome to DEE BAKES!</h3>
              <p className="text-sm">
                Your customer account has been created. Redirecting to your dashboard...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="space-y-1">
                <p className="leading-relaxed font-medium">{errorMsg}</p>
                {errorMsg.toLowerCase().includes('already exists') && (
                  <div className="pt-1">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-caramel hover:underline"
                    >
                      <span>Click here to Log In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {!verificationNotice && !success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                  Full Name <span className="text-caramel">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Folashade Adeleke"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory placeholder:text-espresso/40 dark:placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    Email Address <span className="text-caramel">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory placeholder:text-espresso/40 dark:placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                    Phone Number <span className="text-caramel">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-ivory/50 dark:bg-espresso-800/50 border border-caramel/25 text-espresso dark:text-ivory placeholder:text-espresso/40 dark:placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                  Password <span className="text-caramel">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters (letters & numbers)"
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
                <p className="mt-1 text-[11px] text-espresso/50 dark:text-ivory/50">
                  Must be at least 8 characters with at least one letter and one number.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 dark:text-ivory/70 mb-1.5">
                  Confirm Password <span className="text-caramel">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-caramel/70" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
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

              {/* Privacy Policy & Terms Agreement Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-caramel/40 text-caramel focus:ring-caramel"
                  />
                  <span className="text-xs text-espresso/75 dark:text-ivory/75 leading-relaxed">
                    I agree to the DEE BAKES{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-caramel underline font-medium hover:text-caramel-600"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-caramel underline font-medium hover:text-caramel-600"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-caramel text-ivory font-medium tracking-wide hover:bg-caramel-600 active:scale-[0.99] transition-all duration-200 shadow-warm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Your Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link to Login */}
          <div className="mt-8 pt-6 border-t border-caramel/15 text-center">
            <p className="text-sm text-espresso/70 dark:text-ivory/70">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-caramel hover:text-caramel-600 underline transition-colors"
              >
                Log In Here
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-espresso/50 dark:text-ivory/50">
          <ShieldCheck className="w-4 h-4 text-caramel" />
          <span>Encrypted & Secured with Supabase Authentication</span>
        </div>
      </div>
    </div>
  );
}
