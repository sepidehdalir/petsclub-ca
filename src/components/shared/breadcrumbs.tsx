import Link from "next/link";

import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbListSchema, type BreadcrumbItem } from "@/lib/seo/structured-data";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbsProps {
  /**
   * Trail from the site root to the current page, excluding "Home" — it is
   * prepended automatically so every trail is rooted consistently.
   * The last item is treated as the current page.
   */
  items: readonly BreadcrumbItem[];
  className?: string;
}

/**
 * Visual breadcrumb trail plus the matching `BreadcrumbList` structured data.
 *
 * Keeping both in one component means the markup a crawler reads and the
 * markup a person sees are generated from the same array and cannot disagree.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const trail: BreadcrumbItem[] = [{ name: "Home", path: "/" }, ...items];
  const lastIndex = trail.length - 1;

  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-foreground-muted">
          {trail.map((item, index) => {
            const isCurrent = index === lastIndex;

            return (
              <li key={item.path} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-ink-300">
                    /
                  </span>
                ) : null}

                {isCurrent ? (
                  <span aria-current="page" className="font-medium text-foreground">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-pine-700 hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <JsonLd schema={breadcrumbListSchema(trail)} />
    </>
  );
}
