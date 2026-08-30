import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/cn";

const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md font-medium",
    "transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-55",
    // 44px minimum touch target on the default size (see `size` variants).
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        primary: "bg-pine-700 text-white hover:bg-pine-800 active:bg-pine-900",
        secondary:
          "bg-surface text-foreground border border-border-strong hover:bg-surface-muted",
        ghost: "text-foreground hover:bg-surface-muted",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
        link: "text-pine-700 underline underline-offset-4 hover:text-pine-900",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonStyles>;

export type ButtonProps = ComponentPropsWithoutRef<"button"> & ButtonVariants;

export function Button({
  className,
  variant,
  size,
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}

export type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & ButtonVariants;

/**
 * A link styled as a button.
 *
 * Kept distinct from `Button` on purpose: navigation must render an anchor so
 * that middle-click, "open in new tab" and assistive technology all behave
 * correctly. A `<button>` with an onClick router push would break all three.
 */
export function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}

export { buttonStyles };
