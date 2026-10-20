"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountUnleashed } from "./motion";

export function UnleashedExperience({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return mountUnleashed(root.current);
  }, []);
  return <div id="unleashed" ref={root} className={`unleashed ${className}`} data-motion="off">{children}</div>;
}
