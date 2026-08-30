/**
 * Canonical Pet Club community taxonomy.
 *
 * This is the single in-code source of truth for forum structure. It drives
 * navigation, the `/community` hub, category routes, `generateStaticParams`
 * and the sitemap.
 *
 * The shape deliberately mirrors the `public.categories` table (a self
 * -referencing parent/child tree with `slug` and `sort_order`), so Milestone 2
 * can swap this constant for a database query without changing any consumer.
 * `supabase/seed.sql` seeds the same taxonomy.
 */

export interface CommunityCategory {
  /** Stable URL slug. Must satisfy `isValidSlug`. */
  slug: string;
  name: string;
  description: string;
}

export interface CommunityCategoryGroup {
  slug: string;
  name: string;
  description: string;
  children: readonly CommunityCategory[];
}

export const communityTaxonomy: readonly CommunityCategoryGroup[] = [
  {
    slug: "dogs",
    name: "Dogs",
    description:
      "Everything dog — from first-week puppy questions to senior care, nutrition and behaviour.",
    children: [
      {
        slug: "general-dog-discussion",
        name: "General Dog Discussion",
        description: "Open conversation about life with dogs in Canada.",
      },
      {
        slug: "puppies",
        name: "Puppies",
        description: "Bringing a puppy home, socialisation, sleep and early routines.",
      },
      {
        slug: "dog-health",
        name: "Dog Health",
        description: "Symptoms, vet visits, preventative care and recovery experiences.",
      },
      {
        slug: "dog-food-and-nutrition",
        name: "Dog Food & Nutrition",
        description: "Kibble, raw, fresh and prescription diets available in Canada.",
      },
      {
        slug: "dog-training-and-behaviour",
        name: "Training & Behaviour",
        description: "Recall, reactivity, crate training and working with Canadian trainers.",
      },
      {
        slug: "dog-breeds",
        name: "Breeds",
        description: "Breed traits, breed-specific care and finding reputable breeders or rescues.",
      },
    ],
  },
  {
    slug: "cats",
    name: "Cats",
    description:
      "Cat care, health and behaviour — for indoor cats, catios and everything in between.",
    children: [
      {
        slug: "general-cat-discussion",
        name: "General Cat Discussion",
        description: "Open conversation about life with cats in Canada.",
      },
      {
        slug: "kittens",
        name: "Kittens",
        description: "Early weeks, litter training, vaccinations and kitten-proofing.",
      },
      {
        slug: "cat-health",
        name: "Cat Health",
        description: "Urinary health, dental care, weight management and vet experiences.",
      },
      {
        slug: "cat-food-and-nutrition",
        name: "Cat Food & Nutrition",
        description: "Wet, dry and prescription diets, plus hydration and feeding routines.",
      },
      {
        slug: "cat-behaviour",
        name: "Behaviour",
        description: "Litter box issues, scratching, enrichment and multi-cat households.",
      },
      {
        slug: "cat-breeds",
        name: "Breeds",
        description: "Breed traits, grooming needs and adopting from Canadian rescues.",
      },
    ],
  },
  {
    slug: "canadian-pet-life",
    name: "Canadian Pet Life",
    description:
      "The Canada-specific side of pet ownership — costs, insurance, products, travel and provincial rules.",
    children: [
      {
        slug: "pet-insurance",
        name: "Pet Insurance",
        description: "Comparing Canadian pet insurance providers, coverage and real claim outcomes.",
      },
      {
        slug: "vet-costs",
        name: "Vet Costs",
        description: "What procedures actually cost across provinces and how to plan for them.",
      },
      {
        slug: "canadian-pet-products",
        name: "Canadian Pet Products",
        description: "Canadian-made and Canada-available food, gear and supplies.",
      },
      {
        slug: "travelling-with-pets",
        name: "Travelling With Pets",
        description: "Flying within Canada, road trips, border crossings and paperwork.",
      },
      {
        slug: "pet-friendly-canada",
        name: "Pet-Friendly Canada",
        description: "Pet-friendly rentals, patios, parks, trails and hotels across the country.",
      },
      {
        slug: "provincial-questions",
        name: "Provincial Questions",
        description: "Bylaws, licensing and province-specific rules for pet owners.",
      },
    ],
  },
  {
    slug: "community",
    name: "Community",
    description: "The social heart of The Pet Club — introductions, photos, stories and memorials.",
    children: [
      {
        slug: "introduce-yourself",
        name: "Introduce Yourself",
        description: "New here? Tell the community about you and your pets.",
      },
      {
        slug: "pet-photos",
        name: "Pet Photos",
        description: "Share photos of your dogs, cats and other companions.",
      },
      {
        slug: "pet-stories",
        name: "Pet Stories",
        description: "Adoption stories, milestones and the moments worth writing down.",
      },
      {
        slug: "memorials",
        name: "Memorials",
        description: "A gentle space to remember the pets we have lost.",
      },
    ],
  },
  {
    slug: "lost-and-found",
    name: "Lost & Found",
    description:
      "Community-powered help for missing pets across Canada. A dedicated Lost & Found tool arrives in a later milestone.",
    children: [
      {
        slug: "lost-dogs",
        name: "Lost Dogs",
        description: "Post a missing dog with the details that help neighbours recognise them.",
      },
      {
        slug: "lost-cats",
        name: "Lost Cats",
        description: "Post a missing cat and coordinate local search efforts.",
      },
      {
        slug: "found-pets",
        name: "Found Pets",
        description: "Found a pet? Post here to help reunite them with their family.",
      },
    ],
  },
] as const;

/** Flattened list of every leaf category, in taxonomy order. */
export const allCommunityCategories: readonly CommunityCategory[] = communityTaxonomy.flatMap(
  (group) => group.children,
);

/** Path to the `/community` hub. */
export const COMMUNITY_BASE_PATH = "/community";

/** Builds the route for a leaf category. */
export function communityCategoryPath(slug: string): string {
  return `${COMMUNITY_BASE_PATH}/${slug}`;
}

/** Finds a leaf category and its parent group by slug, or `null`. */
export function findCommunityCategory(
  slug: string,
): { group: CommunityCategoryGroup; category: CommunityCategory } | null {
  for (const group of communityTaxonomy) {
    const category = group.children.find((child) => child.slug === slug);
    if (category) {
      return { group, category };
    }
  }

  return null;
}

/** Finds a top-level group by slug, or `null`. */
export function findCommunityGroup(slug: string): CommunityCategoryGroup | null {
  return communityTaxonomy.find((group) => group.slug === slug) ?? null;
}
