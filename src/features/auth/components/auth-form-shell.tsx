import Link from "next/link";
import type { ReactNode } from "react";

import { Wordmark } from "@/components/layout/wordmark";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/layout-primitives";
import { isSupabaseConfigured } from "@/lib/env/public";

export interface AuthFormShellProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Rendered under the card, e.g. a link to the opposite flow. */
  footer?: ReactNode;
}

/**
 * Shared frame for the four authentication screens.
 *
 * When Supabase credentials are absent the shell states that plainly instead
 * of rendering a form that cannot work. Silently failing forms are worse than
 * an honest banner, and this is the state a fresh clone of the repository is
 * in before `.env.local` is filled in.
 */
export function AuthFormShell({ title, description, children, footer }: AuthFormShellProps) {
  return (
    <Section spacing="default">
      <Container width="prose" className="max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex rounded-md" aria-label="PetsClub.ca — home">
            <Wordmark className="text-2xl" />
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 text-base leading-relaxed text-foreground-muted">{description}</p>
        </div>

        {!isSupabaseConfigured ? (
          <div
            role="note"
            className="mt-8 rounded-card border border-clay-200 bg-clay-50 px-5 py-4 text-sm leading-relaxed text-clay-700"
          >
            <strong className="font-semibold">Accounts are not enabled here.</strong> This
            deployment has no Supabase credentials configured, so sign-up and sign-in cannot
            work. The interface below is fully built — see the README for the environment
            variables it needs.
          </div>
        ) : null}

        <Card className="mt-8">
          <CardBody className="p-6 sm:p-8">{children}</CardBody>
        </Card>

        {footer ? (
          <div className="mt-6 text-center text-sm text-foreground-muted">{footer}</div>
        ) : null}
      </Container>
    </Section>
  );
}
