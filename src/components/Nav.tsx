import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { id: "studio", label: "Studio" },
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "craft", label: "Craft" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <header className={`nav-bar ${scrolled ? "nav-bar-solid" : ""}`}>
        <a href="#top" className="font-display text-2xl tracking-tight">
          Nuqoosh<span className="text-bronze">.</span>
        </a>
        <nav className="hidden items-center gap-9 lg:flex">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} data-active={active === l.id} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href="#contact" className="nav-cta hidden lg:inline-flex">
            Enquire
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`mobile-menu ${open ? "mobile-menu-open" : ""}`} aria-hidden={!open}>
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-display text-2xl text-hero-ink">
            Nuqoosh<span className="text-bronze">.</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center text-hero-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
          {LINKS.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setOpen(false)}
              className="mobile-menu-link"
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            >
              <span className="mr-4 text-xs tracking-[0.3em] text-bronze">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="px-8 pb-10 text-xs uppercase tracking-[0.3em] text-hero-ink/50">
          Gypsum · Paint · Tile — Riyadh
        </p>
      </div>
    </>
  );
}
