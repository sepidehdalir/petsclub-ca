/**
 * Anonymous Journey state.
 *
 * Kept in `localStorage` and nowhere else. There is no account in this
 * milestone, and there is no reason for a puppy's date of birth to reach a
 * server before there is something to do with it.
 *
 * Every read is defensive. `localStorage` throws outright in some contexts
 * (private windows on certain browsers, embedded views, storage disabled),
 * returns null in others, and can contain anything a previous version wrote —
 * so a failure here has to degrade to "no saved puppy" rather than break the
 * page.
 */

const KEY = "petclub.puppy.v1";

export interface StoredPuppy {
  /** `YYYY-MM-DD`, as the date input produces it. */
  dob: string;
  breedSlug?: string;
  province?: string;
}

/**
 * The raw stored string, or null.
 *
 * Returned as a *string* rather than a parsed object on purpose: this is the
 * snapshot `useSyncExternalStore` reads, and that hook compares snapshots by
 * identity. A fresh object from `JSON.parse` on every call would never compare
 * equal and would loop; a string compares by value and is stable.
 */
export function readStoredPuppyRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Subscribes to cross-tab writes. Same-tab writes do not need to notify. */
export function subscribeToStoredPuppy(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function parseStoredPuppy(raw: string | null): StoredPuppy | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const { dob, breedSlug, province } = parsed as Record<string, unknown>;
    if (typeof dob !== "string") {
      return null;
    }

    return {
      dob,
      breedSlug: typeof breedSlug === "string" ? breedSlug : undefined,
      province: typeof province === "string" ? province : undefined,
    };
  } catch {
    return null;
  }
}

export function writeStoredPuppy(puppy: StoredPuppy): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(puppy));
  } catch {
    // Storage unavailable. The Journey still works for this session via the
    // query string, which is why this is not surfaced as an error.
  }
}

export function clearStoredPuppy(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do, and nothing worth telling the reader.
  }
}
