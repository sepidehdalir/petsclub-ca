"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/** One visual identity from the immersive homepage into every reading flow. */
export function SiteFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (path === "/" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("club-arrived");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    root.current?.querySelectorAll("main section > div, .club-article > header").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [path]);
  return <div ref={root} className={path === "/" ? "site-frame" : "site-frame site-interior"} data-section={path.split("/")[1] || "home"}>{children}</div>;
}
