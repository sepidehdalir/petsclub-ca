import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The callouts an article body may use.
 *
 * These are registered globally in `src/mdx-components.tsx`, so an MDX file
 * writes `<Note>` without an import. Keeping the set small and named by
 * *meaning* rather than by colour is the point: a writer picks "this is a
 * veterinary boundary", not "this is the orange box", and the boundary then
 * looks identical on every article that draws one.
 *
 * Note the deliberate absence of a generic "warning" or "danger" box. Alarm is
 * a finite resource on a page about someone's animal, and spending it on
 * formatting means having none left for antifreeze.
 */

export interface NoteProps {
  /** Short heading. Rendered in the interface sans, because it is a label. */
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * A contextual aside: something true and useful that would derail the
 * paragraph it belongs beside.
 */
export function Note({ title, children, className }: NoteProps) {
  return (
    <aside
      className={cn(
        "my-8 rounded-card border border-border bg-surface-muted px-5 py-4 sm:px-6 sm:py-5",
        className,
      )}
    >
      {title ? (
        <p className="font-sans text-label uppercase text-pine-700">{title}</p>
      ) : null}

      {/* `callout-body` sets the aside's own reading size and rhythm, in
          `globals.css` beside the scale it steps down from. */}
      <div
        className={cn("callout-body text-foreground-reading", title && "mt-2")}
      >
        {children}
      </div>
    </aside>
  );
}

export interface VetNoteProps {
  children: ReactNode;
}

/**
 * The line between general information and veterinary advice.
 *
 * Drawn wherever an article touches symptoms, medication or an emergency. The
 * heading is fixed rather than authored, so the boundary is stated in the same
 * words every time and a writer cannot soften it — and so that no article can
 * accidentally imply the passage was written or approved by a veterinarian.
 * The Pet Club has no veterinary reviewers; see `features/editorial/authors.ts`.
 */
export function VetNote({ children }: VetNoteProps) {
  return (
    <aside
      role="note"
      // Roomier padding on a phone than the plain `Note`: this one carries the
      // longest copy of any callout on the site, and a full paragraph pressed
      // against a tinted edge is exactly where a reader stops reading.
      className="my-8 rounded-card border border-clay-200 bg-clay-50 px-5 py-5 sm:px-6"
    >
      <p className="font-sans text-label uppercase text-clay-700">
        When to call a vet
      </p>

      <div className="callout-body mt-2.5 text-clay-700/95">{children}</div>
    </aside>
  );
}

export interface ChecklistProps {
  title: string;
  /** A markdown list. Rendered without bullets — the frame supplies the cue. */
  children: ReactNode;
}

/**
 * A practical list a reader can work through, lifted out of the column.
 *
 * Distinct from an ordinary markdown list, which stays inline as part of the
 * argument. This one is meant to be photographed and taken to a hardware shop.
 */
export function Checklist({ title, children }: ChecklistProps) {
  return (
    <section className="my-8 rounded-card border border-pine-200 bg-pine-50/60 px-5 py-5 sm:px-6">
      {/* `mt-0` is load-bearing: this heading sits inside `.prose`, which gives
          every `h2` a 2em top margin meant for a section break, not for the
          first line of a box. */}
      <h2 className="mt-0 font-sans text-label uppercase text-pine-800">{title}</h2>

      <div
        className={cn(
          "callout-body mt-3 text-foreground-reading",
          // The markdown list inside keeps its markers but loses the indent,
          // so items sit against the frame rather than floating inside it.
          "[&_ul]:list-none [&_ul]:p-0",
          "[&_li+li]:mt-2 [&_li]:relative [&_li]:pl-6",
          "[&_li]:before:absolute [&_li]:before:left-1 [&_li]:before:top-[0.62em]",
          "[&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full",
          "[&_li]:before:bg-pine-500 [&_li]:before:content-['']",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export interface ScheduleRow {
  /** Row header — the age or stage. Rendered as a `<th scope="row">`. */
  when: string;
  /** What happens then, in a sentence. */
  what: string;
}

export interface ScheduleTableProps {
  /**
   * The table's own explanation, rendered as a visible `<caption>`.
   *
   * Required, and required to say that the schedule is a shape rather than a
   * prescription. A table looks more authoritative than the prose around it —
   * it reads as *the* schedule — so the sentence that says "yours may
   * reasonably differ" has to travel inside the table rather than sit in a
   * paragraph above it that a scanning reader skips.
   */
  caption: string;
  /** Column heading for the `when` column. */
  whenLabel: string;
  /** Column heading for the `what` column. */
  whatLabel: string;
  rows: readonly ScheduleRow[];
}

/**
 * A two-column schedule, for the vaccination guides.
 *
 * ## Why a real table
 *
 * The schedules were bullet lists of "age — what happens" pairs, which is a
 * table pretending not to be one. A reader scanning for "when is the last
 * one" has to read every bullet; in a table they read one column.
 *
 * ## Why two columns and not four
 *
 * The obvious design is age / vaccine / notes / interval. It is unreadable at
 * 360px, and the usual fix — horizontal scroll — hides the column that
 * matters most on the device most people are holding. Two columns wrap
 * cleanly at any width without scrolling, so the `what` cell carries a
 * sentence rather than a fragment. The overflow wrapper stays as a safety net
 * for a long unbreakable string, not as the layout.
 *
 * Semantics: `when` is a `<th scope="row">`, so a screen reader announces the
 * age with each cell and the table is navigable without seeing the grid.
 */
export function ScheduleTable({ caption, whenLabel, whatLabel, rows }: ScheduleTableProps) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="mb-3 text-left font-sans text-caption text-foreground-muted">
          {caption}
        </caption>

        <thead>
          <tr className="border-b border-ink-300">
            <th
              scope="col"
              className="py-2 pr-4 align-bottom font-sans text-label uppercase text-pine-800"
            >
              {whenLabel}
            </th>
            <th
              scope="col"
              className="py-2 align-bottom font-sans text-label uppercase text-pine-800"
            >
              {whatLabel}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.when} className="border-b border-border align-top">
              <th
                scope="row"
                className="w-[8.5rem] py-3 pr-4 text-body-sm font-semibold text-foreground sm:w-44"
              >
                {row.when}
              </th>
              <td className="py-3 text-body-sm text-foreground-reading">{row.what}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
