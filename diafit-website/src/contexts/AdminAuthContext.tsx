"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

/** Any @diafit.com user is an admin. Superadmin (only one who can register new admins) is admin@diafit.com. */
export const CREATED_USER_EMAIL_SUFFIX = "@diafit.com";
export const SUPERADMIN_EMAIL = "admin@diafit.com";

export interface WebsiteUserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_by: string | null;
  created_at: string;
}

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Current user id (when authenticated). Used for last-seen heartbeat. */
  userId: string | null;
  /** Current user email (when authenticated). Used to show superadmin-only actions. */
  userEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/** User is admin if they are in the admins table OR their email ends with @diafit.com. */
async function checkIsAdmin(userId: string, email: string | undefined): Promise<boolean> {
  if (email?.toLowerCase().endsWith(CREATED_USER_EMAIL_SUFFIX)) return true;
  if (!supabase) return false;
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return !!data;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    if (!supabase) {
      setIsAuthenticated(false);
      setUserId(null);
      setUserEmail(null);
      setIsLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsAuthenticated(false);
      setUserId(null);
      setUserEmail(null);
      setIsLoading(false);
      return;
    }
    const isAdmin = await checkIsAdmin(session.user.id, session.user.email ?? undefined);
    setIsAuthenticated(isAdmin);
    setUserId(session.user.id);
    setUserEmail(session.user.email ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshAuth();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });
    return () => subscription.unsubscribe();
  }, [refreshAuth]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    if (!supabase) {
      setError("Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
      return false;
    }
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      return false;
    }
    if (!data.user) return false;
    const isAdmin = await checkIsAdmin(data.user.id, data.user.email ?? undefined);
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError("This account cannot access the admin panel.");
      return false;
    }
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        userEmail,
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
