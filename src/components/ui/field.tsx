import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const controlBaseStyles = [
  "block w-full rounded-md border bg-surface px-3 text-foreground",
  "border-border-strong placeholder:text-foreground-subtle",
  "transition-colors duration-150",
  "focus:border-pine-600 focus:outline-none",
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
  "aria-[invalid=true]:border-danger-600",
].join(" ");

export type InputProps = ComponentPropsWithoutRef<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(controlBaseStyles, "h-11 text-sm", className)}
      {...props}
    />
  );
}

export type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export function Textarea({ className, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(controlBaseStyles, "py-2.5 text-body-sm", className)}
      {...props}
    />
  );
}

export type SelectProps = ComponentPropsWithoutRef<"select">;

/**
 * A native `<select>`.
 *
 * Native is deliberate: it is fully keyboard accessible, screen-reader
 * correct and renders as the platform picker on mobile, none of which a
 * custom listbox gives for free.
 */
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(controlBaseStyles, "h-11 pr-8 text-sm", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export type LabelProps = ComponentPropsWithoutRef<"label">;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export interface FieldProps {
  /** Must match the control's `id`. */
  htmlFor: string;
  label: string;
  /** Supporting text, wired to the control via aria-describedby. */
  hint?: string;
  /** Validation message. Its presence marks the control invalid. */
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Pairs a label, control, hint and error message with the correct `id`
 * relationships, so accessible forms are the default rather than an extra
 * step each caller has to remember.
 *
 * The caller is responsible for setting `id`, `aria-describedby` and
 * `aria-invalid` on the control; `fieldIds()` produces the matching values.
 */
export function Field({ htmlFor, label, hint, error, className, children }: FieldProps) {
  const ids = fieldIds(htmlFor);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? (
        <p id={ids.hintId} className="text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={ids.errorId} className="text-xs font-medium text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Derives the describedby ids used by `Field` for a given control id. */
export function fieldIds(id: string): {
  hintId: string;
  errorId: string;
  describedBy: (options: { hasHint: boolean; hasError: boolean }) => string | undefined;
} {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return {
    hintId,
    errorId,
    describedBy: ({ hasHint, hasError }) => {
      const ids = [hasError ? errorId : null, hasHint && !hasError ? hintId : null].filter(
        (value): value is string => value !== null,
      );

      return ids.length > 0 ? ids.join(" ") : undefined;
    },
  };
}
