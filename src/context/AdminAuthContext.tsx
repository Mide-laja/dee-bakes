'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'manager';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'deebakes_admin_session_v1';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse admin session', e);
    }
    setLoading(false);
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Standard credential check (e.g. Dee's admin account)
    // Works seamlessly offline or locally, and can connect to Supabase Auth
    if (
      (email.toLowerCase() === 'dee@deebakes.ng' || email.toLowerCase() === 'admin@deebakes.ng') &&
      pass === 'deebakes2026'
    ) {
      const adminUser: AdminUser = {
        id: 'usr-dee-01',
        email: email.toLowerCase(),
        name: 'Dee (Head Chef & Owner)',
        role: 'owner',
      };
      setUser(adminUser);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
