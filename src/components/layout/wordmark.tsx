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
 */
export function Wordmark({ className, showDomain = true }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-serif text-xl font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      The Pet
      <span className="text-pine-700">Club</span>
      {showDomain ? (
        <span className="text-base font-normal text-foreground-subtle">.ca</span>
      ) : null}
    </span>
  );
}
