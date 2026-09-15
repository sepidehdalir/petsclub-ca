"use client";

import { useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/button";
import { todayLocal } from "@/features/puppy/age";
import { emitJourneyEvent } from "@/features/puppy/growth-events";
import { savedJourneyHref } from "@/features/puppy/saved-journey";
import { readStoredPuppyRaw, subscribeToStoredPuppy } from "@/features/puppy/storage";

export function SavedJourneyLink() {
  const raw = useSyncExternalStore(subscribeToStoredPuppy, readStoredPuppyRaw, () => null);
  const href = raw ? savedJourneyHref(raw, todayLocal()) : null;
  if (!href) return null;
  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="mb-3 text-body-sm text-foreground-muted">Already started on this device?</p>
      <ButtonLink href={href} prefetch={false} variant="secondary"
        className="h-auto min-h-11 whitespace-normal py-3 text-center"
        onClick={() => emitJourneyEvent("journey_resume_clicked")}>
        Continue your saved Journey
      </ButtonLink>
      <p className="mt-2 text-caption text-foreground-subtle">Uses the puppy details saved in this browser. No account needed.</p>
    </div>
  );
}
