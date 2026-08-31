import type { ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Container, Section } from "@/components/ui/layout-primitives";

export interface PolicyPageProps {
  title: string;
  description: string;
  path: string;
  /** Set for pages that still require review by a qualified professional. */
  pendingReview?: "legal" | "editorial" | null;
  children: ReactNode;
}

/**
 * Layout for company and policy pages.
 *
 * Pages that will eventually carry legal weight render an explicit
 * "pending review" banner rather than plausible-looking boilerplate. Publishing
 * an invented privacy policy or terms of use would be worse than publishing an
 * honest placeholder: a visitor could reasonably rely on it.
 */
export function PolicyPage({
  title,
  description,
  path,
  pendingReview = null,
  children,
}: PolicyPageProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: title, path }]}
      />

      <Section spacing="compact">
        <Container width="prose">
          {pendingReview ? (
            <div
              role="note"
              className="mb-8 rounded-card border border-clay-200 bg-clay-50 px-5 py-4"
            >
              <h2 className="font-sans text-body-sm font-semibold text-clay-700">
                Draft — pending {pendingReview === "legal" ? "legal" : "editorial"} review
              </h2>
              <p className="mt-1.5 text-body-sm text-clay-700/90">
                {pendingReview === "legal"
                  ? "This page describes our intended approach. It has not been reviewed by a lawyer and is not yet a binding legal document. The final version will be published before The Pet Club accepts public sign-ups."
                  : "This page describes our intended approach and will be finalised before we publish our first guide."}
              </p>
            </div>
          ) : null}

          {/* Long-form rules live in `globals.css` beside the type scale they
              consume, not as arbitrary variants here. The article template is
              the second consumer this is shaped for. */}
          <div className="prose">{children}</div>
        </Container>
      </Section>
    </>
  );
}
