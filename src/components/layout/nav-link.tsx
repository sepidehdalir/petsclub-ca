"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onNavigate?: () => void;
}

/**
 * Returns true when `pathname` is `href` or a descendant of it.
 *
 * Exported for unit testing: "current section" highlighting is easy to get
 * subtly wrong (`/cats` must not light up for `/catsomething`).
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigation link that marks the current section with `aria-current`.
 *
 * This is the only reason the navigation is a Client Component: the active
 * state depends on the URL, and communicating it to assistive technology is
 * worth the small hydration cost.
 */
export function NavLink({
  href,
  children,
  className,
  activeClassName,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
