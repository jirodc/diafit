import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { GetStartedButton } from "@/components/GetStartedButton";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/#services", label: "Services" },
  { to: "/about", label: "About Us" },
  { to: "/about#faqs", label: "FAQs" },
] as const;

export function Header() {
  const { openLoginModal } = useLoginModal();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-transparent px-4 pt-4 transition-transform duration-300 ease-out sm:px-6 sm:pt-5"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-3 sm:px-6 sm:py-3">
        <Link
          to="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="Diafit home"
        >
          <Logo variant="dark" />
        </Link>
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {NAV_LINKS.map(({ to, label }) => {
            const [path, hash] = to.split("#");
            const currentPath = path || "/";
            const currentHash = hash ? `#${hash}` : "";
            const isActive =
              location.pathname === currentPath && (hash ? location.hash === currentHash : !location.hash);
            return (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => openLoginModal({ mode: "signup" })}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-5"
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-5"
          >
            Login
          </button>
          <GetStartedButton className="hidden rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 sm:inline-flex sm:px-5" />
        </div>
      </div>
    </nav>
  );
}
