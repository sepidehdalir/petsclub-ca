import { cn } from "@/lib/utils/cn";

export interface JourneyMastheadProps {
  /** "11 weeks" — the stage, always present. */
  stageLabel: string;
  /** "Your Golden Retriever is 11 weeks old" — present only when a DOB is known. */
  headline: string;
  deck: string;
  /** Breed, size group, province, date of birth. Rendered as a quiet meta row. */
  facts?: readonly string[];
  className?: string;
}

/**
 * The head of a Journey page.
 *
 * ## Why this is not `PageHeader`
 *
 * `PageHeader` opens an editorial section — an eyebrow, a headline, a
 * paragraph. This opens a *state*: the reader's own puppy, at a specific age,
 * today. The difference shows in what has to be prominent. Here the age is the
 * headline and the stage label is the eyebrow, and there is a meta row of
 * resolved facts underneath that no editorial page has.
 *
 * What it deliberately keeps from the editorial identity: the same display
 * face, the same pine eyebrow, the same measure, the same surface and rule.
 * A Journey page should read as the same publication, not as an app someone
 * bolted on — which is why there is no card, no shadow, and no gradient here.
 */
export function JourneyMasthead({
  stageLabel,
  headline,
  deck,
  facts,
  className,
}: JourneyMastheadProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="font-sans text-label uppercase text-pine-700">
        Puppy Journey · {stageLabel}
      </p>

      <h1 className="mt-3 text-display-3 text-foreground sm:text-display-2">{headline}</h1>

      <p className="mt-4 max-w-[54ch] font-serif text-body-lg text-foreground-muted sm:text-deck">
        {deck}
      </p>

      {facts && facts.length > 0 ? (
        <ul className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
          {facts.map((fact, index) => (
            <li key={fact} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-ink-300">
                  ·
                </span>
              ) : null}
              <span className="font-sans text-body-sm text-foreground-muted">{fact}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
