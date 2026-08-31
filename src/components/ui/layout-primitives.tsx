import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const CONTAINER_WIDTHS = {
  /** Long-form reading measure. */
  prose: "max-w-3xl",
  /** Default application width. */
  default: "max-w-6xl",
  /** Wide marketing/grid sections on large desktops. */
  wide: "max-w-7xl",
} as const;

export interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  width?: keyof typeof CONTAINER_WIDTHS;
}

/** Horizontal page gutter and max width. The only place either is defined. */
export function Container({ className, width = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", CONTAINER_WIDTHS[width], className)}
      {...props}
    />
  );
}

export interface SectionProps {
  /** Landmark element. Defaults to `section`. */
  as?: ElementType;
  /** Vertical rhythm. */
  spacing?: "compact" | "default" | "spacious";
  /** Applies the muted surface tint behind the full-bleed section. */
  tone?: "canvas" | "muted";
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

const SECTION_SPACING = {
  compact: "py-10 sm:py-12",
  default: "py-14 sm:py-16 lg:py-20",
  spacious: "py-16 sm:py-20 lg:py-28",
} as const;

/** A full-bleed vertical band. Pair with `Container` for the inner width. */
export function Section({
  as: Component = "section",
  spacing = "default",
  tone = "canvas",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(
        SECTION_SPACING[spacing],
        tone === "muted" && "bg-surface-muted",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Small label above the title. */
  eyebrow?: string;
  /** Action rendered on the right at desktop widths. */
  action?: ReactNode;
  /** Required when the parent section uses aria-labelledby. */
  id?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function SectionHeading({
  title,
  description,
  eyebrow,
  action,
  id,
  headingLevel: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-label uppercase text-pine-700">
            {eyebrow}
          </p>
        ) : null}
        <Heading id={id} className="text-title-2 text-foreground sm:text-title-1">
          {title}
        </Heading>
        {description ? (
          <p className="text-body text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
