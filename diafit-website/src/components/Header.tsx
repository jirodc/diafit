"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useLoginModal } from "@/contexts/LoginModalContext";

export function Header() {
  const { openLoginModal } = useLoginModal();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Diafit home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-8" aria-label="Main navigation">
          <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            About Us
          </Link>
          <button
            type="button"
            onClick={openLoginModal}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Log In
          </button>
        </nav>
      </div>
    </header>
  );
}
