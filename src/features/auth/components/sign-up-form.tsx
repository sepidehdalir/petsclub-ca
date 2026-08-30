"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  AuthFormMessage,
  AuthSubmitButton,
  AuthTextField,
} from "@/features/auth/components/form-parts";
import { signUpAction } from "@/features/auth/actions";
import { initialAuthFormState } from "@/features/auth/form-state";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialAuthFormState);

  // Once the confirmation email is out there is nothing left to submit, so the
  // form is replaced by its own success message rather than left interactive.
  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <AuthFormMessage state={state} />
        <p className="text-sm leading-relaxed text-foreground-muted">
          Did not receive it? Check your spam folder, or{" "}
          <Link
            href="/sign-up"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            try again
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormMessage state={state} />

      <AuthTextField
        id="sign-up-display-name"
        name="displayName"
        label="Display name"
        autoComplete="nickname"
        hint="Shown on your posts. You can change it later."
        state={state}
      />

      <AuthTextField
        id="sign-up-email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        state={state}
      />

      <AuthTextField
        id="sign-up-password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 10 characters. Longer beats complicated."
        state={state}
      />

      <AuthSubmitButton pendingLabel="Creating account…">Create account</AuthSubmitButton>

      <p className="text-xs leading-relaxed text-foreground-muted">
        By creating an account you agree to our{" "}
        <Link href="/terms-of-use" className="underline underline-offset-2 hover:text-pine-700">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          href="/community-guidelines"
          className="underline underline-offset-2 hover:text-pine-700"
        >
          Community Guidelines
        </Link>
        .
      </p>
    </form>
  );
}
