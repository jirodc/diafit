"use client";

import { useCallback, useEffect, useState } from "react";

type LoginRole = "doctor" | "admin";

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

function DoctorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [role, setRole] = useState<LoginRole>("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // TODO: connect to your auth backend
      console.log("Login", { role, email, password: "***", rememberMe });
      onClose();
    },
    [role, email, password, rememberMe, onClose]
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

  const roleLabel = role === "doctor" ? "Doctor" : "Admin";

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
            Welcome Back
          </h2>
          <p className="mt-1 text-slate-400">Log in to your Diafit account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300">Login As</label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors ${
                  role === "doctor"
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-slate-600 bg-white hover:border-slate-500"
                }`}
              >
                <DoctorIcon
                  className={`h-8 w-8 ${role === "doctor" ? "text-blue-400" : "text-slate-500"}`}
                />
                <span
                  className={`text-sm font-medium ${role === "doctor" ? "text-slate-100" : "text-slate-600"}`}
                >
                  Doctor
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors ${
                  role === "admin"
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-slate-600 bg-white hover:border-slate-500"
                }`}
              >
                <AdminIcon
                  className={`h-8 w-8 ${role === "admin" ? "text-blue-400" : "text-slate-500"}`}
                />
                <span
                  className={`text-sm font-medium ${role === "admin" ? "text-slate-100" : "text-slate-600"}`}
                >
                  Admin
                </span>
              </button>
            </div>
          </div>

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
            Log In as {roleLabel}
          </button>
        </form>

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
