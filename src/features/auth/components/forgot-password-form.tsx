"use client";

import { useActionState } from "react";

import {
  AuthFormMessage,
  AuthSubmitButton,
  AuthTextField,
} from "@/features/auth/components/form-parts";
import { forgotPasswordAction, initialAuthFormState } from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialAuthFormState);

  if (state.status === "success") {
    return <AuthFormMessage state={state} />;
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormMessage state={state} />

      <AuthTextField
        id="forgot-email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        hint="We will send a reset link to this address."
        state={state}
      />

      <AuthSubmitButton pendingLabel="Sending link…">Send reset link</AuthSubmitButton>
    </form>
  );
}
