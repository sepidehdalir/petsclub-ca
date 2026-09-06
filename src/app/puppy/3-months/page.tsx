import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { getAuthor } from "@/features/editorial/authors";
import { StageView } from "@/features/puppy/components/stage-view";
import {
  threeMonths,
  isStageIndexable,
  stagePublicationDates,
} from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

const stage = threeMonths;
const path = `/puppy/${stage.slug}`;

export const metadata: Metadata = createMetadata({
  title: stage.title,
  description: stage.metaDescription,
  path,
  type: "article",
  // Indexing needs the content to be finished *and* the route to be one we
  // want found. `isStageIndexable` is the same predicate the sitemap uses, so
  // the meta tag and sitemap membership cannot disagree.
  noIndex: !isStageIndexable(stage),
  image: {
    url: getMediaAsset(stage.mediaId).src.src,
    width: getMediaAsset(stage.mediaId).src.width,
    height: getMediaAsset(stage.mediaId).src.height,
    alt: stage.mediaAlt,
  },
  authors: [getAuthor("pet-club-editorial").name],
});

/**
 * The public 3-month stage.
 *
 * Renders the universal content with **no context**: no breed, no province, no
 * season. That is what makes it a safely indexable page — its content is the
 * same for every reader and does not vary by query string, so there is exactly
 * one canonical version of it. The personalised layers live at `/my-puppy`,
 * which is `noindex` and canonicals here.
 *
 * The stage opens on day 91, which can be a day or two before a given reader's
 * own three-calendar-month anniversary. So this page says "around three
 * months" and never asserts that its reader is exactly three months old. The
 * only place a month is named as an age is the personalised headline, which
 * checks the calendar before saying it — see `journeyHeadlineAge`.
 */
export default function ThreeMonthsPage() {
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
