"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type SessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  /** Supabase credentials are absent from this deployment. */
  | "unconfigured";

export interface SessionState {
  status: SessionStatus;
  user: User | null;
}

/**
 * Subscribes to the Supabase auth session in the browser.
 *
 * Used only by the header's auth slot. Reading the session on the server in
 * the root layout would opt every page out of static rendering, so the small
 * hydrated island is the deliberate trade: the whole site stays cacheable and
 * one component catches up with the session after hydration.
 *
 * See docs/decisions/0004-client-side-header-auth-state.md.
 */
export function useSupabaseSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    status: isSupabaseConfigured ? "loading" : "unconfigured",
    user: null,
  });

  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }

      setState({
        status: data.user ? "authenticated" : "unauthenticated",
        user: data.user,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        status: session?.user ? "authenticated" : "unauthenticated",
        user: session?.user ?? null,
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}

/** Best-effort display label for a signed-in user, without a profile fetch. */
export function displayNameForUser(user: User): string {
  const metadataName = user.user_metadata?.["display_name"];
  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  const email = user.email;
  if (email) {
    return email.split("@")[0] ?? "Member";
  }

  return "Member";
}
