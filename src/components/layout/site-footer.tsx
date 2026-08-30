import Link from "next/link";

import { Wordmark } from "@/components/layout/wordmark";
import { Container } from "@/components/ui/layout-primitives";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/**
 * Global footer.
 *
 * Rendered from `footerNavigation` so link groups stay in one place. The year
 * is intentionally static rather than `new Date()`: a dynamic year in a
 * statically rendered layout produces a stale value once the build ages, and
 * silently makes the whole tree non-deterministic.
 */
const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2.4fr]">
          <div className="max-w-xs space-y-3">
            <Link href="/" className="inline-flex rounded-md" aria-label="ThePetClub.ca — home">
              <Wordmark />
            </Link>
            <p className="text-sm leading-relaxed text-foreground-muted">
              {siteConfig.tagline} A community and information platform for Canadian pet
              parents.
            </p>
          </div>

          <nav aria-label="Footer">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {footerNavigation.map((group) => (
                <div key={group.title}>
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">
                    {group.title}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-foreground-muted transition-colors hover:text-pine-700 hover:underline"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-foreground-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {COPYRIGHT_YEAR} {siteConfig.legalName}. All rights reserved.
          </p>
          <p>
            The Pet Club publishes general pet information and community discussion. It is not a
            substitute for advice from a licensed veterinarian.
          </p>
        </div>
      </Container>
    </footer>
  );
}
