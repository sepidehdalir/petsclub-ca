"use client";

import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import type { ChecklistItem } from "@/features/puppy/model";
import { emitJourneyEvent } from "@/features/puppy/growth-events";
import {
  checklistScope, clearChecklistProgress, parseChecklistProgress,
  readChecklistRaw, subscribeToChecklist, writeChecklistProgress,
} from "@/features/puppy/progress";
import { ProgressCard } from "@/features/puppy/components/progress-card";

export interface StageChecklistProps {
  items: readonly ChecklistItem[];
  stageSlug: string;
  stageLabel: string;
  /** Validated DOB; only used to isolate device-local personalised progress. */
  birthDate?: string;
}

export function StageChecklist(props: StageChecklistProps) {
  const scope = checklistScope(props.stageSlug, props.birthDate);
  return <ChecklistState key={scope} {...props} scope={scope} />;
}

function ChecklistState({ items, stageSlug, stageLabel, scope }: StageChecklistProps & { scope: string }) {
  const id = useId();
  const getSnapshot = useCallback(() => readChecklistRaw(scope), [scope]);
  const raw = useSyncExternalStore(subscribeToChecklist, getSnapshot, () => null);
  const allowed = items.map((item) => item.id);
  const saved = parseChecklistProgress(raw, allowed);
  const [temporary, setTemporary] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const done = (temporary ?? saved).filter((itemId) => allowed.includes(itemId));

  function toggle(itemId: string, checked: boolean) {
    const latest = temporary ?? parseChecklistProgress(readChecklistRaw(scope), allowed);
    const next = checked ? [...new Set([...latest, itemId])] : latest.filter((value) => value !== itemId);
    const persisted = writeChecklistProgress(scope, next);
    setTemporary(persisted ? null : next);
    setMessage(persisted ? "Saved on this device." : "Storage is unavailable. These ticks are temporary and may disappear when you leave or refresh.");
    emitJourneyEvent(checked ? "checklist_item_checked" : "checklist_item_unchecked", {
      stageSlug, checkedCount: next.length,
    });
  }

  function clear() {
    if (!window.confirm("Clear the ticks for this checklist on this device? Other stages are not changed.")) return;
    const cleared = clearChecklistProgress(scope);
    setTemporary(cleared ? null : []);
    setMessage(cleared ? "This checklist was cleared on this device." : "Saved data could not be cleared. Old ticks may return after refresh; use your browser's site-data controls to remove them.");
    if (cleared) emitJourneyEvent("checklist_cleared", { stageSlug, checkedCount: 0 });
  }

  return (
    <section aria-labelledby="stage-checklist-heading"
      className="scroll-mt-28 rounded-card border border-pine-200 bg-pine-50/60 px-5 py-6 sm:px-7">
      <h2 id="stage-checklist-heading" className="font-sans text-label uppercase text-pine-800">
        This week&rsquo;s checklist
      </h2>
      <p className="mt-3 text-body-sm text-foreground-muted">
        Mark the steps you have taken. Ticks are saved only in this browser for this stage, not to an account or another device. There are no streaks to lose.
      </p>
      <p className="mt-3 text-body-sm font-medium text-pine-900">{done.length} of {items.length} marked done</p>
      <progress className="mt-2 h-2 w-full accent-pine-700" value={done.length} max={Math.max(1, items.length)}
        aria-label={`${done.length} of ${items.length} checklist items marked done`} />
      <ul className="mt-4 space-y-3.5">
        {items.map((item, index) => (
          <li key={item.id}>
            <label htmlFor={`${id}-${index}`} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
              <input id={`${id}-${index}`} type="checkbox" checked={done.includes(item.id)}
                onChange={(event) => toggle(item.id, event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-pine-700"
                aria-describedby={item.detail ? `${id}-${index}-detail` : undefined} />
              <span className="min-w-0">
                <span className="block text-body text-foreground-reading">{item.label}</span>
                {item.detail ? <span id={`${id}-${index}-detail`} className="mt-1 block text-body-sm text-foreground-muted">{item.detail}</span> : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className="mt-3 text-body-sm text-pine-900">{message}</p>
      {done.length > 0 ? <>
        <Button variant="ghost" onClick={clear} className="mt-2">Clear this checklist</Button>
        <ProgressCard stageSlug={stageSlug} stageLabel={stageLabel} completed={done.length} total={items.length} />
      </> : null}
    </section>
  );
}
