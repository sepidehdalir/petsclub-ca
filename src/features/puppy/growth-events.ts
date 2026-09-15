import { SHAREABLE_STAGES } from "@/features/puppy/progress";

export type JourneyEventName =
  | "journey_resume_clicked"
  | "checklist_item_checked"
  | "checklist_item_unchecked"
  | "checklist_cleared"
  | "progress_card_download_requested"
  | "stage_share_requested"
  | "stage_share_handoff"
  | "stage_share_cancelled"
  | "stage_link_copied";

/**
 * Integration hook only, NOT an analytics collector. No tag, transmission,
 * storage, queue or user/session ID. Before reporting conversions or retention,
 * configure and verify a consent-aware adapter. Browser handoff is not proof
 * that a share was received. A download request is not proof a file was saved.
 */
export function emitJourneyEvent(
  name: JourneyEventName,
  input: { stageSlug?: string; checkedCount?: number } = {},
): void {
  if (typeof window === "undefined") return;
  const detail: { name: JourneyEventName; stageSlug?: string; checkedCount?: number } = { name };
  if (SHAREABLE_STAGES.some((stage) => stage === input.stageSlug)) detail.stageSlug = input.stageSlug;
  if (typeof input.checkedCount === "number" && Number.isFinite(input.checkedCount)) {
    detail.checkedCount = Math.max(0, Math.min(100, Math.floor(input.checkedCount)));
  }
  // Explicit fields: never forward DOB, province, breed, names, profile keys or URLs.
  window.dispatchEvent(new CustomEvent("petclub:journey-event", { detail }));
}
