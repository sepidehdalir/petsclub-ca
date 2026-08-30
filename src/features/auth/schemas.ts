import { z } from "zod";

/**
 * Validation schemas for the authentication flows.
 *
 * These run on the **server**, inside Server Actions. Client-side validation
 * is a convenience for the person filling in the form; it is never the thing
 * that keeps bad input out.
 *
 * The username rule intentionally matches the `profiles_username_format`
 * CHECK constraint in the core schema migration.
 */

const PASSWORD_MIN_LENGTH = 10;

export const emailSchema = z
  .email("Enter a valid email address.")
  .max(254, "That email address is too long.")
  .transform((value) => value.trim().toLowerCase());

/**
 * Password rule: length only.
 *
 * Composition rules (a symbol, a digit, mixed case) push people toward
 * predictable substitutions and shorter passwords. Current NIST guidance
 * favours a longer minimum with no composition requirement, so that is what
 * this enforces.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(72, "Passwords cannot be longer than 72 characters.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(60, "Display names are limited to 60 characters.");

export const signUpSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Both passwords must match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Determines whether a post-authentication redirect target is safe.
 *
 * Only site-relative paths are accepted. Protocol-relative URLs (`//evil.com`)
 * and absolute URLs are rejected, which closes the open-redirect hole that
 * `?next=` parameters classically introduce. Backslashes are rejected too,
 * because some browsers normalise `/\evil.com` to a protocol-relative URL.
 */
export function isSafeRedirectPath(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\") &&
    !value.includes("\\")
  );
}

/** Returns `value` when it is a safe redirect target, otherwise `fallback`. */
export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  return isSafeRedirectPath(value) ? value : fallback;
}
