import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAdminAuth, MOCK_ADMIN_CREDENTIALS } from "@/contexts/AdminAuthContext";

export function AdminLoginView() {
  const { login, error, clearError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    login(email, password);
  };

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
            Sign in to access the Diafit admin panel.
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
              className="w-full rounded-lg bg-[var(--diafit-blue)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--diafit-blue-light)]"
            >
              Log in
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Mock account: <strong>{MOCK_ADMIN_CREDENTIALS.email}</strong> /{" "}
            <strong>{MOCK_ADMIN_CREDENTIALS.password}</strong>
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
