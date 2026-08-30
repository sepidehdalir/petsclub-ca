"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

export interface DropdownProps {
  /** Rendered inside the trigger button. */
  trigger: ReactNode;
  /** Accessible name for the trigger. */
  triggerLabel: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  /** Menu contents. Use `DropdownItem` / `DropdownLink` for focusable rows. */
  children: ReactNode;
}

/**
 * A small, dependency-free dropdown menu.
 *
 * Implements the parts of the ARIA menu-button pattern that actually matter
 * for a short navigation menu: `aria-expanded` / `aria-haspopup` on the
 * trigger, Escape to close with focus returned to the trigger, click-outside
 * dismissal, and roving focus through the items with the arrow keys.
 *
 * Items are plain links and buttons rather than `role="menuitem"`, because
 * they navigate and submit like ordinary controls; overriding their roles
 * would remove behaviour screen-reader users expect without adding any.
 */
export function Dropdown({
  trigger,
  triggerLabel,
  className,
  triggerClassName,
  menuClassName,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close(true);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  function focusItem(offset: number) {
    const items = containerRef.current?.querySelectorAll<HTMLElement>("[data-dropdown-item]");
    if (!items || items.length === 0) {
      return;
    }

    const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement);
    const nextIndex =
      currentIndex === -1
        ? offset > 0
          ? 0
          : items.length - 1
        : (currentIndex + offset + items.length) % items.length;

    items[nextIndex]?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            // Wait for the menu to mount before moving focus into it.
            requestAnimationFrame(() => focusItem(1));
          }
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
          "text-foreground transition-colors hover:bg-surface-muted",
          triggerClassName,
        )}
      >
        {trigger}
      </button>

      {open ? (
        <div
          id={menuId}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              focusItem(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              focusItem(-1);
            }
          }}
          className={cn(
            "absolute right-0 z-50 mt-2 min-w-52 overflow-hidden rounded-card",
            "border border-border bg-surface py-1 shadow-lg",
            menuClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

const itemStyles =
  "block w-full px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:outline-none";

export function DropdownItem({ className, ...props }: ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" data-dropdown-item className={cn(itemStyles, className)} {...props} />
  );
}

export function DropdownLink({ className, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return <Link data-dropdown-item className={cn(itemStyles, className)} {...props} />;
}

export function DropdownSeparator() {
  return <hr className="my-1 border-border" />;
}
