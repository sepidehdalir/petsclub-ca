import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { Media } from "@/components/ui/media";
import type { BreadcrumbItem } from "@/lib/seo/structured-data";
import { cn } from "@/lib/utils/cn";
import type { MediaAsset } from "@/media/manifest";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  /** Breadcrumb trail excluding "Home". Omit on top-level pages. */
  breadcrumbs?: readonly BreadcrumbItem[];
  /** Actions rendered under the description. */
  actions?: ReactNode;
  /**
   * Section-front photograph. Given one, the header becomes a 7/5 split at
   * `lg` — the picture carries real weight beside the headline instead of
   * sitting under it as a banner. Without one the header is unchanged.
   */
  media?: {
    asset: MediaAsset;
    /** Object-position utility, for a subject that is off-centre. */
    position?: string;
  };
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
  media,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      {/* Tighter at the top than the bottom, and tighter still on a phone.
          The site header already sits directly above, so a symmetric pad
          reads as a gap between two bars rather than as the head of a page. */}
      <Container className="pb-10 pt-5 sm:pb-14 sm:pt-9">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} className="mb-4 sm:mb-6" />
        ) : null}

        <div
          className={cn(
            media && "grid items-center gap-7 lg:grid-cols-12 lg:gap-12",
          )}
        >
          <div className={cn("space-y-3 sm:space-y-4", media ? "lg:col-span-7" : "max-w-3xl")}>
            {eyebrow ? (
              <p className="text-label uppercase text-pine-700">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="text-display-3 text-foreground sm:text-display-2">
              {title}
            </h1>

            {description ? (
              // Body size on a phone, stepping up only once there is room for
              // it. `text-body-lg` under the display face is a lot of weight
              // at 390px, and capping the measure keeps the intro to the two
              // or three lines it is meant to be rather than a paragraph.
              <p className="max-w-[54ch] text-body text-foreground-muted sm:text-body-lg">
                {description}
              </p>
            ) : null}

            {actions ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">{actions}</div>
            ) : null}
          </div>

          {media ? (
            <Media
              className="lg:col-span-5"
              asset={media.asset}
              position={media.position}
              ratio="landscape"
              // The section front is the one image above the fold on these
              // pages, so it is the one image worth pre-loading.
              priority
              showCredit
              sizes="(min-width: 1024px) 40vw, 92vw"
            />
          ) : null}
        </div>
      </Container>
    </header>
  );
}
