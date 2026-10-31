import { resolveAgeFromInput } from "@/features/puppy/age";
import type { CivilDate } from "@/features/puppy/age";
import { findBreed, findProvince, sizeGroups } from "@/features/puppy/model";
import { parseStoredPuppy } from "@/features/puppy/storage";

/** Validate legacy/local data before placing it in a navigation URL. */
export function savedJourneyHref(raw: string | null, today: CivilDate): string | null {
  if (raw && raw.length > 10000) return null;
  const saved = parseStoredPuppy(raw);
  if (!saved || !resolveAgeFromInput(saved.dob, today).ok) return null;
  const params = new URLSearchParams({ dob: saved.dob });
  if (saved.breedSlug && findBreed(saved.breedSlug)) params.set("breed", saved.breedSlug);
  if (saved.province && findProvince(saved.province)) params.set("province", saved.province);
  if (saved.sizeGroup && (saved.sizeGroup === "unknown" || Object.hasOwn(sizeGroups, saved.sizeGroup))) {
    params.set("size", saved.sizeGroup);
  }
  return `/my-puppy?${params.toString()}`;
}
