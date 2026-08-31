import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import type { MediaAsset } from "@/media/manifest";

/**
 * The editorial crops, from the tokens in `globals.css`.
 *
 * A closed set on purpose. Letting each placement pick its own ratio is how a
 * page ends up looking assembled rather than art directed, so the choice here
 * is between four frames, not any number.
 */
const RATIOS = {
  lead: "aspect-lead",
  landscape: "aspect-landscape",
  portrait: "aspect-portrait",
  square: "aspect-square",
} as const;

export type MediaRatio = keyof typeof RATIOS;

export interface MediaProps {
  asset: MediaAsset;
  /**
   * Overrides the asset's own description. Pass `""` when the surrounding
   * copy already says everything the photograph says, so a screen reader is
   * not read the same sentence twice.
   */
  alt?: string;
  ratio?: MediaRatio;
  /**
   * Rendered widths, as the `sizes` attribute. Required rather than defaulted:
   * a wrong `sizes` silently ships a file several times larger than the slot
   * it lands in, and the right answer depends on the layout, which only the
   * call site knows.
   */
  sizes: string;
  /** Set on an image above the fold. Never set it on more than one per page. */
  priority?: boolean;
  /** Object-position utility (e.g. `object-top`) to steer a tight crop. */
  position?: string;
  caption?: ReactNode;
  /** Renders the photographer credit beneath the frame. */
  showCredit?: boolean;
  className?: string;
}

/**
 * A photograph in a fixed editorial frame.
 *
 * The frame reserves its own space from the aspect ratio, so the layout is
 * final before a single byte of image arrives — there is no shift to correct
 * later. Its muted fill is also the fallback: if an image is slow, or fails
 * outright, the page keeps its shape and shows a warm panel rather than a
 * collapsed box.
 *
 * Assets are static imports, which is what makes `placeholder="blur"` free —
 * Next generates the blur at build time, so no runtime library is involved.
 */
export function Media({
  asset,
  alt,
  ratio = "landscape",
  sizes,
  priority = false,
  position,
  caption,
  showCredit = false,
  className,
}: MediaProps) {
  const hasFooter = Boolean(caption) || showCredit;

  return (
    <figure className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-media bg-surface-muted",
          RATIOS[ratio],
        )}
      >
        <Image
          src={asset.src}
          alt={alt ?? asset.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className={cn("object-cover", position)}
        />
      </div>

      {hasFooter ? (
        <figcaption className="mt-2 flex flex-col gap-1">
          {caption ? (
            <span className="text-caption text-foreground-muted">{caption}</span>
          ) : null}
          {showCredit ? (
            // The credit is a record, not a line of copy. It stays legible to
            // anyone who looks for it and disappears for everyone else, which
            // is the whole job: the manifest is where provenance is actually
            // kept, and this only has to point at it.
            <span className="text-micro text-foreground-subtle/75">
              {asset.photographer} / {asset.source}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
