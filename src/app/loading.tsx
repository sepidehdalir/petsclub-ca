import { Container, Section } from "@/components/ui/layout-primitives";
import { LoadingState } from "@/components/ui/states";

/**
 * Root loading UI, shown while a route segment streams in.
 *
 * The skeleton mirrors the standard page-header-plus-content shape so the
 * transition does not shift layout when the real content arrives.
 */
export default function Loading() {
  return (
    <Section spacing="compact">
      <Container>
        <div className="space-y-4">
          <div
            aria-hidden="true"
            className="h-8 w-2/3 max-w-md animate-pulse rounded-md bg-surface-muted"
          />
          <div
            aria-hidden="true"
            className="h-5 w-full max-w-2xl animate-pulse rounded-md bg-surface-muted"
          />
        </div>

        <LoadingState label="Loading page" className="mt-10" />
      </Container>
    </Section>
  );
}
