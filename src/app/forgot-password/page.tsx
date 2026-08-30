import type { Metadata } from "next";
import Link from "next/link";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Reset your password",
  description: "Request a password reset link for your PetsClub account.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      title="Reset your password"
      description="Enter your email address and we will send you a link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
