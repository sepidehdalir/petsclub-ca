import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { getAuthor } from "@/features/editorial/authors";
import { StageView } from "@/features/puppy/components/stage-view";
import { sevenToEightMonths } from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

const stage = sevenToEightMonths;
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
 * The public 7-to-8-month stage — adolescence.
 *
 * Renders the universal content with **no context**: no breed, no province, no
 * season. That is what makes it a safely indexable page — its content is the
 * same for every reader and does not vary by query string, so there is exactly
 * one canonical version of it. The personalised layers live at `/my-puppy`,
 * which is `noindex` and canonicals here.
 *
 * The reader is still told their exact age — seven months or eight — because a
 * range label is never used as an age claim. See `journeyHeadlineAge`.
 *
 * Every developmental claim here is attributed to Asher et al. 2020 and framed
 * as what that study found, in guide dogs, at approximately eight months. This
 * page must never assert that adolescence begins at a particular age for every
 * dog; see the verification register on the stage.
 */
export default function SevenToEightMonthsPage() {
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
