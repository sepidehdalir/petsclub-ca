import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { getAuthor } from "@/features/editorial/authors";
import { StageView } from "@/features/puppy/components/stage-view";
import {
  fourToSixMonths,
  isStageIndexable,
  stagePublicationDates,
} from "@/features/puppy/stages";
import { createMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/structured-data";
import { getMediaAsset } from "@/media/manifest";

const stage = fourToSixMonths;
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
 * The public 4-to-6-month stage.
 *
 * Renders the universal content with **no context**: no breed, no province, no
 * season. That is what makes it a safely indexable page — its content is the
 * same for every reader and does not vary by query string, so there is exactly
 * one canonical version of it. The personalised layers live at `/my-puppy`,
 * which is `noindex` and canonicals here.
 *
 * One page covers three months because two differentiation gates said so
 * independently: nothing separates months four and five, and a standalone
 * six-month page would have repeated roughly two thirds of this one. The
 * reader is still told their exact age — four, five or six months — because a
 * range label is never used as an age claim. See `journeyHeadlineAge`.
 *
 * The former `/puppy/4-5-months` path redirects here permanently, the same way
 * `/puppy/11-weeks` does — see `redirects()` in `next.config.ts`.
 */
export default function FourToSixMonthsPage() {
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
