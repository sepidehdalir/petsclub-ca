"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas";
import { isSupabaseConfigured } from "@/lib/env/public";
import { absoluteUrl } from "@/lib/seo/urls";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server Actions for the authentication flows.
 *
 * Every action validates on the server with the schemas in `./schemas.ts`
 * before touching Supabase; the browser is never trusted to have validated
 * anything. Actions return a serialisable state object consumed by
 * `useActionState`, so the forms work as plain HTML posts before hydration.
 */

export interface AuthFormState {
  status: "idle" | "error" | "success";
  /** Message shown above the form. */
  message?: string;
  /** Per-field validation messages, keyed by input name. */
  fieldErrors?: Record<string, string>;
}

export const initialAuthFormState: AuthFormState = { status: "idle" };

const NOT_CONFIGURED_STATE: AuthFormState = {
  status: "error",
  message:
    "Accounts are not available on this deployment yet — Supabase is not configured. See the README for setup instructions.",
};

/** Flattens a zod error into the `fieldErrors` shape the forms render. */
function toFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return NOT_CONFIGURED_STATE;
  }

  const parsed = signUpSchema.safeParse({
    displayName: readString(formData, "displayName"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Consumed by the handle_new_user() trigger. It reads display_name only
      // — a role supplied here is ignored by design.
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: absoluteUrl("/auth/callback?next=/account"),
    },
  });

  if (error) {
    return {
      status: "error",
      // Deliberately generic. Reporting "this email is already registered"
      // would turn the sign-up form into an account-enumeration oracle.
      message: "We could not create that account. Check your details and try again.",
    };
  }

  // When email confirmation is disabled in the Supabase project, sign-up
  // returns a live session and there is nothing to confirm.
  if (data.session) {
    redirect("/account");
  }

  return {
    status: "success",
    message:
      "Check your email to confirm your address. The link will bring you back here and finish setting up your account.",
  };
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return NOT_CONFIGURED_STATE;
  }

  const parsed = signInSchema.safeParse({
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "That email and password did not match an account.",
    };
  }

  // `redirect` throws a control-flow signal, so it must run outside any
  // try/catch that would swallow it.
  redirect(safeRedirectPath(readString(formData, "next"), "/account"));
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

export async function forgotPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return NOT_CONFIGURED_STATE;
  }

  const parsed = forgotPasswordSchema.safeParse({ email: readString(formData, "email") });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: absoluteUrl("/auth/callback?next=/reset-password"),
  });

  // The same response is returned whether or not an account exists. Anything
  // else lets an attacker enumerate registered addresses.
  return {
    status: "success",
    message:
      "If an account exists for that address, we have sent a password reset link. Check your inbox and spam folder.",
  };
}

// ---------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------

export async function resetPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return NOT_CONFIGURED_STATE;
  }

  const parsed = resetPasswordSchema.safeParse({
    password: readString(formData, "password"),
    confirmPassword: readString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();

  // The recovery link established a session via /auth/callback. Without it
  // there is no user to update, and Supabase rejects the call — the password
  // cannot be changed from an unauthenticated request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message:
        "This password reset link has expired or has already been used. Request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      status: "error",
      message: "We could not update your password. Request a new reset link and try again.",
    };
  }

  redirect("/account");
}
