import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

const Scene = lazy(() => import("@/components/hero/Scene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuqoosh — Gypsum, Paint & Tile Craftsmanship" },
      { name: "description", content: "Architectural gypsum ceilings, refined painting and precision tiling for premium interiors." },
      { property: "og:title", content: "Nuqoosh — Gypsum, Paint & Tile Craftsmanship" },
      { property: "og:description", content: "Architectural gypsum ceilings, refined painting and precision tiling for premium interiors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = ["Work", "Services", "Studio", "Contact"];

const SERVICES = [
  { n: "01", t: "Gypsum", d: "Coffered ceilings, coves, fluted panels and bespoke mouldings shaped by hand." },
  { n: "02", t: "Paint", d: "Mineral and lime finishes, precise colour matching, flawless wall preparation." },
  { n: "03", t: "Tile", d: "Stone, porcelain and terrazzo laid to the millimetre, floor to ceiling." },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Index() {
  const [ready, setReady] = useState(false);
  const [gl, setGl] = useState(true);
  const [active, setActive] = useState("Work");
  useEffect(() => setGl(hasWebGL()), []);

  return (
    <main className="bg-background text-foreground">
      <section className="relative h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0 hero-fallback" data-scene-ready={ready ? "" : undefined}>
          {gl && (
            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${ready ? "opacity-100" : "opacity-0"}`}>
                  <Scene onReady={() => setReady(true)} />
                </div>
              </Suspense>
            </ClientOnly>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 hero-vignette" />

        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <a href="/" className="font-display text-2xl tracking-tight text-hero-ink">
            Nuqoosh<span className="text-hero-accent">.</span>
          </a>
          <nav className="hidden gap-10 md:flex">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} onClick={() => setActive(n)} data-active={active === n} className="nav-link">
                {n}
              </a>
            ))}
          </nav>
          <a href="#contact" className="text-xs uppercase tracking-[0.25em] text-hero-ink/80 transition-colors hover:text-hero-accent">
            Enquire
          </a>
        </header>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-12 md:px-12 md:pb-16">
          <p className="reveal text-xs uppercase tracking-[0.35em] text-hero-ink/70">Gypsum · Paint · Tile</p>
          <h1 className="reveal reveal-2 mt-4 max-w-3xl font-display text-5xl leading-[0.95] text-hero-ink md:text-7xl lg:text-8xl">
            Interiors, <em className="text-hero-accent">finished</em> by hand.
          </h1>
          <p className="reveal reveal-3 mt-5 max-w-md text-sm leading-relaxed text-hero-ink/75 md:text-base">
            Architectural ceilings, considered colour and precision tiling for spaces that are meant to last.
          </p>
          <div className="reveal reveal-4 pointer-events-auto mt-8 flex flex-wrap gap-4">
            <a href="#work" className="btn-hero">Explore our work</a>
            <a href="#services" className="btn-ghost-hero">Our services</a>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 z-10 hidden text-[10px] uppercase tracking-[0.3em] text-hero-ink/50 md:block">
          Scroll to enter
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-6 py-28 md:px-12">
        <h2 className="font-display text-4xl md:text-5xl">Three crafts, one standard.</h2>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.n} className="border-t border-border pt-6">
              <span className="text-xs tracking-[0.3em] text-muted-foreground">{s.n}</span>
              <h3 className="mt-3 font-display text-3xl">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer id="contact" className="border-t border-border px-6 py-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Nuqoosh Interiors · Riyadh
      </footer>
    </main>
  );
}
