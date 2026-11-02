import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Reveal from "@/components/Reveal";
import aboutImg from "@/assets/about-interior.jpg";

export default function About() {
  const imgRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !imgRef.current || !sectionRef.current) return;
    const tween = gsap.fromTo(
      imgRef.current,
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section id="studio" ref={sectionRef} className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label">The Studio</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] md:text-6xl">
              A finishing atelier, <em className="text-bronze">obsessed</em> with the last five percent.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Nuqoosh is a Riyadh-based finishing studio working across gypsum, paint and tile. We take
              interiors from structure to atmosphere — the ceiling that holds the light, the wall that
              carries the colour, the floor that grounds the room.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Every project is handled by our own craftsmen, from first site survey to final handover,
              so the standard we promise is the standard we deliver.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <a href="#work" className="link-line mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em]">
              See the work <span aria-hidden>→</span>
            </a>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal y={60}>
            <div className="img-frame relative aspect-[4/3] overflow-hidden">
              <img
                ref={imgRef}
                src={aboutImg}
                alt="Living room with a layered coffered gypsum ceiling and warm cove lighting"
                loading="lazy"
                width={1344}
                height={1024}
                className="h-full w-full scale-[1.25] object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span>Gypsum · Paint · Tile</span>
              <span>Riyadh, Saudi Arabia</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
