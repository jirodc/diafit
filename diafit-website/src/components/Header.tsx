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
  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5">
      <div className="flex w-full max-w-6xl items-center gap-4 sm:gap-6">
        <Link
          to="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="Diafit home"
        >
          <Logo variant={isHome || isAbout ? "dark" : "light"} />
        </Link>
        {/* Centered nav */}
        <div
          className="flex flex-1 items-center justify-center rounded-2xl bg-transparent px-4 py-2.5 sm:px-5 sm:py-3"
          aria-label="Main navigation"
        >
          <nav className="flex items-center gap-4 sm:gap-6" aria-label="Main navigation">
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
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Right: Log In + Get Started */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openLoginModal}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
              isHome
                ? "border-white text-white hover:bg-white/15"
                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            Log In
          </button>
          <GetStartedButton
            className={
              isHome
                ? "hidden bg-white text-blue-600 hover:bg-white/90 sm:inline-flex"
                : "hidden sm:inline-flex"
            }
          />
        </div>
      </div>
    </header>
  );
}
