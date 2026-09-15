"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cleanCardName, publicJourneyShareUrl } from "@/features/puppy/progress";
import { emitJourneyEvent } from "@/features/puppy/growth-events";

interface ProgressCardProps {
  stageSlug: string;
  stageLabel: string;
  completed: number;
  total: number;
}

/** Canvas stays local. No upload, profile URL, photo or external AI call. */
async function downloadCard(stageLabel: string, name: string, completed: number, total: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#f7f8f1";
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = "#163f32";
  ctx.fillRect(0, 0, 1080, 24);
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.fillText("THEPETCLUB.CA  /  PUPPY JOURNEY", 80, 120);
  const title = name ? `${name}'s small steps` : "Our small steps";
  let fontSize = 66;
  do { ctx.font = `${fontSize}px Georgia, serif`; fontSize -= 2; }
  while (ctx.measureText(title).width > 920 && fontSize > 24);
  ctx.fillText(title, 80, 275, 920);
  ctx.font = "36px Arial, sans-serif";
  ctx.fillText(stageLabel, 80, 345);
  ctx.font = "bold 160px Arial, sans-serif";
  ctx.fillText(`${completed} / ${total}`, 80, 600);
  ctx.font = "38px Arial, sans-serif";
  ctx.fillText("checklist items marked done", 80, 670);
  ctx.fillStyle = "#d9e6dd";
  ctx.fillRect(80, 745, 920, 20);
  ctx.fillStyle = "#245e45";
  ctx.fillRect(80, 745, 920 * Math.min(1, Math.max(0, completed / Math.max(1, total))), 20);
  ctx.font = "48px Georgia, serif";
  ctx.fillText("One stage at a time.", 80, 895);
  ctx.font = "27px Arial, sans-serif";
  ctx.fillText("Owner-marked progress, not a health or training assessment.", 80, 1075, 920);
  ctx.fillText("Start your own Journey at", 80, 1180);
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillText("thepetclub.ca/puppy", 80, 1240);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image unavailable")), "image/png");
  });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "thepetclub-puppy-progress.png";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
  }
}

export function ProgressCard({ stageSlug, stageLabel, completed, total }: ProgressCardProps) {
  const nameId = useId();
  const linkId = useId();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const publicUrl = publicJourneyShareUrl(stageSlug);
  const safeName = cleanCardName(name);

  async function saveCard() {
    setBusy(true);
    try {
      await downloadCard(stageLabel, safeName, completed, total);
      emitJourneyEvent("progress_card_download_requested", { stageSlug, checkedCount: completed });
      setStatus("Card download requested. Your browser controls where it is saved.");
    } catch {
      setStatus("The card could not be created in this browser. You can still copy the public stage link below.");
    } finally { setBusy(false); }
  }

  async function shareStage() {
    if (!navigator.share) {
      setStatus("Native sharing is not available here. Use Copy public link below.");
      return;
    }
    emitJourneyEvent("stage_share_requested", { stageSlug, checkedCount: completed });
    setBusy(true);
    try {
      await navigator.share({
        title: "Puppy Journey — ThePetClub.ca",
        text: `We marked ${completed} of ${total} checklist items for ${stageLabel}. Explore the public guide:`,
        url: publicUrl,
      });
      emitJourneyEvent("stage_share_handoff", { stageSlug, checkedCount: completed });
      setStatus("Handed to your device's share service. Delivery is not tracked.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        emitJourneyEvent("stage_share_cancelled", { stageSlug });
        setStatus("Sharing cancelled. Nothing else was sent by this page.");
      } else {
        setStatus("Sharing did not finish. You can copy the public link instead.");
      }
    } finally { setBusy(false); }
  }

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(publicUrl);
      emitJourneyEvent("stage_link_copied", { stageSlug });
      setStatus("Public stage link copied. It does not contain your puppy's details.");
    } catch {
      setStatus("Copy is unavailable. Select and copy the public link in the field below.");
    }
  }

  return (
    <div className="mt-6 border-t border-pine-200 pt-5">
      <h3 className="text-title-3 text-pine-900">Keep a small milestone</h3>
      <p className="mt-2 text-body-sm text-foreground-muted">
        Create a progress card on this device, or share the public guide. This is your own record, not a health or training assessment.
      </p>
      <label htmlFor={nameId} className="mt-4 block text-body-sm font-medium">Name for the card (optional)</label>
      <input id={nameId} value={name} maxLength={80} autoComplete="off"
        onChange={(event) => setName(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-body" />
      <p className="mt-2 text-caption text-foreground-subtle">The name is not uploaded or saved. It appears only on the card you choose to create.</p>
      <div className="mt-4 rounded-card border border-pine-200 bg-surface p-5" aria-label="Progress card summary">
        <p className="text-caption uppercase text-pine-700">ThePetClub.ca · Puppy Journey</p>
        <p className="mt-2 break-words text-title-3">{safeName ? `${safeName}'s small steps` : "Our small steps"}</p>
        <p className="mt-2 text-body-sm text-foreground-muted">{stageLabel} · {completed} of {total} checklist items marked done</p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button onClick={saveCard} disabled={busy}>Save progress card</Button>
        <Button variant="secondary" onClick={shareStage} disabled={busy}>Share this stage</Button>
        <Button variant="secondary" onClick={copyLink} disabled={busy}>Copy public link</Button>
      </div>
      <label htmlFor={linkId} className="mt-4 block text-caption text-foreground-muted">Public link — no birth date, breed, province or name</label>
      <input id={linkId} readOnly value={publicUrl} onFocus={(event) => event.target.select()}
        className="mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-caption" />
      <p role="status" className="mt-3 text-body-sm text-pine-900">{status}</p>
    </div>
  );
}
