import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { demoThreadHref, type DemoThread } from "@/features/community/fixtures";

export interface ThreadPreviewCardProps {
  thread: DemoThread;
  /** Heading level, so the card fits the surrounding document outline. */
  headingLevel?: "h3" | "h4";
}

/**
 * Compact preview of a discussion.
 *
 * This component renders examples only. Never attach activity counts or
 * recency to illustrative topics; real discussions need a separate renderer.
 */
export function ThreadPreviewCard({
  thread,
  headingLevel: Heading = "h3",
}: ThreadPreviewCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 border-b border-border py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">{thread.categoryName}</Badge>
      </div>

      <Heading className="text-title-4 text-foreground sm:text-title-3">
        <Link
          href={demoThreadHref(thread)}
          className="transition-colors after:absolute after:inset-0 group-hover:text-pine-800 focus:outline-none"
        >
          {thread.title}
        </Link>
      </Heading>

      <p className="text-body-sm text-foreground-muted">
        Example topic — no member discussion or replies yet.
      </p>
    </article>
  );
}
