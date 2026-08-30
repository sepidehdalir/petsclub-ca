"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  AuthFormMessage,
  AuthSubmitButton,
  AuthTextField,
} from "@/features/auth/components/form-parts";
import { initialAuthFormState, signInAction } from "@/features/auth/actions";

export interface SignInFormProps {
  /** Validated site-relative path to return to after signing in. */
  next: string;
}

export function SignInForm({ next }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialAuthFormState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthFormMessage state={state} />

      {/* Already validated on the server before it reached this component,
          and validated again by the action before it is used. */}
      <input type="hidden" name="next" value={next} />

      <AuthTextField
        id="sign-in-email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        state={state}
      />

      <div className="space-y-1.5">
        <AuthTextField
          id="sign-in-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          state={state}
        />
        <p className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Forgot your password?
          </Link>
        </p>
      </div>

      <AuthSubmitButton pendingLabel="Signing in…">Sign in</AuthSubmitButton>
    </form>
  );
}
