import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Reveal from "@/components/Reveal";
import gypsumImg from "@/assets/service-gypsum.jpg";
import paintImg from "@/assets/service-paint.jpg";
import tileImg from "@/assets/service-tile.jpg";

const SERVICES = [
  {
    n: "01",
    title: "Gypsum & Ceilings",
    img: gypsumImg,
    alt: "Layered gypsum ceiling with curved coffers and warm cove lighting",
    desc: "Coffered and layered ceilings, coves, fluted panels, arches and bespoke mouldings — designed with the light, not around it.",
    tags: ["Coffered ceilings", "Cove lighting", "Fluted panels", "Ornamental mouldings"],
  },
  {
    n: "02",
    title: "Paint & Wall Finishes",
    img: paintImg,
    alt: "Hand-applied limewash wall finish in warm terracotta tones",
    desc: "Mineral and lime finishes, Venetian plaster, precise colour matching and wall preparation that makes the final coat look effortless.",
    tags: ["Limewash", "Venetian plaster", "Colour consultation", "Spray & hand finishes"],
  },
  {
    n: "03",
    title: "Tile & Stone",
    img: tileImg,
    alt: "Bathroom with book-matched marble slabs and brass fixtures",
    desc: "Marble, porcelain and terrazzo laid to the millimetre — book-matched slabs, seamless thresholds and floors that stay level for decades.",
    tags: ["Book-matched marble", "Large-format porcelain", "Terrazzo", "Underfloor preparation"],
  },
];

function ServiceRow({ s, flip }: { s: (typeof SERVICES)[number]; flip: boolean }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !imgRef.current || !rowRef.current) return;
    const tween = gsap.fromTo(
      imgRef.current,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: rowRef.current, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={rowRef} className={`grid items-center gap-10 lg:grid-cols-12 lg:gap-16 ${flip ? "" : ""}`}>
      <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <Reveal y={60}>
          <div className="img-frame group relative aspect-[4/5] overflow-hidden">
            <img
              ref={imgRef}
              src={s.img}
              alt={s.alt}
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full scale-[1.2] object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.28]"
            />
            <span className="absolute left-5 top-5 font-display text-5xl text-hero-ink/90">{s.n}</span>
          </div>
        </Reveal>
      </div>
      <div className={`lg:col-span-7 ${flip ? "lg:order-1 lg:text-right" : ""}`}>
        <Reveal>
          <h3 className="font-display text-4xl leading-[1.02] md:text-6xl">{s.title}</h3>
        </Reveal>
        <Reveal delay={0.12}>
          <p className={`mt-6 max-w-lg text-base leading-relaxed text-muted-foreground ${flip ? "lg:ml-auto" : ""}`}>
            {s.desc}
          </p>
        </Reveal>
        <Reveal delay={0.22} stagger={0.06}>
          <div className={`mt-8 flex flex-wrap gap-3 ${flip ? "lg:justify-end" : ""}`}>
            {s.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 flex flex-wrap items-end justify-between gap-6 md:mb-28">
          <div>
            <Reveal>
              <p className="label">What we do</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">
                Three crafts, <em className="text-bronze">one</em> standard.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Every finish in a room touches our three trades. Keeping them under one roof is how the
              details line up.
            </p>
          </Reveal>
        </div>
        <div className="flex flex-col gap-24 md:gap-36">
          {SERVICES.map((s, i) => (
            <ServiceRow key={s.n} s={s} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
