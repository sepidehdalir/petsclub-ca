import Link from "next/link";

import { Media } from "@/components/ui/media";
import {
  articlePath,
  getArticleSection,
  type Article,
} from "@/features/editorial/articles";
import { cn } from "@/lib/utils/cn";
import { getMediaAsset } from "@/media/manifest";

export interface ArticleCardProps {
  article: Article;
  /** Heading level, so cards slot into the surrounding page outline. */
  headingLevel?: "h2" | "h3" | "h4";
  /**
   * Rendered widths of the card's photograph. Required for the same reason
   * `Media` requires it: only the call site knows the grid it lands in.
   */
  sizes: string;
  /**
   * `stacked` puts the type under the picture — the grid card.
   * `lead` sets them side by side, for the one article that opens a section.
   *
   * A section front with a single article should not render it as one cell of
   * a two-column grid with nothing beside it. The lead treatment is what a
   * magazine does with its top story, and it also means a section that has
   * published once does not look like a section that has failed to fill a row.
   */
  variant?: "stacked" | "lead";
  className?: string;
}

/**
 * A published article, as it appears on a section front.
 *
 * Not a `Card`. The `Card` primitive draws a bordered panel, which is right
 * for a forum category and wrong for a photograph — a picture in a box reads
 * as a product tile. Here the image is the object and the type sits beneath it,
 * which is how a section front in a magazine is laid out and why these pages
 * read as editorial rather than as a directory.
 *
 * One stretched anchor covers the whole card, so pointer users get the full
 * target while assistive technology announces exactly one link named by the
 * headline. The photograph carries `alt=""` because the headline directly
 * beneath it already names the subject.
 */
export function ArticleCard({
  article,
  headingLevel: Heading = "h3",
  sizes,
  variant = "stacked",
  className,
}: ArticleCardProps) {
  const section = getArticleSection(article.section);
  const isLead = variant === "lead";

  return (
    <article
      className={cn(
        "group relative",
        isLead
          ? "grid items-center gap-6 md:grid-cols-12 md:gap-10"
          : "flex flex-col",
        className,
      )}
    >
      <Media
        asset={getMediaAsset(article.mediaId)}
        alt=""
        // The lead runs in the widest frame; grid cards stay on the workhorse
        // 3:2 so a row of them lines up.
        ratio={isLead ? "lead" : "landscape"}
        sizes={sizes}
        className={cn(isLead ? "md:col-span-7" : "mb-4")}
      />

      <div className={cn(isLead && "md:col-span-5")}>
        <p className="font-sans text-label uppercase text-pine-700">
          {section.name}
          {article.subcategory ? (
            <span className="text-foreground-subtle"> · {article.subcategory}</span>
          ) : null}
        </p>

        <Heading
          className={cn(
            "mt-2 text-foreground",
            isLead ? "text-title-1 sm:text-display-3" : "text-title-2",
          )}
        >
          <Link
            href={articlePath(article.slug)}
            className="after:absolute after:inset-0 focus:outline-none group-hover:text-pine-800"
          >
            {article.title}
          </Link>
        </Heading>

        <p
          className={cn(
            "mt-2 text-foreground-muted",
            isLead ? "text-body" : "text-body-sm",
          )}
        >
          {article.deck}
        </p>

        <p className="mt-3 font-sans text-caption text-foreground-subtle">
          {article.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
