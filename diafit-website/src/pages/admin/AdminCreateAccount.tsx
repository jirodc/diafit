"use client";

import { useState } from "react";
import { AdminHeader } from "./AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { CREATED_USER_EMAIL_SUFFIX, SUPERADMIN_EMAIL } from "@/contexts/AdminAuthContext";
import { supabase } from "@/lib/supabase";

function validateEmail(email: string): { ok: boolean; error?: string } {
  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim.endsWith(CREATED_USER_EMAIL_SUFFIX)) {
    return { ok: false, error: `Email must end with ${CREATED_USER_EMAIL_SUFFIX}` };
  }
  if (emailTrim === SUPERADMIN_EMAIL) {
    return { ok: false, error: "Cannot register the same superadmin email again." };
  }
  return { ok: true };
}

export function AdminCreateAccount() {
  const { userEmail } = useAdminAuth();
  const isSuperadmin = (userEmail ?? "").toLowerCase() === SUPERADMIN_EMAIL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSuperadmin) {
    return (
      <>
        <AdminHeader title="Register admin" subtitle="Only the superadmin can register new admins." />
        <div className="mx-auto max-w-2xl p-6">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Only <strong>{SUPERADMIN_EMAIL}</strong> can register new admins. You are signed in as <strong>{userEmail ?? "—"}</strong>.
          </p>
        </div>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!supabase) {
      setMessage({ type: "error", text: "Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env." });
      return;
    }
    const emailTrim = email.trim().toLowerCase();
    const validation = validateEmail(emailTrim);
    if (!validation.ok) {
      setMessage({ type: "error", text: validation.error ?? "Invalid email." });
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setMessage({ type: "error", text: "You must be logged in. Sign out and sign in again." });
        setLoading(false);
        return;
      }
      const baseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
      const url = `${baseUrl}/functions/v1/create-website-user`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
        },
        body: JSON.stringify({
          email: emailTrim,
          password,
          full_name: name.trim() || emailTrim.split("@")[0],
        }),
      });
      const raw = await res.text();
      let body: { error?: string; success?: boolean } = {};
      try {
        if (raw) body = JSON.parse(raw) as { error?: string; success?: boolean };
      } catch {
        /* use empty body */
      }
      if (!res.ok) {
        const serverMsg = body?.error?.trim();
        const hint = res.status === 401 ? " Use the same Supabase project for the site and the Edge Function (see DEPLOY_EDGE_FUNCTION.md)." : "";
        setMessage({
          type: "error",
          text: (serverMsg || `Request failed (${res.status}).`) + hint,
        });
        setLoading(false);
        return;
      }
      if (body?.error) {
        setMessage({ type: "error", text: body.error });
        setLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: `Admin registered: ${emailTrim}. They can log in when ready (no redirect; they are just registered).`,
      });
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create account. Deploy the create-website-user Edge Function if you haven't.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader title="Register admin" subtitle="Register a new admin with an @diafit.com email. They are added as admin and can log in when ready." />
      <div className="p-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
          <div>
            <label htmlFor="create-name" className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="create-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="create-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`username${CREATED_USER_EMAIL_SUFFIX}`}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              autoComplete="off"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Must end with {CREATED_USER_EMAIL_SUFFIX}
            </p>
          </div>
          <div>
            <label htmlFor="create-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--diafit-blue)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--diafit-blue-light)] disabled:opacity-70"
          >
            {loading ? "Registering…" : "Register admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
