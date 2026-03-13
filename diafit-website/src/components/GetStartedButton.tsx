"use client";

import { Link, useLocation } from "react-router-dom";

interface GetStartedButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

function scrollToDownload() {
  const el = document.getElementById("download");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function GetStartedButton({ variant = "primary", className = "" }: GetStartedButtonProps) {
  const location = useLocation();
  const isOnHome = location.pathname === "/";

  const handleClick = (e: React.MouseEvent) => {
    if (isOnHome) {
      e.preventDefault();
      scrollToDownload();
    }
  };

  const linkClass =
    variant === "secondary"
      ? `inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-50 ${className}`
      : `inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 ${className}`;

  return (
    <Link to="/#download" className={linkClass} onClick={handleClick}>
      Get Started
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </Link>
  );
}
