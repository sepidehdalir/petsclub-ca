import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Call to action, typically a `ButtonLink`. */
  action?: ReactNode;
  className?: string;
}

/** Shown when a surface has no content yet — never a blank region. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-border-strong bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export interface LoadingStateProps {
  /** Announced to assistive technology while content is pending. */
  label?: string;
  className?: string;
}

/**
 * Skeleton placeholder for a pending region.
 *
 * `aria-busy` plus a visually hidden label means screen readers hear "Loading
 * discussions" rather than nothing at all, and the fixed block heights keep
 * cumulative layout shift at zero when content arrives.
 */
export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("space-y-3", className)}
    >
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-20 animate-pulse rounded-card border border-border bg-surface-muted"
        />
      ))}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * User-facing failure message.
 *
 * Deliberately generic: internal error details and stack traces are logged on
 * the server and never rendered to the visitor.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again in a moment.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-card border border-danger-200 bg-danger-50 px-6 py-8 text-center",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-danger-700">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground-muted">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
