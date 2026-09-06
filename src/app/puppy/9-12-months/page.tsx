import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { getAuthor } from "@/features/editorial/authors";
import { StageView } from "@/features/puppy/components/stage-view";
import { nineToTwelveMonths } from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

const stage = nineToTwelveMonths;
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
 * The public 9-to-12-month stage.
 *
 * Renders the universal content with **no context**: no breed, no province, no
 * season. That is what makes it a safely indexable page — its content is the
 * same for every reader and does not vary by query string, so there is exactly
 * one canonical version of it. The personalised layers live at `/my-puppy`,
 * which is `noindex` and canonicals here.
 *
 * That context-free rendering is the constraint this stage is written around.
 * Most of what is new here forks on adult size — when a larger dog is
 * neutered, when growth food stops, how much exercise a body can take — and a
 * public page cannot know which side of the fork its reader is on. So the
 * universal prose explains where the fork is and how to tell; the modifiers
 * carry the specifics.
 *
 * The reader is still told their exact age — nine, ten, eleven or twelve
 * months — because a range label is never used as an age claim. See
 * `journeyHeadlineAge`.
 */
export default function NineToTwelveMonthsPage() {
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
