import type { ReactNode } from "react";

import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { ArticleCard } from "@/features/editorial/components/article-card";
import { publishedArticlesForSurface } from "@/features/editorial/published-discovery";
import { cn } from "@/lib/utils/cn";

export interface ArticleListSectionProps {
  /** The surface being rendered, e.g. `/dogs` or `/guides`. */
  surfacePath: string;
  /** Required: the parent `Section` is labelled by this heading. */
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "canvas" | "muted";
  /** Optional short preview; applied after filtering out in-review articles. */
  limit?: number;
  /** A contextual route to the full guide library, for preview surfaces. */
  action?: ReactNode;
}

/**
 * The published articles belonging to one surface.
 *
 * Renders nothing at all when the surface has no published articles. Drafts
 * remain available to the editorial workflow but are never advertised here
 * as finished guides. Publication and indexability stay separate: a published
 * public-noindex guide is still a legitimate destination for a reader.
 */
export function ArticleListSection({
  surfacePath,
  id,
  eyebrow,
  title,
  description,
  tone = "canvas",
  limit,
  action,
}: ArticleListSectionProps) {
  const surfaceArticles = publishedArticlesForSurface(surfacePath, limit);

  if (surfaceArticles.length === 0) {
    return null;
  }

  // One article opens the section as a lead; the rest fall into the grid.
  // With exactly two, neither is promoted — a lead plus a single orphan below
  // it reads as a mistake, where a pair reads as a pair.
  const promotesLead = surfaceArticles.length !== 2;
  const lead = promotesLead ? surfaceArticles[0] : undefined;
  const rest = promotesLead ? surfaceArticles.slice(1) : surfaceArticles;

  return (
    <Section tone={tone} aria-labelledby={id}>
      <Container>
        <SectionHeading
          id={id}
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={action}
        />

        {lead ? (
          <ArticleCard
            article={lead}
            variant="lead"
            headingLevel="h3"
            className="mt-8"
            sizes="(min-width: 1152px) 628px, (min-width: 768px) 56vw, 92vw"
          />
        ) : null}

        {/* Two up rather than three: these cards carry a photograph, a deck and
            a headline set at reading size, and a third column starves all
            three. Generous gaps because the cards have no borders — the white
            space is what separates them. */}
        {rest.length > 0 ? (
          <ul
            className={cn(
              "grid gap-10 sm:grid-cols-2 lg:gap-x-12",
              lead ? "mt-12 border-t border-border pt-10" : "mt-8",
            )}
          >
            {rest.map((article) => (
              <li key={article.slug} className="flex">
                <ArticleCard
                  article={article}
                  className="w-full"
                  sizes="(min-width: 1152px) 528px, (min-width: 640px) 46vw, 92vw"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
