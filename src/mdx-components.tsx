import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Children, isValidElement, type ReactNode } from "react";

import {
  Checklist,
  Note,
  ScheduleTable,
  VetNote,
} from "@/features/editorial/components/article-callouts";
import { isInReviewGuideLink } from "@/features/editorial/inline-guide-links";
import { slugify } from "@/lib/utils/slug";

/**
 * Global MDX component mapping. Required by `@next/mdx`.
 *
 * ## What is, and is not, done here
 *
 * Almost nothing is styled here. Article bodies render inside `.prose`
 * (`app/globals.css`), whose rules are written against plain element
 * selectors, so a markdown paragraph, list or blockquote already arrives
 * correctly set. Restating those styles as per-element React components would
 * give the type scale a second, competing definition — exactly the problem
 * `.prose` was extracted to solve.
 *
 * So this file does only the three things CSS cannot:
 *
 *  1. **Heading anchors.** Every `h2`/`h3` gets an `id` derived from its own
 *     text, so a reader can link to a section and a table of contents can be
 *     added later without touching the content. Done with the site's existing
 *     `slugify` rather than a rehype plugin — no dependency, and it cannot
 *     disagree with the slugs used elsewhere.
 *  2. **Links respect publication and navigation.** A link to a registered
 *     in-review guide renders as plain text until that guide is published.
 *     Other relative links use `next/link`; absolute ones stay an `<a>` and
 *     pick up `rel="noreferrer"`. This does not privatise draft routes.
 *  3. **The editorial callouts**, registered globally so an article writes
 *     `<Note>` without an import statement at the top of the prose.
 */

/**
 * Flattens a heading's children to plain text.
 *
 * A heading may contain emphasis or a link, so `children` is not reliably a
 * string. Anything that is not text is skipped rather than guessed at.
 */
function headingText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(headingText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return headingText(node.props.children);
  }

  return "";
}

function headingId(children: ReactNode): string | undefined {
  const slug = slugify(headingText(Children.toArray(children)));
  return slug.length > 0 ? slug : undefined;
}

const components = {
  h2: ({ children, ...props }) => (
    <h2 id={headingId(children)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 id={headingId(children)} {...props}>
      {children}
    </h3>
  ),
  a: ({ href, children, ...props }) => {
    // Preserve the prose, but do not promote an unfinished destination. A
    // published public-noindex guide still renders its normal working link.
    if (isInReviewGuideLink(href)) {
      return <>{children}</>;
    }

    // Fragment and relative links stay inside the app; anything else is
    // treated as leaving the site.
    const isInternal = typeof href === "string" && /^[/#]/.test(href);

    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} rel="noreferrer" {...props}>
        {children}
      </a>
    );
  },
  Note,
  VetNote,
  Checklist,
  ScheduleTable,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
