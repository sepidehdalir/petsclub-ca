"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Field, Input, fieldIds } from "@/components/ui/field";
import type { AuthFormState } from "@/features/auth/actions";

export interface AuthTextFieldProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  state: AuthFormState;
}

/**
 * A labelled text input wired to the action's returned validation state.
 *
 * Sets `aria-invalid` and `aria-describedby` from the same state that renders
 * the visible message, so a screen-reader user is told which field failed and
 * why — not just that "the form" failed.
 */
export function AuthTextField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  hint,
  required = true,
  defaultValue,
  state,
}: AuthTextFieldProps) {
  const error = state.fieldErrors?.[name];
  const ids = fieldIds(id);

  return (
    <Field htmlFor={id} label={label} hint={hint} error={error}>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy({ hasHint: Boolean(hint), hasError: Boolean(error) })}
      />
    </Field>
  );
}

/**
 * Form-level status message.
 *
 * `role="alert"` on errors so failures are announced immediately;
 * `role="status"` on success, which is polite and does not interrupt.
 */
export function AuthFormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) {
    return null;
  }

  const isError = state.status === "error";

  return (
    <p
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
          : "rounded-md border border-pine-200 bg-pine-50 px-4 py-3 text-sm text-pine-800"
      }
    >
      {state.message}
    </p>
  );
}

/**
 * Submit button that reflects the pending state of the enclosing form.
 *
 * `useFormStatus` must be read from a child of the `<form>`, which is why this
 * is a separate component rather than a prop on the form.
 */
export function AuthSubmitButton({
  children,
  pendingLabel,
}: {
  children: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" fullWidth disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
