import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("space-y-1.5 p-5 pb-0", className)} {...props} />;
}

export function CardBody({ className, ...props }: CardProps) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-border p-5", className)}
      {...props}
    />
  );
}

export interface LinkCardProps {
  href: string;
  /** Rendered as the card's accessible name and visible heading. */
  title: string;
  description?: string;
  /** Small label above the title, e.g. a category name. */
  eyebrow?: string;
  /** Metadata row rendered under the description. */
  footer?: ReactNode;
  /** Heading level, so cards slot into the page outline correctly. */
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
}

/**
 * A card whose entire surface is a single link.
 *
 * Implemented with one stretched anchor around the title rather than nested
 * or duplicated links: screen readers announce exactly one link with the
 * title as its name, while the pointer target covers the whole card.
 */
export function LinkCard({
  href,
  title,
  description,
  eyebrow,
  footer,
  headingLevel: Heading = "h3",
  className,
}: LinkCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex flex-col transition-colors duration-150",
        "hover:border-border-strong focus-within:border-pine-600",
        className,
      )}
    >
      <CardBody className="flex flex-1 flex-col gap-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-pine-700">
            {eyebrow}
          </p>
        ) : null}

        <Heading className="text-lg font-semibold leading-snug text-foreground">
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
            {title}
          </Link>
        </Heading>

        {description ? (
          <p className="text-sm leading-relaxed text-foreground-muted">{description}</p>
        ) : null}

        {footer ? <div className="mt-auto pt-3">{footer}</div> : null}
      </CardBody>
    </Card>
  );
}
