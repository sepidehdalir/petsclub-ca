import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  articleDescription,
  articlePath,
  articles,
  findArticle,
} from "@/features/editorial/articles";
import { getAuthor } from "@/features/editorial/authors";
import { ArticlePage } from "@/features/editorial/components/article-page";
import { createMetadata } from "@/lib/seo/metadata";
import { getMediaAsset } from "@/media/manifest";

interface ArticleRouteProps {
  params: Promise<{ slug: string }>;
}

/**
 * Every article route is known at build time.
 *
 * With `dynamicParams` off, a slug that is not in the registry 404s rather
 * than attempting to import a file that does not exist — so a mistyped link
 * fails visibly instead of throwing at request time.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return articles.map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) {
    return createMetadata({ title: "Guide not found", noIndex: true });
  }

  const asset = getMediaAsset(article.mediaId);
  const author = getAuthor(article.authorId);

  return createMetadata({
    title: article.title,
    description: articleDescription(article),
    path: articlePath(article.slug),
    type: "article",
    // Indexing follows editorial status, not the calendar. An article that has
    // not completed review is `noindex`, which is the same thing the on-page
    // draft notice tells a reader and the reason `buildSitemapEntries` leaves
    // it out. All three launch articles are currently `in-review`.
    noIndex: article.status !== "published",
    // The lead photograph as the share card: `src` is the hashed static path
    // Next emits for the imported asset, resolved to an absolute URL by
    // `metadataBase`.
    image: {
      url: asset.src.src,
      width: asset.src.width,
      height: asset.src.height,
      alt: article.mediaAlt ?? asset.alt,
    },
    // Same rule as the `Article` schema and the byline: an article that has
    // not been published makes no claim about when it was. Open Graph is read
    // by machines rather than people, which is exactly why it must not say
    // something the page itself declines to say.
    ...(article.status === "published"
      ? { publishedTime: article.publishedAt, modifiedTime: article.updatedAt }
      : {}),
    authors: [author.name],
  });
}

export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) {
    notFound();
  }

  // The body is loaded by slug rather than from a lookup table of imports, so
  // adding an article is a registry entry plus an `.mdx` file and nothing else.
  const { default: Body } = await import(`@/content/articles/${slug}.mdx`);

  return (
    <ArticlePage article={article}>
      <Body />
    </ArticlePage>
  );
}
