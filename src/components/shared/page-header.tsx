import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import type { BreadcrumbItem } from "@/lib/seo/structured-data";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  /** Breadcrumb trail excluding "Home". Omit on top-level pages. */
  breadcrumbs?: readonly BreadcrumbItem[];
  /** Actions rendered under the description. */
  actions?: ReactNode;
}

/**
 * Standard editorial page header.
 *
 * Every section page uses this so the `h1`, breadcrumb trail and intro copy
 * are structurally identical across the site — one heading level 1 per page,
 * in a consistent position in the document outline.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <Container className="py-10 sm:py-14">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
        ) : null}

        <div className="max-w-3xl space-y-4">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-pine-700">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>

          {description ? (
            <p className="text-lg leading-relaxed text-foreground-muted">{description}</p>
          ) : null}

          {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
        </div>
      </Container>
    </header>
  );
}
