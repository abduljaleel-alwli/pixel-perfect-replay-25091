import { useEffect, useRef, type ReactNode } from "react";
import { gsap, EASE_EXPO, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Animate each direct child with a stagger instead of the block itself. */
  stagger?: number;
  as?: "div" | "span" | "p" | "h2" | "h3";
};

/** Scroll-triggered entrance: fades and rises into place once, when it enters the viewport. */
export default function Reveal({ children, className, delay = 0, y = 36, stagger, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const targets = stagger ? Array.from(el.children) : el;
    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 1.3,
        delay,
        ease: EASE_EXPO,
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y, stagger]);

  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
