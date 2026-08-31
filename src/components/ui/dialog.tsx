"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  /** Applied to the `<dialog>`, so a trigger can point `aria-controls` at it. */
  id?: string;
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  title: string;
  /** Hides the title visually while keeping it for assistive technology. */
  hideTitle?: boolean;
  /** Applied to the `<dialog>` element, e.g. to render it as a side drawer. */
  className?: string;
  children: ReactNode;
}

/**
 * Modal dialog built on the native `<dialog>` element.
 *
 * Using the platform element rather than a hand-rolled overlay means focus
 * trapping, Escape-to-close, background inertness and the top-layer stacking
 * context all come from the browser and stay correct. The only behaviour
 * added here is backdrop-click dismissal and background scroll locking, which
 * `showModal()` does not cover consistently.
 */
export function Dialog({
  id,
  open,
  onClose,
  title,
  hideTitle = false,
  className,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      id={id}
      ref={dialogRef}
      aria-label={hideTitle ? title : undefined}
      aria-labelledby={hideTitle ? undefined : "dialog-title"}
      // Fired by Escape as well as by close(), so this is the single exit path.
      onClose={onClose}
      onClick={(event) => {
        // Clicks that land on the dialog element itself are backdrop clicks;
        // anything inside the content wrapper stops here.
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className={cn(
        "backdrop:bg-ink-900/40 open:flex",
        "border border-border bg-surface p-0 text-foreground shadow-xl",
        className,
      )}
    >
      <div className="flex h-full w-full flex-col">
        {hideTitle ? null : (
          <h2 id="dialog-title" className="sr-only">
            {title}
          </h2>
        )}
        {children}
      </div>
    </dialog>
  );
}
