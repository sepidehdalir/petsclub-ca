import Image from "next/image";

import { cn } from "@/lib/utils/cn";

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 64,
} as const;

export type AvatarSize = keyof typeof SIZE_PX;

/**
 * Derives up to two initials from a display name.
 *
 * Pure and exported so the fallback rendering is unit-testable and stable
 * between server and client.
 */
export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  const first = words[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1] ?? "") : "";
  const initials = `${first.charAt(0)}${last.charAt(0)}`;

  return initials.toUpperCase() || "?";
}

export interface AvatarProps {
  /** Display name — used for initials and for the image alt text. */
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const px = SIZE_PX[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-pine-100 font-medium text-pine-800 select-none",
        size === "lg" ? "text-lg" : "text-xs",
        className,
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${name}'s profile photo`}
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      ) : (
        // The initials are decorative: the accessible name always comes from
        // the surrounding link or heading, so announcing them would be noise.
        <span aria-hidden="true">{initialsFromName(name)}</span>
      )}
    </span>
  );
}
