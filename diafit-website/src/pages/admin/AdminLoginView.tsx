import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AdminLoginView() {
  const { login, error, clearError, isLoading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await login(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500">Checking sign-in…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="light" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-center text-lg font-semibold text-slate-900">
            Admin sign in
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            Sign in with your Supabase admin account (must be in the <code className="text-xs">admins</code> table).
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@diafit.com"
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[var(--diafit-blue)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--diafit-blue-light)] disabled:opacity-70"
            >
              {submitting ? "Signing in…" : "Log in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Create <strong>admin@diafit.com</strong> in Supabase Auth, then run in SQL Editor:{" "}
            <code className="block mt-1 text-left break-all">INSERT INTO admins (id, email) SELECT id, email FROM auth.users WHERE email = &apos;admin@diafit.com&apos;;</code>
          </p>
          <p className="mt-3 text-center">
            <Link
              to="/"
              className="text-sm text-[var(--diafit-blue)] hover:underline"
            >
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
