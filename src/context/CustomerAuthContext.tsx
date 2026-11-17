'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Customer } from '@/types';
import { User, Session } from '@supabase/supabase-js';

const LOCAL_STORAGE_SESSION_KEY = 'deebakes_customer_session_v1';
const LOCAL_STORAGE_CUSTOMERS_KEY = 'deebakes_local_customers_v1';

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  emailConfirmed?: boolean;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  supabaseUser: User | null;
  session: Session | null;
  customerProfile: Customer | null;
  isLoading: boolean;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    requireEmailVerification?: boolean;
  }>;
  signIn: (params: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  resetPassword: (newPassword: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  updateProfile: (params: {
    fullName?: string;
    phone?: string;
    email?: string;
  }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  changePassword: (newPassword: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to extract or fetch customer profile from Supabase or localStorage
  const loadCustomerProfile = async (userId: string, email: string, name: string, phone: string) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .or(`user_id.eq.${userId},email.eq.${email},phone.eq.${phone}`)
          .maybeSingle();

        if (data && !error) {
          setCustomerProfile(data as Customer);
          return;
        }

        // If no existing row found in public.customers, create or ensure a profile
        const newProfile: Partial<Customer> = {
          name,
          phone,
          email,
          user_id: userId,
          total_orders: 0,
          total_spent: 0,
        };

        const { data: inserted } = await supabase
          .from('customers')
          .upsert(newProfile)
          .select()
          .maybeSingle();

        if (inserted) {
          setCustomerProfile(inserted as Customer);
          return;
        }
      } catch (err) {
        console.warn('Customer profile load note:', err);
      }
    }

    // Fallback profile
    setCustomerProfile({
      id: `cust-${userId.slice(0, 8)}`,
      user_id: userId,
      name,
      phone,
      email,
      total_orders: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
    });
  };

  // Sync Supabase Auth state or local fallback on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (!mounted) return;

          if (data.session?.user) {
            const sbUser = data.session.user;
            setSession(data.session);
            setSupabaseUser(sbUser);

            const fullName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split('@')[0] ||
              'Customer';
            const phone = sbUser.user_metadata?.phone || '';

            const mappedUser: CustomerUser = {
              id: sbUser.id,
              email: sbUser.email || '',
              fullName,
              phone,
              emailConfirmed: !!sbUser.email_confirmed_at,
            };

            setUser(mappedUser);
            await loadCustomerProfile(sbUser.id, mappedUser.email, fullName, phone);
          } else {
            setUser(null);
            setSupabaseUser(null);
            setSession(null);
            setCustomerProfile(null);
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err);
        } finally {
          if (mounted) setIsLoading(false);
        }

        // Subscribe to auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (!mounted) return;

          if (newSession?.user) {
            const sbUser = newSession.user;
            setSession(newSession);
            setSupabaseUser(sbUser);

            const fullName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split('@')[0] ||
              'Customer';
            const phone = sbUser.user_metadata?.phone || '';

            const mappedUser: CustomerUser = {
              id: sbUser.id,
              email: sbUser.email || '',
              fullName,
              phone,
              emailConfirmed: !!sbUser.email_confirmed_at,
            };

            setUser(mappedUser);
            await loadCustomerProfile(sbUser.id, mappedUser.email, fullName, phone);
          } else {
            setUser(null);
            setSupabaseUser(null);
            setSession(null);
            setCustomerProfile(null);
          }
          setIsLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        // Fallback local session for offline development
        try {
          const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id) {
              setUser(parsed);
              await loadCustomerProfile(parsed.id, parsed.email, parsed.fullName, parsed.phone);
            }
          }
        } catch (e) {
          console.warn('Local session parse error:', e);
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await loadCustomerProfile(user.id, user.email, user.fullName, user.phone);
    }
  };

  // 1. Sign Up
  const signUp = async ({
    email,
    password,
    fullName,
    phone,
  }: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
              phone: trimmedPhone,
            },
            emailRedirectTo:
              typeof window !== 'undefined'
                ? `${window.location.origin}/account`
                : undefined,
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // If email confirmation is required and no session returned immediately
        if (data.user && !data.session) {
          return {
            success: true,
            requireEmailVerification: true,
            message:
              'Account created successfully! We have sent a confirmation link to your email address. Please click the link to activate your account.',
          };
        }

        if (data.user) {
          const newUser: CustomerUser = {
            id: data.user.id,
            email: trimmedEmail,
            fullName: trimmedName,
            phone: trimmedPhone,
            emailConfirmed: !!data.user.email_confirmed_at,
          };
          setUser(newUser);
          setSupabaseUser(data.user);
          setSession(data.session);
          await loadCustomerProfile(data.user.id, trimmedEmail, trimmedName, trimmedPhone);
          return { success: true };
        }
      } else {
        // Local offline simulation
        const mockUserId = `usr-${Date.now()}`;
        const newUser: CustomerUser = {
          id: mockUserId,
          email: trimmedEmail,
          fullName: trimmedName,
          phone: trimmedPhone,
          emailConfirmed: true,
        };

        // Save into local store of registered users
        const existingUsers = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY) || '[]'
        );
        if (existingUsers.some((u: any) => u.email === trimmedEmail)) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        existingUsers.push({ ...newUser, password });
        localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(existingUsers));
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newUser));

        setUser(newUser);
        await loadCustomerProfile(mockUserId, trimmedEmail, trimmedName, trimmedPhone);
        return { success: true };
      }

      return { success: false, error: 'Registration could not be completed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during signup.' };
    }
  };

  // 2. Sign In
  const signIn = async ({
    email,
    password,
    rememberMe = true,
  }: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const fullName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            trimmedEmail.split('@')[0];
          const phone = data.user.user_metadata?.phone || '';

          const loggedInUser: CustomerUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            fullName,
            phone,
            emailConfirmed: !!data.user.email_confirmed_at,
          };

          setUser(loggedInUser);
          setSupabaseUser(data.user);
          setSession(data.session);
          await loadCustomerProfile(data.user.id, loggedInUser.email, fullName, phone);
          return { success: true };
        }
      } else {
        // Local offline simulation
        const existingUsers = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY) || '[]'
        );
        const matched = existingUsers.find(
          (u: any) => u.email === trimmedEmail && u.password === password
        );

        if (!matched) {
          // Allow convenience login for testing if no users registered yet
          if (existingUsers.length === 0) {
            const demoUser: CustomerUser = {
              id: 'usr-customer-demo',
              email: trimmedEmail,
              fullName: trimmedEmail.split('@')[0],
              phone: '+234 801 234 5678',
              emailConfirmed: true,
            };
            existingUsers.push({ ...demoUser, password });
            localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(existingUsers));
            if (rememberMe) {
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(demoUser));
            }
            setUser(demoUser);
            await loadCustomerProfile(demoUser.id, demoUser.email, demoUser.fullName, demoUser.phone);
            return { success: true };
          }
          return { success: false, error: 'Invalid email or password.' };
        }

        const loggedInUser: CustomerUser = {
          id: matched.id,
          email: matched.email,
          fullName: matched.fullName,
          phone: matched.phone,
          emailConfirmed: true,
        };

        if (rememberMe) {
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(loggedInUser));
        }
        setUser(loggedInUser);
        await loadCustomerProfile(matched.id, matched.email, matched.fullName, matched.phone);
        return { success: true };
      }

      return { success: false, error: 'Unable to sign in.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  // 3. Sign Out
  const signOut = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      }
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      setCustomerProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // 4. Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return { success: false, error: 'Please enter your email address.' };
      }

      if (isSupabaseConfigured() && supabase) {
        const redirectTo =
          typeof window !== 'undefined'
            ? `${window.location.origin}/reset-password`
            : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return {
          success: true,
          message:
            'A password reset link has been dispatched to your email. Please check your inbox and spam folder.',
        };
      } else {
        return {
          success: true,
          message:
            'Password reset request received. (In preview mode: you can navigate directly to /reset-password to set a new password).',
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error sending password reset email.' };
    }
  };

  // 5. Reset Password (from recovery link)
  const resetPassword = async (newPassword: string) => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return {
          success: true,
          message: 'Your password has been successfully updated. You may now log in.',
        };
      } else {
        return {
          success: true,
          message: 'Your password has been successfully updated.',
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error updating password.' };
    }
  };

  // 6. Update Profile
  const updateProfile = async ({
    fullName,
    phone,
    email,
  }: {
    fullName?: string;
    phone?: string;
    email?: string;
  }) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to update your profile.' };
    }

    try {
      const updatedUser: CustomerUser = {
        ...user,
        fullName: fullName !== undefined ? fullName.trim() : user.fullName,
        phone: phone !== undefined ? phone.trim() : user.phone,
        email: email !== undefined ? email.trim().toLowerCase() : user.email,
      };

      if (isSupabaseConfigured() && supabase) {
        // Update user metadata / auth email
        const updatePayload: any = {
          data: {
            full_name: updatedUser.fullName,
            phone: updatedUser.phone,
          },
        };

        if (email && email.trim().toLowerCase() !== user.email) {
          updatePayload.email = email.trim().toLowerCase();
        }

        const { data: authUpdate, error: authErr } = await supabase.auth.updateUser(updatePayload);
        if (authErr) {
          return { success: false, error: authErr.message };
        }

        // Also update public.customers table
        await supabase
          .from('customers')
          .update({
            name: updatedUser.fullName,
            phone: updatedUser.phone,
            email: updatedUser.email,
          })
          .or(`user_id.eq.${user.id},email.eq.${user.email}`);

        setUser(updatedUser);
        if (authUpdate.user) setSupabaseUser(authUpdate.user);
        await refreshProfile();

        const emailNotice =
          email && email.trim().toLowerCase() !== user.email
            ? ' A confirmation email has been sent to your new email address to complete the change.'
            : '';

        return {
          success: true,
          message: `Profile updated successfully!${emailNotice}`,
        };
      } else {
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
        }
        return { success: true, message: 'Profile updated successfully!' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  };

  // 7. Change Password
  const changePassword = async (newPassword: string) => {
    return resetPassword(newPassword);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        customerProfile,
        isLoading,
        signUp,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
