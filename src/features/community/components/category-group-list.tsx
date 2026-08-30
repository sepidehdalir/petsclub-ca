import Link from "next/link";

import { Card, CardBody } from "@/components/ui/card";
import {
  communityCategoryPath,
  type CommunityCategoryGroup,
} from "@/features/community/taxonomy";

export interface CategoryGroupListProps {
  group: CommunityCategoryGroup;
  /** Anchor id, so the `/community` hub can link to a group directly. */
  id?: string;
}

/** One top-level group and its leaf categories, rendered as a linked list. */
export function CategoryGroupList({ group, id }: CategoryGroupListProps) {
  const headingId = `${id ?? group.slug}-heading`;

  return (
    <section id={id ?? group.slug} aria-labelledby={headingId} className="scroll-mt-24">
      <div className="max-w-2xl space-y-2">
        <h2 id={headingId} className="text-xl font-semibold text-foreground sm:text-2xl">
          {group.name}
        </h2>
        <p className="text-sm leading-relaxed text-foreground-muted">{group.description}</p>
      </div>

      <Card className="mt-5 overflow-hidden">
        <ul className="divide-y divide-border">
          {group.children.map((category) => (
            <li key={category.slug}>
              <Link
                href={communityCategoryPath(category.slug)}
                className="block transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
              >
                <CardBody className="flex items-start justify-between gap-4 py-4">
                  <div className="space-y-1">
                    <h3 className="font-sans text-base font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground-muted">
                      {category.description}
                    </p>
                  </div>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1 h-4 w-4 shrink-0 text-ink-400"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </CardBody>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
