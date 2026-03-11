import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-[var(--diafit-footer-bg)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="dark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Your AI-powered companion for diabetes management and healthy
              living.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/#features" className="text-sm text-slate-300 transition-colors hover:text-white">Features</Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-sm text-slate-300 transition-colors hover:text-white">Pricing</Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-sm text-slate-300 transition-colors hover:text-white">How it Works</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-sm text-slate-300 transition-colors hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-slate-300 transition-colors hover:text-white">Careers</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-300 transition-colors hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-slate-300 transition-colors hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-300 transition-colors hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link to="/compliance" className="text-sm text-slate-300 transition-colors hover:text-white">Cookie Compliance</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          © 2024 Diafit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
