import { cn } from "@/lib/utils/cn";

export interface WordmarkProps {
  className?: string;
  /** Renders the `.ca` suffix. Used in the header and footer lockups. */
  showDomain?: boolean;
}

/**
 * The Pet Club wordmark.
 *
 * Typographic rather than an image file: it costs no network request, cannot
 * shift layout while loading, stays crisp at any density, and inherits the
 * current colour so it works on light and dark surfaces alike.
 *
 * The three parts come from `siteConfig.wordmark` rather than being written
 * out here, so this lockup and the generated Open Graph card cannot disagree
 * about the brand — which is how the header ended up reading "The PetClub.ca"
 * after the domain move.
 */
export function Wordmark({ className, showDomain = true }: WordmarkProps) {
  return (
    <span
      className={cn(
        "club-wordmark text-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="27" rx="11" ry="9"/><ellipse cx="7" cy="16" rx="5" ry="7" transform="rotate(-25 7 16)"/><ellipse cx="16" cy="8" rx="5" ry="7"/><ellipse cx="27" cy="9" rx="5" ry="7" transform="rotate(15 27 9)"/><ellipse cx="34" cy="19" rx="5" ry="7" transform="rotate(30 34 19)"/></svg>
      <span>the pet<br />club<span className="sr-only">{showDomain ? ".ca" : ""}</span></span>
    </span>
  );
}
