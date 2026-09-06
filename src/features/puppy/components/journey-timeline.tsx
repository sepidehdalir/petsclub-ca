import Link from "next/link";

import { roadmapByPhase, stages } from "@/features/puppy/stages";
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
 * Only one stage has a page. Every other entry is shown — because a reader
 * needs to see where they sit in a journey rather than land on a single
 * orphaned page — but rendered as inert text rather than a link. There are no
 * broken links and nothing pretends to be finished.
 *
 * A `<span>` with `aria-disabled` would be lying about an interactive control;
 * these are simply not controls. The upcoming entries carry a visible
 * "in progress" affordance instead, which is honest and also does the
 * product's other job: showing that this goes somewhere.
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
          <section key={phase.id}>
            <h3 className="px-2.5 font-sans text-micro uppercase text-foreground-subtle">
              {phase.label}
            </h3>
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

      <p className="mt-5 px-2.5 text-caption text-foreground-subtle">
        So far {implemented.size} of these are written. The rest are being researched to the same
        standard, and a stage only becomes a page when there is something distinct to say about it.
      </p>
    </nav>
  );
}
