import Link from "next/link";

import { articlePath } from "@/features/editorial/articles";
import type { ResolvedSection } from "@/features/puppy/model";
import { cn } from "@/lib/utils/cn";

export interface StageSectionProps {
  section: ResolvedSection;
  /** The first section renders open; the rest start collapsed on a phone. */
  defaultOpen?: boolean;
}

function Paragraphs({ body, className }: { body: readonly string[]; className?: string }) {
  return (
    <>
      {body.map((paragraph) => (
        <p key={paragraph} className={cn("text-body sm:text-body-lg text-foreground-reading", className)}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

/**
 * One section of a stage, with its resolved modifier blocks.
 *
 * ## Why `<details>` rather than state
 *
 * The whole page is server-rendered, and a native disclosure gives keyboard
 * support, find-in-page and the open/closed state for free — with no client
 * bundle at all. `open` on desktop is handled in CSS via the `sm:` variants
 * rather than JavaScript, so the page is fully readable before hydration and
 * without it.
 *
 * ## How a modifier is shown
 *
 * Each layer gets a visually distinct block rather than being blended into the
 * prose, because a reader should be able to tell which part of this is
 * universal and which is about *their* puppy, in *their* province. A province
 * block that is legal rather than advisory is marked as such — the distinction
 * between "the law here requires" and "veterinarians recommend" is one this
 * publication has been careful about everywhere else.
 */
export function StageSection({ section, defaultOpen = false }: StageSectionProps) {
  const isCaution = section.tone === "caution";

  return (
    <details
      open={defaultOpen}
      className={cn(
        "group border-t border-border py-5 sm:py-6",
        // Every section reads as expanded from `sm` up: on a desktop the
        // disclosure is a nuisance, and the summary marker is hidden to
        // match. That override is CSS, not markup, and it cannot be written
        // as a utility — see `.stage-disclosure` in `globals.css`.
        "stage-disclosure",
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-baseline gap-3",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <div className="flex-1">
          <h2
            className={cn(
              "text-title-3 sm:text-title-2",
              isCaution ? "text-clay-700" : "text-foreground",
            )}
          >
            {section.title}
          </h2>
          <p className="mt-1 text-body-sm text-foreground-muted group-open:hidden sm:group-open:block">
            {section.summary}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "mt-1 shrink-0 text-foreground-subtle transition-transform",
            "group-open:rotate-180 sm:hidden",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>

      <div
        className={cn(
          "mt-4 space-y-4",
          isCaution && "rounded-card border border-clay-200 bg-clay-50 p-5 sm:p-6",
        )}
      >
        <Paragraphs body={section.body} />

        {section.points && section.points.length > 0 ? (
          <ul className="space-y-2.5">
            {section.points.map((point) => (
              <li
                key={point}
                className="relative pl-6 text-body text-foreground-reading sm:text-body-lg"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-1 top-[0.65em] h-1.5 w-1.5 rounded-full bg-pine-500"
                />
                {point}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Size group — the primary modifier, and the one most readers see. */}
        {section.sizeGroupBlock ? (
          <div className="border-l-2 border-pine-200 pl-4">
            <p className="font-sans text-label uppercase text-pine-700">For this size of dog</p>
            <div className="mt-2 space-y-3">
              <Paragraphs body={section.sizeGroupBlock.body} />
            </div>
          </div>
        ) : null}

        {section.breedBlock ? (
          <div className="border-l-2 border-pine-200 pl-4">
            <p className="font-sans text-label uppercase text-pine-700">For this breed</p>
            <div className="mt-2 space-y-3">
              <Paragraphs body={section.breedBlock.body} />
            </div>
          </div>
        ) : null}

        {/* Province. `legal` is visually separated from `guidance` on purpose. */}
        {section.provinceBlocks.map((block) => (
          <div
            key={block.heading}
            className={cn(
              "rounded-card border p-4 sm:p-5",
              block.kind === "legal"
                ? "border-clay-200 bg-clay-50"
                : "border-border bg-surface-muted",
            )}
          >
            <p
              className={cn(
                "font-sans text-label uppercase",
                block.kind === "legal" ? "text-clay-700" : "text-foreground-subtle",
              )}
            >
              {block.kind === "legal" ? "Legal requirement where you are" : "Where you are"}
            </p>
            <h3 className="mt-2 text-title-4 text-foreground">{block.heading}</h3>
            <div className="mt-2 space-y-3">
              <Paragraphs body={block.body} className="text-body-sm sm:text-body" />
            </div>
          </div>
        ))}

        {section.seasonBlock ? (
          <div className="rounded-card border border-border bg-surface-muted p-4 sm:p-5">
            <p className="font-sans text-label uppercase text-foreground-subtle">
              Right now, where you are
            </p>
            <h3 className="mt-2 text-title-4 text-foreground">{section.seasonBlock.heading}</h3>
            <div className="mt-2 space-y-3">
              <Paragraphs body={section.seasonBlock.body} className="text-body-sm sm:text-body" />
            </div>
            {section.seasonBlock.guide ? (
              <p className="mt-3">
                <Link
                  href={articlePath(section.seasonBlock.guide.slug)}
                  className="text-body-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
                >
                  {section.seasonBlock.guide.label}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {/* At most one guide link per section. A section is not a link farm. */}
        {section.guide ? (
          <p className="pt-1">
            <Link
              href={articlePath(section.guide.slug)}
              className="text-body-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              {section.guide.label}
            </Link>
          </p>
        ) : null}
      </div>
    </details>
  );
}
