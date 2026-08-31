import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { demoThreadHref, type DemoThread } from "@/features/community/fixtures";
import { formatCount, formatRelativeHours } from "@/lib/utils/format";

export interface ThreadPreviewCardProps {
  thread: DemoThread;
  /** Heading level, so the card fits the surrounding document outline. */
  headingLevel?: "h3" | "h4";
}

/**
 * Compact preview of a discussion.
 *
 * Milestone 1 renders fixture data through this component; Milestone 2 will
 * pass real `threads` rows with the same shape. Timestamps come from a fixed
 * hour offset rather than a clock read, so the output is deterministic and
 * cannot drift between the server render and hydration.
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

      <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-foreground-muted">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Replies</dt>
          <dd>
            {formatCount(thread.replyCount)} {thread.replyCount === 1 ? "reply" : "replies"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Last activity</dt>
          <dd>{formatRelativeHours(thread.lastActivityHoursAgo)}</dd>
        </div>
      </dl>
    </article>
  );
}
