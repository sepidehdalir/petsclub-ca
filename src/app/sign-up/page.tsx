import type { Metadata } from "next";
import Link from "next/link";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Create an account",
  description: "Join The Pet Club — Canada's community for pet parents.",
  path: "/sign-up",
  robots: "private-noindex",
});

export default function SignUpPage() {
  return (
    <AuthFormShell
      title="Join The Pet Club"
      description="Your people are here. Create your Pet Club account to share stories and join the conversation."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthFormShell>
  );
}
