"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

import { CloseIcon, MenuIcon, SearchIcon } from "@/components/layout/nav-icons";
import { NavLink } from "@/components/layout/nav-link";
import { Wordmark } from "@/components/layout/wordmark";
import { Dialog } from "@/components/ui/dialog";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { MobileAuthLinks } from "@/features/auth/components/mobile-auth-links";

/**
 * The menu below `lg`.
 *
 * Built on the native `<dialog>` via `Dialog`, so focus trapping, Escape, the
 * top-layer stacking context and background inertness are the platform's job
 * rather than hand-written key handlers — which is also why there is no focus
 * library here and no `keydown` listener to get wrong.
 *
 * It is laid out as a publication's contents page rather than a settings
 * drawer: search at the top where a reader reaches for it, the six sections
 * set large in the serif with a hairline between each, then the two services,
 * then the account. One level deep throughout — no accordions, nothing that
 * has to be opened before it can be read.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [renderedPath, setRenderedPath] = useState(pathname);
  const panelId = useId();

  // Close on navigation, so browser back/forward cannot leave the drawer
  // covering the page underneath. Adjusting state during render rather than in
  // an effect avoids a cascading second render — see
  // https://react.dev/learn/you-might-not-need-an-effect
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xs text-foreground transition-colors hover:bg-surface-muted lg:hidden"
      >
        <MenuIcon />
      </button>

      <Dialog
        id={panelId}
        open={open}
        onClose={close}
        title="Menu"
        hideTitle
        // Full bleed on a phone: at 390px a partial sheet leaves a strip of
        // dimmed page that reads as an accident rather than a choice. It
        // becomes a right-hand drawer once there is room for one.
        className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-none rounded-none border-y-0 border-r-0 sm:w-[26rem]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border pl-4 pr-2">
          <Link href="/" onClick={close} aria-label={`${siteConfig.name} — home`}>
            <Wordmark />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xs text-foreground transition-colors hover:bg-surface-muted"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-5">
          {/*
            Shaped like the field it leads to. A reader looking for search
            looks for a box, and /search is a real page, so this stays a plain
            link — no input in the drawer that would need its own state, its
            own submit path and its own focus management.
          */}
          <Link
            href="/search"
            onClick={close}
            className="flex h-12 items-center gap-3 rounded-xs border border-border-strong px-3.5 text-ui text-foreground-subtle transition-colors hover:border-pine-700 hover:text-foreground"
          >
            <SearchIcon className="h-[1.125rem] w-[1.125rem]" />
            <span>Search {siteConfig.name}</span>
          </Link>

          <nav aria-label="Sections" className="mt-7">
            <ul className="-mt-px">
              {primaryNavigation.map((item) => (
                <li key={item.href} className="border-t border-border">
                  <NavLink
                    href={item.href}
                    onNavigate={close}
                    className="flex min-h-14 items-center py-3 font-serif text-title-2 text-foreground transition-colors hover:text-pine-800"
                    activeClassName="text-pine-800"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More" className="mt-7 border-t border-border pt-5">
            <ul className="space-y-1">
              {secondaryNavigation.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    onNavigate={close}
                    className="flex min-h-11 items-center text-ui text-foreground-muted transition-colors hover:text-foreground"
                    activeClassName="text-pine-800"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-7 border-t border-border pt-5">
            <MobileAuthLinks onNavigate={close} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
