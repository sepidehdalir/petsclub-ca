"use client";

import { useActionState } from "react";

import { confirmEmailAction } from "@/features/auth/actions";
import {
  AuthFormMessage,
  AuthSubmitButton,
} from "@/features/auth/components/form-parts";
import { initialAuthFormState } from "@/features/auth/form-state";

export interface ConfirmFormProps {
  /** The one-time token from the email. Carried, not yet redeemed. */
  tokenHash: string;
  /** Already validated against the allow-list on the server. */
  type: string;
  /** Already passed through `safeRedirectPath` on the server. */
  next: string;
  submitLabel: string;
  pendingLabel: string;
}

/**
 * The button that actually redeems an emailed token.
 *
 * Deliberately a real form submission and never an automatic one. If this
 * submitted on mount, a scanner that executes JavaScript would spend the token
 * exactly as a prefetching scanner spends a GET link — which is the failure
 * this whole route exists to prevent. A human has to press the button.
 */
export function ConfirmForm({
  tokenHash,
  type,
  next,
  submitLabel,
  pendingLabel,
}: ConfirmFormProps) {
  const [state, formAction] = useActionState(confirmEmailAction, initialAuthFormState);

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />

      <input type="hidden" name="tokenHash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={next} />

      <AuthSubmitButton pendingLabel={pendingLabel}>{submitLabel}</AuthSubmitButton>
    </form>
  );
}
