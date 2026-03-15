import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useLoginModal } from "@/contexts/LoginModalContext";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
        setMenuOpen(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full px-4 pt-4 transition-transform duration-300 ease-out sm:px-6 sm:pt-5"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        background: "transparent",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3">
        <Link
          to="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="Diafit home"
        >
          <Logo variant="dark" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden flex-1 items-center justify-center gap-1 md:flex md:gap-2">
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

        {/* Desktop login */}
        <div className="hidden shrink-0 items-center gap-2 md:flex md:gap-3">
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-5"
          >
            Login
          </button>
        </div>

        {/* Hamburger button — visible on small screens */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center justify-center rounded-lg p-2 text-slate-700 transition-colors hover:bg-white/30 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mx-4 mt-1 flex flex-col gap-1 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden">
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
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <hr className="my-1 border-slate-200" />
          <button
            type="button"
            onClick={() => {
              openLoginModal();
              setMenuOpen(false);
            }}
            className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}
