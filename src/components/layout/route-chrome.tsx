"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The immersive homepage supplies its own masthead and footer. Server-rendered
 * editorial chrome remains unchanged on every other route. */
export function RouteChrome({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? null : children;
}
