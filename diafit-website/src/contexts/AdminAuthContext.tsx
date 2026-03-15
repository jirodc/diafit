"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const ADMIN_STORAGE_KEY = "diafit_admin_authenticated";

const ADMIN_ACCOUNTS_KEY = "diafit_admin_accounts";

/** Mock admin credentials – replace with real auth later. */
const MOCK_ADMIN_EMAIL = "admin@diafit.com";
const MOCK_ADMIN_PASSWORD = "admin123";

/** Only emails ending with this domain can be registered as admin (website-only). */
export const ADMIN_EMAIL_SUFFIX = "@admin.com";

export interface StoredAdminAccount {
  email: string;
  password: string;
}

function getStoredAdminAccounts(): StoredAdminAccount[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredAdminAccounts(accounts: StoredAdminAccount[]) {
  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

/** Register a new admin (website create-account). Only allows email ending with @admin.com. */
export function registerAdminAccount(email: string, password: string): boolean {
  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim.endsWith(ADMIN_EMAIL_SUFFIX)) return false;
  const accounts = getStoredAdminAccounts();
  if (accounts.some((a) => a.email === emailTrim)) return false;
  accounts.push({ email: emailTrim, password });
  setStoredAdminAccounts(accounts);
  return true;
}

/** Check if credentials belong to an admin (@admin.com mock or stored). Used by main site login and admin login. */
export function checkAdminCredentials(email: string, password: string): boolean {
  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim.endsWith(ADMIN_EMAIL_SUFFIX)) return false;
  if (emailTrim === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) return true;
  const accounts = getStoredAdminAccounts();
  return accounts.some((a) => a.email === emailTrim && a.password === password);
}

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  error: string | null;
  clearError: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function getStoredAuth(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setStoredAuth(value: boolean) {
  try {
    if (value) sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
    else sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(getStoredAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(getStoredAuth());
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    setError(null);
    if (!checkAdminCredentials(email, password)) {
      setError("Invalid email or password. Sign in with an @admin.com account or create one on the website.");
      return false;
    }
    setIsAuthenticated(true);
    setStoredAuth(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setStoredAuth(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}

/** For display only – do not use for real auth. */
export const MOCK_ADMIN_CREDENTIALS = {
  email: MOCK_ADMIN_EMAIL,
  password: MOCK_ADMIN_PASSWORD,
} as const;
