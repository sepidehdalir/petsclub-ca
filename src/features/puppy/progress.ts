/** Device-only checklist state. No account, network request or analytics identifier. */
const PREFIX = "petclub.journey-checklist.v1.";
const CHANGE_EVENT = "petclub:checklist-change";

export const SHAREABLE_STAGES = [
  "8-weeks", "9-11-weeks", "12-weeks", "3-months", "4-6-months",
  "7-8-months", "9-12-months", "beyond-the-first-year",
] as const;

function storageKey(scope: string): string | null {
  return /^[a-z0-9:-]{1,120}$/.test(scope) ? `${PREFIX}${scope}` : null;
}

/** Personalised and public-guide ticks are deliberately separate. */
export function checklistScope(stageSlug: string, birthDate?: string): string {
  return `${stageSlug}:${birthDate ?? "guide"}`;
}

export function parseChecklistProgress(raw: string | null, allowedIds: readonly string[]): string[] {
  if (!raw || raw.length > 20000) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return [];
    const record = value as Record<string, unknown>;
    if (record.version !== 1 || !Array.isArray(record.done)) return [];
    const allowed = new Set(allowedIds);
    return [...new Set(record.done.filter(
      (id): id is string => typeof id === "string" && allowed.has(id),
    ))].slice(0, 100);
  } catch { return []; }
}

/** Stable string snapshots are required by useSyncExternalStore. */
export function readChecklistRaw(scope: string): string | null {
  const key = storageKey(scope);
  if (!key || typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function subscribeToChecklist(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  function onStorage(event: StorageEvent) {
    if (event.key === null || event.key.startsWith(PREFIX)) onChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** False means the UI must not promise persistence. */
export function writeChecklistProgress(scope: string, done: readonly string[]): boolean {
  const key = storageKey(scope);
  if (!key || typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, done: [...new Set(done)].slice(0, 100) }));
  } catch { return false; }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function clearChecklistProgress(scope: string): boolean {
  const key = storageKey(scope);
  if (!key || typeof window === "undefined") return false;
  try { window.localStorage.removeItem(key); } catch { return false; }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

/** Never share location.href: /my-puppy contains personal query parameters. */
export function publicJourneyShareUrl(stageSlug: string): string {
  const allowed = SHAREABLE_STAGES.some((slug) => slug === stageSlug);
  const path = allowed ? `/puppy/${stageSlug}` : "/puppy";
  return `https://thepetclub.ca${path}?utm_source=member-share&utm_medium=referral&utm_campaign=puppy-journey`;
}

export function cleanCardName(value: string): string {
  return Array.from(value.trim()).filter((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code >= 32 && code !== 127 && !(code >= 0x202a && code <= 0x202e)
      && !(code >= 0x2066 && code <= 0x2069);
  }).slice(0, 40).join("");
}
