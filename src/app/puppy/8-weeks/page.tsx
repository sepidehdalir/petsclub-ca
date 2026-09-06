import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { getAuthor } from "@/features/editorial/authors";
import { StageView } from "@/features/puppy/components/stage-view";
import {
  eightWeeks,
  stageRobotsPolicy,
  stagePublicationDates,
} from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

const stage = eightWeeks;
const path = `/puppy/${stage.slug}`;

export const metadata: Metadata = createMetadata({
  title: stage.title,
  description: stage.metaDescription,
  path,
  type: "article",
  // Indexing needs the content to be finished *and* the route to be one we
  // want found. `stageRobotsPolicy` reads the same two fields as the
  // `isStageIndexable` predicate behind the sitemap, so the meta tag and
  // sitemap membership cannot disagree — it just distinguishes the two ways a
  // stage can be out of the index, which membership alone cannot express.
  robots: stageRobotsPolicy(stage),
  image: {
    url: getMediaAsset(stage.mediaId).src.src,
    width: getMediaAsset(stage.mediaId).src.width,
    height: getMediaAsset(stage.mediaId).src.height,
    alt: stage.mediaAlt,
  },
  authors: [getAuthor("pet-club-editorial").name],
});

/**
 * The public 8-week stage.
 *
 * Renders the universal content with **no context**: no breed, no province, no
 * season. That is what makes it a safely indexable page — its content is the
 * same for every reader and does not vary by query string, so there is exactly
 * one canonical version of it. The personalised layers live at `/my-puppy`,
 * which is `noindex` and canonicals here.
 *
 * The framing constraint for this stage is that it must not assume the reader
 * brought a puppy home today. Most puppies arrive around eight weeks; plenty
 * do not, and a rescue puppy may have an estimated birthday. The page is
 * written around the age rather than around a moving day.
 */
export default function EightWeeksPage() {
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
          // `reviewBy` used to be piped in here as `datePublished`, which would
          // have claimed a publication date a year in the future the moment a
          // stage was published. Dates now come from the publication union and
          // are absent entirely while the stage is in review.
          ...stagePublicationDates(stage),
          author: { name: author.name, kind: author.kind },
          section: "Puppy Journey",
          imagePath: asset.src.src,
        })}
      />
    </>
  );
}
