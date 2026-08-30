import type { Metadata } from "next";
import Link from "next/link";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { safeRedirectPath } from "@/features/auth/schemas";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to your Pet Club account.",
  path: "/sign-in",
  noIndex: true,
});

/** Errors that can arrive here as a query parameter from /auth/callback. */
const CALLBACK_ERRORS: Record<string, string> = {
  "auth-callback":
    "That link has expired or has already been used. Sign in below, or request a new link.",
  "not-configured":
    "Accounts are not available on this deployment yet — Supabase is not configured.",
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const searchParams = await props.searchParams;

  const rawNext = searchParams["next"];
  // `next` is attacker-controlled: it is validated here and again in the
  // action, and can only ever be a site-relative path.
  const next = safeRedirectPath(
    Array.isArray(rawNext) ? rawNext[0] : rawNext,
    "/account",
  );

  const rawError = searchParams["error"];
  const errorKey = Array.isArray(rawError) ? rawError[0] : rawError;
  const errorMessage = errorKey ? CALLBACK_ERRORS[errorKey] : undefined;

  return (
    <AuthFormShell
      title="Welcome back"
      description="Sign in to join the conversation."
      footer={
        <>
          New to The Pet Club?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Create an account
          </Link>
        </>
      }
    >
      {errorMessage ? (
        <p
          role="alert"
          className="mb-5 rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <SignInForm next={next} />
    </AuthFormShell>
  );
}
