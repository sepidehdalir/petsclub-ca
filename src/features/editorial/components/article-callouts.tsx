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

      {/* Resets the article's larger reading size: an aside that matches the
          column it interrupts stops reading as an aside. */}
      <div
        className={cn(
          "text-body-sm text-foreground-reading sm:text-body",
          "[&>*+*]:mt-3",
          title && "mt-2",
        )}
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
      className="my-8 rounded-card border border-clay-200 bg-clay-50 px-5 py-4 sm:px-6 sm:py-5"
    >
      <p className="font-sans text-label uppercase text-clay-700">
        When to call a vet
      </p>

      <div className="mt-2 text-body-sm text-clay-700/95 sm:text-body [&>*+*]:mt-3">
        {children}
      </div>
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
          "mt-3 text-body-sm text-foreground-reading sm:text-body",
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
