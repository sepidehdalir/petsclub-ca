import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The custom font-size steps declared in `globals.css`.
 *
 * tailwind-merge has to be told about these. It classifies an unrecognised
 * `text-*` class as a *colour*, so `cn("text-ui", "text-foreground-muted")`
 * silently dropped the size and left the element at the inherited 16px —
 * the utility simply vanished from the rendered class list. Anything built
 * on `cn()` (every `ui/` primitive) is affected; plain `className` strings
 * are not, which makes the failure inconsistent and easy to miss.
 *
 * `cn.test.ts` parses `globals.css` and asserts this list still matches the
 * tokens actually declared there, so adding a step to the scale without
 * registering it here fails a test rather than half-working in production.
 */
export const FONT_SIZE_STEPS = [
  "display-1",
  "display-2",
  "display-3",
  "title-1",
  "title-2",
  "title-3",
  "title-4",
  "deck",
  "body-lg",
  "body",
  "body-sm",
  "caption",
  "micro",
  "label",
  "label-lg",
  "ui",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZE_STEPS] }],
    },
  },
});

/**
 * Merges conditional class names and resolves conflicting Tailwind utilities,
 * so a caller-supplied `className` can always override component defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
