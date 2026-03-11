"use client";

import { useLoginModal } from "@/contexts/LoginModalContext";

interface GetStartedButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

export function GetStartedButton({ variant = "primary", className = "" }: GetStartedButtonProps) {
  const { openLoginModal } = useLoginModal();

  if (variant === "secondary") {
    return (
      <button
        type="button"
        onClick={openLoginModal}
        className={`inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-violet-700 shadow-sm transition-colors hover:bg-violet-50 ${className}`}
      >
        Get Started
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openLoginModal}
      className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 ${className}`}
    >
      Get Started
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  );
}
