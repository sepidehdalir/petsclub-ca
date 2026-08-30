"use client";

import { useActionState } from "react";

import {
  AuthFormMessage,
  AuthSubmitButton,
  AuthTextField,
} from "@/features/auth/components/form-parts";
import { resetPasswordAction } from "@/features/auth/actions";
import { initialAuthFormState } from "@/features/auth/form-state";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialAuthFormState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormMessage state={state} />

      <AuthTextField
        id="reset-password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters. Longer beats complicated."
        state={state}
      />

      <AuthTextField
        id="reset-password-confirm"
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        state={state}
      />

      <AuthSubmitButton pendingLabel="Updating password…">Update password</AuthSubmitButton>
    </form>
  );
}
