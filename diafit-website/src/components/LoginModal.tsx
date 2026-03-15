"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_STORAGE_KEY,
  checkAdminCredentials,
  registerAdminAccount,
  ADMIN_EMAIL_SUFFIX,
} from "@/contexts/AdminAuthContext";

function ModalLogo() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500">
      <svg
        width="28"
        height="20"
        viewBox="0 0 28 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        {/* ECG / heartbeat waveform */}
        <path
          d="M2 10h4l2-4 2 8 4-12 4 8 4-4h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

type ModalMode = "login" | "signup";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, open directly in signup mode (e.g. from "Create account" button). */
  initialMode?: ModalMode;
}

export function LoginModal({ isOpen, onClose, initialMode = "login" }: LoginModalProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialMode === "login") setSignupSuccess(null);
    }
  }, [isOpen, initialMode]);

  const handleLoginSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const emailTrim = email.trim().toLowerCase();
      if (checkAdminCredentials(emailTrim, password)) {
        try {
          sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
        } catch {
          // ignore
        }
        onClose();
        navigate("/admin");
        return;
      }
      // Patient/normal login: @gmail.com and other platforms stay as patients; no role change
      // TODO: connect to your auth backend for non-admin users
      console.log("Login", { email, password: "***", rememberMe });
      onClose();
    },
    [email, password, rememberMe, onClose, navigate]
  );

  const handleSignupSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const emailTrim = email.trim().toLowerCase();
      if (emailTrim.endsWith(ADMIN_EMAIL_SUFFIX)) {
        const ok = registerAdminAccount(emailTrim, password);
        if (ok) {
          try {
            sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
          } catch {
            // ignore
          }
          onClose();
          navigate("/admin");
          return;
        }
        setSignupSuccess("This admin email is already registered. Please log in.");
        return;
      }
      // Patient signup: website only; does not change role of patients who registered on mobile
      // TODO: connect to your auth backend
      setSignupSuccess("Account created. You can log in now.");
      setMode("login");
      setName("");
      setEmail("");
      setPassword("");
    },
    [email, password, name, onClose, navigate]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close modal"
      />

      {/* Modal panel - dark theme */}
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <ModalLogo />
          <h2 id="login-modal-title" className="mt-6 text-2xl font-bold text-slate-100">
            {mode === "login" ? "Welcome Back" : "Create account"}
          </h2>
          <p className="mt-1 text-slate-400">
            {mode === "login"
              ? "Log in to your Diafit account"
              : "Use an @admin.com email to create an admin account"}
          </p>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            {signupSuccess && (
              <div className="rounded-lg bg-emerald-500/20 px-4 py-3 text-sm text-emerald-200">
                {signupSuccess}
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Log In
            </button>

            <p className="text-center text-sm text-slate-400">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                Create account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="mt-8 space-y-5">
            {signupSuccess && (
              <div className="rounded-lg bg-emerald-500/20 px-4 py-3 text-sm text-emerald-200">
                {signupSuccess}
              </div>
            )}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-slate-300">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@admin.com or you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-slate-500">
                Use @admin.com to create an admin account. Other emails create a patient account.
              </p>
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Create account
            </button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
              >
                Log in
              </button>
            </p>
          </form>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
