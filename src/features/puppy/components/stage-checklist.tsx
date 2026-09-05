import type { ChecklistItem } from "@/features/puppy/model";

export interface StageChecklistProps {
  items: readonly ChecklistItem[];
}

/**
 * The week's checklist.
 *
 * Deliberately not interactive in this milestone. Ticking a box implies the
 * state is kept, and nothing here keeps it — a checkbox that forgets on
 * refresh is worse than a list that never claimed to remember. Saved progress
 * arrives with accounts.
 */
export function StageChecklist({ items }: StageChecklistProps) {
  return (
    <section
      aria-labelledby="stage-checklist-heading"
      className="rounded-card border border-pine-200 bg-pine-50/60 px-5 py-6 sm:px-7"
    >
      <h2
        id="stage-checklist-heading"
        className="font-sans text-label uppercase text-pine-800"
      >
        This week&rsquo;s checklist
      </h2>

      <ul className="mt-4 space-y-3.5">
        {items.map((item) => (
          <li key={item.id} className="relative pl-6">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[0.3em] text-pine-600"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7.5l3 3 6-7"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="block text-body text-foreground-reading">{item.label}</span>
            {item.detail ? (
              <span className="mt-1 block text-body-sm text-foreground-muted">
                {item.detail}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
