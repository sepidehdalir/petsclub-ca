import type { Metadata } from "next";
import Link from "next/link";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Set a new password",
  description: "Choose a new password for your Pet Club account.",
  path: "/reset-password",
  noIndex: true,
});

/**
 * Reached from the emailed recovery link, which passes through
 * `/auth/callback` first — that route exchanges the one-time code for a
 * session before redirecting here.
 *
 * The page does not gate on the session itself. `resetPasswordAction`
 * re-checks it server-side before touching the password, so the security
 * decision is made in one place rather than duplicated in the view.
 */
export default function ResetPasswordPage() {
  return (
    <AuthFormShell
      title="Set a new password"
      description="Choose a new password for your account. You will stay signed in on this device."
      footer={
        <>
          Link expired?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Request a new one
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthFormShell>
  );
}
