"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout-primitives";

/**
 * Route-level error boundary.
 *
 * Renders a generic recovery screen. The error message and stack are never
 * shown to the visitor — in production Next.js replaces the message with a
 * digest anyway, and printing internals would leak implementation detail for
 * no user benefit. The digest is surfaced only as a support reference.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side logging is the real destination for this; console.error is
    // the reporting hook a monitoring integration replaces later.
    console.error("Unhandled route error", error);
  }, [error]);

  return (
    <Section spacing="spacious">
      <Container width="prose">
        <p className="text-sm font-semibold uppercase tracking-wider text-clay-700">
          Something went wrong
        </p>

        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          This page could not be loaded
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
          The problem is on our side, not yours. Try again — if it keeps happening, let us know
          and we will look into it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Back to the homepage
          </ButtonLink>
        </div>

        {error.digest ? (
          <p className="mt-8 text-sm text-foreground-subtle">
            Reference: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
