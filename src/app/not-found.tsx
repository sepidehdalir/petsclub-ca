import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout-primitives";
import { headerNavigation } from "@/config/navigation";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Page not found",
  description: "The page you were looking for does not exist on The Pet Club.",
  noIndex: true,
});

/**
 * 404 page.
 *
 * Useful rather than decorative: a dead-end 404 loses the visit, so this one
 * offers the primary destinations and the community index as recovery paths.
 */
export default function NotFound() {
  return (
    <Section spacing="spacious">
      <Container width="prose">
        <p className="text-label-lg uppercase text-pine-700">
          Error 404
        </p>

        <h1 className="mt-4 text-display-3 text-foreground sm:text-display-2">
          We could not find that page
        </h1>

        <p className="mt-4 text-body-lg text-foreground-muted">
          The link may be out of date, or the page may have moved. Here is where most people go
          next.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">Back to the homepage</ButtonLink>
          <ButtonLink href="/community" variant="secondary">
            Browse the community
          </ButtonLink>
        </div>

        <nav aria-label="Popular destinations" className="mt-12 border-t border-border pt-8">
          <h2 className="font-sans text-label-lg uppercase text-foreground-muted">
            Popular destinations
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {headerNavigation.map((item) => (
              <li key={item.href}>
                <ButtonLink href={item.href} variant="link" size="sm" className="h-auto px-0">
                  {item.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </Section>
  );
}
