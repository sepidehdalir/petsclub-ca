/**
 * Shared state shape for the authentication forms.
 *
 * This lives outside `./actions.ts` because that file carries the `"use server"`
 * directive, and such a file may only export async Server Functions. Exporting
 * the `initialAuthFormState` object from there fails at request time with
 * `A "use server" file can only export async functions, found object`, which
 * takes down every auth form POST — a failure neither `tsc` nor `next build`
 * reports, because the module only fails when the action is resolved.
 *
 * Keeping the type and its initial value here also means Client Components can
 * import them without pulling the server action module into their graph.
 */

export interface AuthFormState {
  status: "idle" | "error" | "success";
  /** Message shown above the form. */
  message?: string;
  /** Per-field validation messages, keyed by input name. */
  fieldErrors?: Record<string, string>;
}

export const initialAuthFormState: AuthFormState = { status: "idle" };
