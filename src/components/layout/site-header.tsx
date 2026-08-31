import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { SearchIcon } from "@/components/layout/nav-icons";
import { Wordmark } from "@/components/layout/wordmark";
import { Container } from "@/components/ui/layout-primitives";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { AuthNav } from "@/features/auth/components/auth-nav";

/**
 * Global masthead.
 *
 * A Server Component. Only the three pieces that genuinely need the browser —
 * the active-section state, the drawer and the auth slot — are Client
 * Components, so the header ships very little JavaScript for something on
 * every page.
 *
 * The layout is a masthead, not a toolbar: the wordmark anchors the left, the
 * six editorial sections sit in the middle as plain type, and the things you
 * *do* rather than *read* — search, community, account — are grouped at the
 * right behind a hairline. Nothing is a pill, nothing casts a shadow, and the
 * only colour is the rule under the section you are currently in.
 *
 * The full row appears at `lg`. Six sections plus the utility group fit
 * honestly at 1024px; below that the drawer is the more usable answer than a
 * cramped or scrolling row.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-xs"
            aria-label={`${siteConfig.name} — home`}
          >
            <Wordmark className="text-xl lg:text-[1.375rem]" />
          </Link>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-x-7">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    // The rule sits under the word rather than at the foot of
                    // the header, so it reads as an editorial underline rather
                    // than a browser tab. Colour and rule carry the state; the
                    // weight never changes, so nothing reflows on navigation.
                    className="inline-flex border-b-2 border-transparent pb-0.5 text-ui text-foreground-muted transition-colors hover:text-foreground"
                    activeClassName="border-pine-700 text-foreground"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 lg:gap-3">
            <NavLink
              href="/community"
              className="hidden text-ui text-foreground-muted transition-colors hover:text-foreground lg:inline-flex"
              activeClassName="text-foreground"
            >
              {secondaryNavigation[0]?.label}
            </NavLink>

            <span aria-hidden="true" className="hidden h-5 w-px bg-border lg:block" />

            <Link
              href="/search"
              aria-label={`Search ${siteConfig.name}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xs text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <SearchIcon />
            </Link>

            <AuthNav />

            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
