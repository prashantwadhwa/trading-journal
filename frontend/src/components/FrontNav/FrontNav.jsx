import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Menu, X } from "lucide-react";

const sectionLinks = [
  { label: "Analytics", href: "#analytics" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

export default function FrontNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isLandingPage = pathname === "/";

  function handleSectionClick(href) {
    setMenuOpen(false);

    if (!isLandingPage) {
      navigate("/");
      requestAnimationFrame(() => {
        document.querySelector(href)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  const sectionClass =
    "block rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:text-white";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#080c14]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
            <TrendingUp size={22} />
          </div>
          <span className="text-xl font-bold text-white">
            Trade<span className="text-emerald-400">Flow</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {sectionLinks.map(({ label, href }) => (
            <a
              key={href}
              href={isLandingPage ? href : `/${href}`}
              onClick={() => handleSectionClick(href)}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            to="/login"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-white/10 p-2 text-white md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="space-y-2 border-t border-white/10 bg-[#0e1522] p-5 md:hidden">
          {sectionLinks.map(({ label, href }) => (
            <a
              key={href}
              href={isLandingPage ? href : `/${href}`}
              onClick={() => handleSectionClick(href)}
              className={sectionClass}
            >
              {label}
            </a>
          ))}

          <div className="border-t border-white/10 pt-3">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className={sectionClass}
            >
              Log in
            </Link>

            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}