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
        /**
         * Section-front calls to action.
         *
         * The generic `primary`/`secondary` pair is right for a form, where a
         * button should look like a control. At the head of an editorial page
         * it looks like software dropped onto a page of type. These two are
         * the same actions rendered as editorial ones: a squared pine block
         * that matches the media radius, and a ruled link that carries no box
         * at all. Both keep the 44px target the `md` size gives them.
         */
        editorial:
          "rounded-xs bg-pine-800 text-white tracking-[0.01em] hover:bg-pine-900 active:bg-pine-900",
        editorialQuiet: [
          "rounded-none border-b border-pine-700/35 text-foreground",
          "hover:border-pine-800 hover:text-pine-900",
        ],
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
    // The rule must sit under the words, so the quiet variant drops the
    // horizontal padding every size otherwise carries. It has to be a
    // compound variant rather than a class on the variant itself: `cn` runs
    // tailwind-merge over the finished string, and cva emits `size` after
    // `variant`, so a `px-0` there would simply lose to the size's `px-5`.
    // Vertical height, and therefore the tap target, is untouched.
    compoundVariants: [{ variant: "editorialQuiet", class: "px-0" }],
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
