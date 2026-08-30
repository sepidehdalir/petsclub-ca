"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { NavLink } from "@/components/layout/nav-link";
import { Wordmark } from "@/components/layout/wordmark";
import { ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { primaryNavigation } from "@/config/navigation";

/**
 * Mobile and tablet navigation drawer.
 *
 * Rendered as a modal `<dialog>` so focus trapping, Escape-to-close and
 * background inertness come from the platform rather than from hand-written
 * key handlers.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [renderedPath, setRenderedPath] = useState(pathname);

  // Close on navigation, so browser back/forward cannot leave the drawer
  // covering the page underneath. Adjusting state during render rather than in
  // an effect avoids a cascading second render — see
  // https://react.dev/learn/you-might-not-need-an-effect
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open navigation menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-muted xl:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="h-5 w-5"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Site navigation"
        hideTitle
        className="m-0 ml-auto h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none rounded-none border-y-0 border-r-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Wordmark className="text-lg" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-muted"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  onNavigate={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-muted"
                  activeClassName="bg-pine-50 text-pine-800"
                >
                  {item.label}
                  {item.description ? (
                    <span className="mt-0.5 block text-sm font-normal text-foreground-muted">
                      {item.description}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-border px-4 py-4">
          <ButtonLink href="/community" fullWidth onClick={() => setOpen(false)}>
            Ask the Community
          </ButtonLink>
          <ButtonLink
            href="/search"
            variant="secondary"
            fullWidth
            onClick={() => setOpen(false)}
          >
            Search
          </ButtonLink>
        </div>
      </Dialog>
    </>
  );
}
