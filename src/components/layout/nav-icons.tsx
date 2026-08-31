/**
 * The three glyphs the header needs.
 *
 * Inline SVG rather than an icon package: three paths do not justify a
 * dependency on the critical path, and drawn as `currentColor` at
 * `stroke-width: 1.75` they sit at the same visual weight as the navigation
 * type beside them, which an imported icon set would not.
 */

const BASE = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
} as const;

export function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg {...BASE} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg {...BASE} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
