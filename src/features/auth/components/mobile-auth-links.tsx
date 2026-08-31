"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import {
  displayNameForUser,
  useSupabaseSession,
} from "@/features/auth/hooks/use-supabase-session";

export interface MobileAuthLinksProps {
  /** Closes the drawer when a link inside it navigates. */
  onNavigate: () => void;
}

/**
 * The account block at the foot of the mobile drawer.
 *
 * Reads the same session hook as the header's `AuthNav` and changes nothing
 * about how auth works: signing out is still the plain form POST to
 * `/auth/sign-out`, so it succeeds whether or not this island has hydrated.
 *
 * The drawer gets its own component rather than reusing `AuthNav` because the
 * two want opposite shapes — a compact dropdown in a 64px bar, and full-width
 * rows with real tap targets in a sheet.
 */
export function MobileAuthLinks({ onNavigate }: MobileAuthLinksProps) {
  const { status, user } = useSupabaseSession();

  if (status === "loading") {
    return <div aria-hidden="true" className="h-11 w-full animate-pulse rounded-xs bg-surface-muted" />;
  }

  if (status === "authenticated" && user) {
    const name = displayNameForUser(user);

    return (
      <div className="space-y-3">
        <Link
          href="/account"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xs py-1 text-ui text-foreground transition-colors hover:text-pine-800"
        >
          <Avatar name={name} size="sm" />
          <span className="min-w-0 flex-1 truncate">{name}</span>
          <span className="text-caption text-foreground-subtle">Your account</span>
        </Link>

        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="inline-flex h-11 items-center border-b border-pine-700/35 text-ui text-foreground-muted transition-colors hover:border-pine-800 hover:text-pine-900"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <ButtonLink href="/sign-in" variant="editorial" onClick={onNavigate}>
        Sign in
      </ButtonLink>
      <ButtonLink href="/sign-up" variant="editorialQuiet" onClick={onNavigate}>
        Create an account
      </ButtonLink>
    </div>
  );
}
