import { cn } from "@/lib/utils/cn";

export interface DemoContentNoticeProps {
  /** What the surrounding fixture content stands in for. */
  children: string;
  className?: string;
}

/**
 * Marks a region as illustrative fixture data.
 *
 * Milestone 1 ships the interface before the community exists. Every surface
 * rendering placeholder threads, guides or Lost & Found reports carries this
 * notice, so a visitor is never shown fabricated activity presented as real.
 * The notice is removed alongside the fixtures when live data lands.
 */
export function DemoContentNotice({ children, className }: DemoContentNoticeProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-clay-200 bg-clay-50",
        "px-3 py-1 text-xs font-medium text-clay-700",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500"
      />
      {children}
    </p>
  );
}
