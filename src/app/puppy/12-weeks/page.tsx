import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { getAuthor } from "@/features/editorial/authors";
import { StageView } from "@/features/puppy/components/stage-view";
import { twelveWeeks } from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

const stage = twelveWeeks;
const path = `/puppy/${stage.slug}`;

export const metadata: Metadata = createMetadata({
  title: stage.title,
  description: stage.metaDescription,
  path,
  type: "article",
  // Indexing follows editorial status, exactly as it does for an article. The
  // stage is `in-review`, so it is `noindex` and absent from the sitemap, and
  // the two cannot disagree because both read the same field.
  noIndex: stage.status !== "published",
  image: {
    url: getMediaAsset(stage.mediaId).src.src,
    width: getMediaAsset(stage.mediaId).src.width,
    height: getMediaAsset(stage.mediaId).src.height,
    alt: stage.mediaAlt,
  },
  authors: [getAuthor("pet-club-editorial").name],
});

/**
 * The public 12-week stage.
 *
 * Renders the universal content with **no context**: no breed, no province, no
 * season. That is what makes it a safely indexable page — its content is the
 * same for every reader and does not vary by query string, so there is exactly
 * one canonical version of it. The personalised layers live at `/my-puppy`,
 * which is `noindex` and canonicals here.
 *
 * This is a second stage rather than a second copy. It exists because twelve
 * weeks carries a correction the previous stage cannot make from inside its
 * own age range: the appointment that lands around now reads like a finish
 * line, and the vaccination series is usually not finished. If a future edit
 * makes this page a restatement of `/puppy/9-11-weeks`, it should be merged
 * back rather than kept.
 */
export default function TwelveWeeksPage() {
  const author = getAuthor("pet-club-editorial");
  const asset = getMediaAsset(stage.mediaId);

  return (
    <>
      <StageView
        stage={stage}
        breadcrumbs={[
          { name: "Puppy Journey", path: "/puppy" },
          { name: stage.label, path },
        ]}
      />

      <JsonLd
        schema={articleSchema({
          headline: stage.title,
          description: stage.metaDescription,
          path,
          // Same discipline as the article template: a stage that has not been
          // published carries no publication date, so the markup a crawler
          // reads cannot claim something the page does not show a reader.
          ...(stage.status === "published"
            ? { datePublished: stage.reviewBy, dateModified: stage.reviewBy }
            : {}),
          author: { name: author.name, kind: author.kind },
          section: "Puppy Journey",
          imagePath: asset.src.src,
        })}
      />
    </>
  );
}
