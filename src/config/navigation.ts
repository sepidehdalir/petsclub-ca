/**
 * Application navigation model.
 *
 * Header and footer render from these structures rather than hard-coded JSX,
 * so desktop navigation, mobile navigation and the sitemap can never drift
 * apart.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Short supporting line, used in the mobile drawer and mega-menu contexts. */
  description?: string;
}

export interface NavGroup {
  title: string;
  items: readonly NavItem[];
}

/** Primary desktop navigation. */
export const primaryNavigation: readonly NavItem[] = [
  {
    label: "Community",
    href: "/community",
    description: "Forums for Canadian pet parents",
  },
  { label: "Dogs", href: "/dogs", description: "Care, training and nutrition" },
  { label: "Cats", href: "/cats", description: "Care, behaviour and nutrition" },
  { label: "Health", href: "/health", description: "Symptoms, vets and prevention" },
  { label: "Food", href: "/food", description: "Diets and Canadian brands" },
  { label: "Training", href: "/training", description: "Behaviour and everyday skills" },
  { label: "Canada Guides", href: "/guides", description: "Costs, insurance and local life" },
  { label: "Lost & Found", href: "/lost-found", description: "Help reunite missing pets" },
] as const;

/** Structured footer navigation. */
export const footerNavigation: readonly NavGroup[] = [
  {
    title: "Explore",
    items: [
      { label: "Dogs", href: "/dogs" },
      { label: "Cats", href: "/cats" },
      { label: "Health", href: "/health" },
      { label: "Food", href: "/food" },
      { label: "Training", href: "/training" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "All discussions", href: "/community" },
      { label: "Introduce yourself", href: "/community/introduce-yourself" },
      { label: "Pet photos", href: "/community/pet-photos" },
      { label: "Lost & Found", href: "/lost-found" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Canada guides", href: "/guides" },
      { label: "Pet insurance", href: "/community/pet-insurance" },
      { label: "Vet costs", href: "/community/vet-costs" },
      { label: "Pet-friendly Canada", href: "/community/pet-friendly-canada" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Community guidelines", href: "/community-guidelines" },
      { label: "Editorial policy", href: "/editorial-policy" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of use", href: "/terms-of-use" },
      { label: "Advertising disclosure", href: "/advertising-disclosure" },
    ],
  },
] as const;

/**
 * Topic landing pages that exist as standalone editorial sections.
 * Used by the sitemap and by the "explore" surfaces.
 */
export const topicRoutes: readonly string[] = [
  "/dogs",
  "/cats",
  "/health",
  "/food",
  "/training",
  "/guides",
  "/lost-found",
] as const;

/** Static informational routes that should be indexed. */
export const informationalRoutes: readonly string[] = [
  "/about",
  "/contact",
  "/community-guidelines",
  "/editorial-policy",
  "/privacy-policy",
  "/terms-of-use",
  "/advertising-disclosure",
] as const;
