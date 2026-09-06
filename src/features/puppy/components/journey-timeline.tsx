import Link from "next/link";

import { roadmapByPhase, roadmapStages, stages } from "@/features/puppy/stages";
import { cn } from "@/lib/utils/cn";

export interface JourneyTimelineProps {
  /** The stage the reader is currently on. */
  currentSlug: string;
  className?: string;
}

const implemented = new Set(stages.map((stage) => stage.slug));

/**
 * The stage rail.
 *
 * ## The rule that matters here
 *
 * An entry links only if the stage behind it is written. Every entry is shown
 * either way — because a reader needs to see where they sit in a journey
 * rather than land on an orphaned page — but an unwritten one renders as inert
 * text. There are no broken links and nothing pretends to be finished.
 *
 * A `<span>` with `aria-disabled` would be lying about an interactive control;
 * an unwritten entry is simply not a control, and carries a visible
 * "in progress" affordance instead.
 *
 * With the roadmap now fully written this path is unused, and it is kept
 * rather than deleted: the rail is driven by `stages` against `roadmapStages`,
 * so adding a roadmap entry ahead of its page must degrade honestly rather
 * than produce a dead link.
 *
 * ## Why it is grouped
 *
 * The journey is not a uniform grid — it runs weekly, then monthly, then in
 * milestone ranges. Rendered flat, that reads as an inconsistent list where
 * someone forgot the weeks between three and four months. Grouped under the
 * phase, the widening cadence reads as the point rather than as a gap, which
 * is what it is.
 */
export function JourneyTimeline({ currentSlug, className }: JourneyTimelineProps) {
  return (
    <nav aria-label="Puppy Journey stages" className={className}>
      <p className="font-sans text-label uppercase text-foreground-subtle">The journey</p>

      <div className="mt-4 space-y-5">
        {roadmapByPhase().map(({ phase, stages: phaseStages }) => (
          /*
            The phase label groups navigation rows; it is not a heading in the
            document outline. As an `h3` it sat between the page `h1` and the
            first content `h2`, so every stage page read as h1 -> h3 -> h2 —
            an invalid jump, and a misleading outline, since "Early puppy" is
            not a section of the article.
            `aria-labelledby` gives the group the same name for a screen
            reader without putting it in the heading order. The visual result
            is identical.
          */
          <section key={phase.id} aria-labelledby={`journey-phase-${phase.id}`}>
            <p
              id={`journey-phase-${phase.id}`}
              className="px-2.5 font-sans text-micro uppercase text-foreground-subtle"
            >
              {phase.label}
            </p>
            <p className="mt-1 px-2.5 text-caption text-foreground-subtle">{phase.note}</p>

            <ol className="mt-2 space-y-0.5">
              {phaseStages.map((stage) => {
                const isCurrent = stage.slug === currentSlug;
                const isLive = implemented.has(stage.slug);

                const inner = (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        isCurrent ? "bg-pine-600" : isLive ? "bg-ink-400" : "bg-ink-200",
                      )}
                    />
                    <span className="flex-1">{stage.label}</span>
                    {!isLive ? (
                      <span className="font-sans text-micro uppercase text-foreground-subtle">
                        Soon
                      </span>
                    ) : null}
                  </>
                );

                const shared = "flex items-center gap-3 rounded-md px-2.5 py-2 text-body-sm";

                return (
                  <li key={stage.slug}>
                    {isLive && !isCurrent ? (
                      <Link
                        href={`/puppy/${stage.slug}`}
                        className={cn(shared, "text-foreground-muted hover:bg-surface-muted hover:text-foreground")}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          shared,
                          isCurrent
                            ? "bg-pine-50 font-medium text-pine-900"
                            : "text-foreground-subtle",
                        )}
                        {...(isCurrent ? { "aria-current": "step" as const } : {})}
                      >
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      {/*
        Two different states, and they must not share a sentence. A roadmap
        with stages left to write is making a promise; a complete one is
        describing a finished series. Saying "the rest are being researched"
        when there is no rest would be false, and it is exactly the confusion
        the Journey-complete screen exists to avoid.
      */}
      <p className="mt-5 px-2.5 text-caption text-foreground-subtle">
        {implemented.size < roadmapStages.length ? (
          <>
            So far {implemented.size} of these are written. The rest are being researched to the
            same standard, and a stage only becomes a page when there is something distinct to say
            about it.
          </>
        ) : (
          <>
            All {roadmapStages.length} stages are written. The series ends where age stops being the
            useful way to organise the guidance, rather than at a birthday.
          </>
        )}
      </p>
    </nav>
  );
}
