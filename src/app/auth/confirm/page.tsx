import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { ConfirmForm } from "@/features/auth/components/confirm-form";
import {
  emailOtpTypeSchema,
  safeRedirectPath,
  tokenHashSchema,
  type EmailOtpTypeValue,
} from "@/features/auth/schemas";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Confirm your email",
  description: "Finish confirming your email address.",
  path: "/auth/confirm",
  noIndex: true,
});

// Carries a single-use token in the query string; it must never be cached or
// prerendered, and each request is distinct.
export const dynamic = "force-dynamic";

/** A query parameter arrives as `string | string[] | undefined`. */
function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

/** Per-flow wording. The token type decides what the person is actually doing. */
const COPY: Record<
  EmailOtpTypeValue,
  { title: string; description: string; submit: string; pending: string }
> = {
  signup: {
    title: "Confirm your email",
    description:
      "One last step. Press the button below to confirm your address and finish setting up your account.",
    submit: "Confirm my email",
    pending: "Confirming…",
  },
  recovery: {
    title: "Reset your password",
    description:
      "Press the button below to continue, and you will be able to choose a new password.",
    submit: "Continue",
    pending: "Verifying…",
  },
  invite: {
    title: "Accept your invitation",
    description: "Press the button below to accept the invitation and set up your account.",
    submit: "Accept invitation",
    pending: "Accepting…",
  },
  magiclink: {
    title: "Finish signing in",
    description: "Press the button below to complete your sign-in.",
    submit: "Sign me in",
    pending: "Signing in…",
  },
  email_change: {
    title: "Confirm your new email",
    description: "Press the button below to confirm the change to your email address.",
    submit: "Confirm the change",
    pending: "Confirming…",
  },
  email: {
    title: "Confirm your email",
    description: "Press the button below to confirm your email address.",
    submit: "Confirm my email",
    pending: "Confirming…",
  },
};

/**
 * Scanner-safe confirmation step.
 *
 * **This page redeems nothing.** It reads the token from the query string and
 * renders a button; only submitting that button runs `confirmEmailAction`,
 * which is where `verifyOtp` is finally called.
 *
 * The reason is that one-time tokens sent by email get spent by machines.
 * Mail providers and corporate security appliances prefetch links to scan them
 * for malware, and any endpoint that redeems a token on GET redeems it for the
 * scanner. The person then follows a link that has already been used and is
 * told it expired — which is exactly what happened to this project's first
 * production signup, roughly 19 seconds after the email was sent, with no
 * session ever created.
 *
 * A GET here is therefore side-effect free. Prefetch it as often as you like.
 */
export default async function ConfirmPage(props: PageProps<"/auth/confirm">) {
  const searchParams = await props.searchParams;

  const parsedToken = tokenHashSchema.safeParse(firstValue(searchParams["token_hash"]));
  const parsedType = emailOtpTypeSchema.safeParse(firstValue(searchParams["type"]));

  // `next` is filtered here as well as in the action, so a tampered link cannot
  // even render a button pointing off-site.
  const next = safeRedirectPath(firstValue(searchParams["next"]), "/account");

  if (!parsedToken.success || !parsedType.success) {
    return (
      <AuthFormShell
        title="That link is not valid"
        description="The link may have been copied incompletely, or it may have been altered in transit."
        footer={
          <>
            Need a new one?{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
            >
              Request another email
            </Link>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-foreground-muted">
            Open the most recent email we sent you and follow the link there. If it keeps
            failing, request a fresh one — links are single-use and expire.
          </p>
          <ButtonLink href="/sign-in" className="w-full justify-center">
            Back to sign in
          </ButtonLink>
        </div>
      </AuthFormShell>
    );
  }

  const copy = COPY[parsedType.data];

  return (
    <AuthFormShell title={copy.title} description={copy.description}>
      <ConfirmForm
        tokenHash={parsedToken.data}
        type={parsedType.data}
        next={next}
        submitLabel={copy.submit}
        pendingLabel={copy.pending}
      />
    </AuthFormShell>
  );
}
