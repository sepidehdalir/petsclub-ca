"use client";

import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Dropdown, DropdownItem, DropdownLink, DropdownSeparator } from "@/components/ui/dropdown";
import {
  displayNameForUser,
  useSupabaseSession,
} from "@/features/auth/hooks/use-supabase-session";

/**
 * Header auth slot.
 *
 * Renders a fixed-width region in every state so resolving the session cannot
 * shift the header layout.
 */
export function AuthNav() {
  const { status, user } = useSupabaseSession();

  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-20 animate-pulse rounded-md bg-surface-muted"
      />
    );
  }

  if (status === "authenticated" && user) {
    const name = displayNameForUser(user);

    return (
      <Dropdown
        triggerLabel={`Account menu for ${name}`}
        trigger={
          <>
            <Avatar name={name} size="sm" />
            <span className="hidden max-w-28 truncate sm:inline">{name}</span>
          </>
        }
      >
        <DropdownLink href="/account">Your account</DropdownLink>
        <DropdownLink href="/community">Community</DropdownLink>
        <DropdownSeparator />
        {/*
          A real form POST rather than a click handler, so signing out works
          even if this island has not hydrated. The route handler clears the
          session cookies server-side.
        */}
        <form action="/auth/sign-out" method="post">
          <DropdownItem type="submit">Sign out</DropdownItem>
        </form>
      </Dropdown>
    );
  }

  return (
    <ButtonLink href="/sign-in" variant="ghost" size="sm" className="whitespace-nowrap">
      Sign in
    </ButtonLink>
  );
}
