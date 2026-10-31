"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { todayLocal } from "@/features/puppy/age";
import { savedJourneyHref } from "@/features/puppy/saved-journey";
import { clearStoredPuppy, readStoredPuppyRaw, subscribeToStoredPuppy } from "@/features/puppy/storage";
import { clearJourneyChecklists } from "@/features/puppy/progress";

export function SavedJourneyLink() {
  const raw = useSyncExternalStore(subscribeToStoredPuppy, readStoredPuppyRaw, () => null);
  const href = raw ? savedJourneyHref(raw, todayLocal()) : null;
  const [status, setStatus] = useState("");
  function clear() {
    if (!window.confirm("Clear the saved puppy details and all Journey checklist ticks on this browser? This cannot be undone.")) return;
    const ticksCleared = clearJourneyChecklists();
    const profileCleared = clearStoredPuppy();
    setStatus(ticksCleared && profileCleared
      ? "Saved Journey cleared on this browser. You can start again for another puppy."
      : "Some saved data could not be cleared. Use your browser's site-data controls before starting for another puppy.");
  }
  if (!href && !status) return null;
  return (
    <div className="mt-6 border-t border-border pt-5">
      {href ? <><p className="mb-3 text-body-sm text-foreground-muted">Already started on this device?</p>
      <ButtonLink href={href} prefetch={false} variant="secondary"
        className="h-auto min-h-11 whitespace-normal py-3 text-center"
        >
        Continue your saved Journey
      </ButtonLink>
      <p className="mt-2 text-caption text-foreground-subtle">Uses the puppy details saved in this browser. No account needed.</p>
      <p className="mt-2 text-caption text-foreground-subtle">Starting for another puppy? Clear the saved Journey first, including when both puppies have the same birth date.</p>
      <Button variant="ghost" onClick={clear} className="mt-3">Clear saved Journey</Button></> : null}
      <p role="status" className="mt-2 text-body-sm text-foreground-muted">{status}</p>
    </div>
  );
}
