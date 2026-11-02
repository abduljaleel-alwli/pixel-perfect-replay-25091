import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Reveal from "@/components/Reveal";
import majlisImg from "@/assets/project-majlis.jpg";
import archesImg from "@/assets/project-arches.jpg";
import diningImg from "@/assets/project-dining.jpg";
import bedroomImg from "@/assets/project-bedroom.jpg";

type Project = {
  title: string;
  scope: string;
  place: string;
  img: string;
  alt: string;
  w: number;
  h: number;
  ratio: string;
  wrap: string;
  speed: number;
};

const PROJECTS: Project[] = [
  {
    title: "The Majlis",
    scope: "Layered gypsum ceiling · Cove lighting",
    place: "Riyadh",
    img: majlisImg,
    alt: "Grand majlis with an ornate layered gypsum ceiling and arched windows",
    w: 1344,
    h: 960,
    ratio: "aspect-[7/5]",
    wrap: "lg:col-span-7",
    speed: -6,
  },
  {
    title: "Gallery of Arches",
    scope: "Plaster arches · Travertine",
    place: "Jeddah",
    img: archesImg,
    alt: "Corridor of smooth plaster arches with limestone walls",
    w: 1024,
    h: 1280,
    ratio: "aspect-[4/5]",
    wrap: "lg:col-span-4 lg:col-start-9 lg:mt-40",
    speed: 8,
  },
  {
    title: "Charcoal Dining",
    scope: "Limewash walls · Bronze trim",
    place: "Riyadh",
    img: diningImg,
    alt: "Moody dining room with charcoal limewash walls and a coffered ceiling",
    w: 1344,
    h: 960,
    ratio: "aspect-[7/5]",
    wrap: "lg:col-span-6 lg:col-start-2 lg:-mt-24",
    speed: -8,
  },
  {
    title: "The Quiet Suite",
    scope: "Fluted gypsum · Terrazzo",
    place: "AlUla",
    img: bedroomImg,
    alt: "Bedroom with a fluted gypsum feature wall and soft dawn light",
    w: 1024,
    h: 1280,
    ratio: "aspect-[4/5]",
    wrap: "lg:col-span-4 lg:col-start-9 lg:mt-24",
    speed: 6,
  },
];

function Figure({ p, index }: { p: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current || !imgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { yPercent: p.speed },
        {
          yPercent: -p.speed,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      gsap.fromTo(
        ref.current!.querySelector(".img-clip"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [p.speed]);

  return (
    <figure ref={ref} className={`group ${p.wrap}`}>
      <div className={`img-clip relative overflow-hidden ${p.ratio}`}>
        <img
          ref={imgRef}
          src={p.img}
          alt={p.alt}
          loading="lazy"
          width={p.w}
          height={p.h}
          className="h-full w-full scale-[1.25] object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.32]"
        />
        <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/15" />
      </div>
      <figcaption className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-4">
        <div>
          <span className="mr-3 text-xs tracking-[0.3em] text-bronze">0{index + 1}</span>
          <span className="font-display text-2xl">{p.title}</span>
        </div>
        <div className="text-right text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <p>{p.scope}</p>
          <p className="mt-1">{p.place}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Portfolio() {
  return (
    <section id="work" className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 md:mb-28">
          <Reveal>
            <p className="label">Selected work</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
              Rooms we're <em className="text-bronze">proud</em> to sign.
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-16 md:gap-24 lg:grid-cols-12">
          {PROJECTS.map((p, i) => (
            <Figure key={p.title} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
