import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { Wordmark } from "@/components/layout/wordmark";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout-primitives";
import { primaryNavigation } from "@/config/navigation";
import { AuthNav } from "@/features/auth/components/auth-nav";

/**
 * Global application header.
 *
 * A Server Component: only the pieces that genuinely need the browser — the
 * active-link state, the drawer and the auth slot — are Client Components,
 * so the header ships a minimal amount of JavaScript.
 *
 * Uses the default Container width so the wordmark aligns with page
 * content on every route — a wider shell than the body reads as a mistake.
 *
 * The full primary navigation appears at `xl`. Eight top-level destinations
 * plus a call to action do not fit honestly below that width, so smaller
 * screens get the drawer rather than a cramped, horizontally scrolling row.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-md"
            aria-label="PetsClub.ca — home"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-x-5">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    className="rounded-md py-2 text-[0.9375rem] font-medium text-foreground-muted transition-colors hover:text-pine-700"
                    activeClassName="text-pine-800 font-semibold"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/search"
              aria-label="Search PetsClub"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </Link>

            <ButtonLink href="/community" size="sm" className="hidden lg:inline-flex">
              Ask the Community
            </ButtonLink>

            <AuthNav />

            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
