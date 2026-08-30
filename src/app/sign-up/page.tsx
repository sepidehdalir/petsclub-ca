import type { Metadata } from "next";
import Link from "next/link";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Create an account",
  description: "Join PetsClub — Canada's community for pet parents.",
  path: "/sign-up",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <AuthFormShell
      title="Join PetsClub"
      description="Ask questions, share what worked, and follow the topics you care about."
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
