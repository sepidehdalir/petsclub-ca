import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/urls";

/**
 * Schema.org structured data builders.
 *
 * Design rule for this milestone: **only emit structured data that accurately
 * describes content that actually exists.** `Organization`, `WebSite` and
 * `BreadcrumbList` describe the real site. `Article` is emitted by
 * `/guides/[slug]`, where there are now real articles to describe. The
 * `DiscussionForumPosting` and `ProfilePage` builders remain the typed
 * contracts that Milestones 2 and 4 will use once real threads and member
 * profiles exist; they are deliberately not emitted yet.
 *
 * `SearchAction` is likewise omitted from `WebSite` until site search is a
 * working endpoint — advertising a search target that cannot answer queries
 * would be inaccurate markup.
 */

/**
 * A JSON-LD node. Values are constrained to JSON-serialisable data; `unknown`
 * keeps the structure open without resorting to `any`.
 */
export type JsonLdSchema = Record<string, unknown>;

const SCHEMA_CONTEXT = "https://schema.org";

export function organizationSchema(): JsonLdSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.tagline,
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
  };
}

export function webSiteSchema(): JsonLdSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path. */
  path: string;
}

export function breadcrumbListSchema(items: readonly BreadcrumbItem[]): JsonLdSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  path: string;
  /** ISO date. */
  datePublished: string;
  /** ISO date. Defaults to `datePublished`. */
  dateModified?: string;
  /**
   * The byline, and what kind of entity it is.
   *
   * A house byline is an `Organization` and a named writer is a `Person`.
   * The distinction is not decoration: describing a team as a Person is a
   * false claim about who stands behind the article, made in the one place a
   * reader will never look. `features/editorial/authors.ts` is the source.
   */
  author: { name: string; kind: "Person" | "Organization" };
  /** Section label, e.g. "Dogs". */
  section?: string;
  /** Site-relative or absolute URL of the lead image. */
  imagePath?: string;
  /**
   * A named professional who actually reviewed the article.
   *
   * Optional, and there is no default. `reviewedBy` is a claim of expert
   * scrutiny; it is emitted only when a real, named, licensed reviewer is on
   * record for this article.
   */
  reviewer?: { name: string; credentials: string };
}

/**
 * `Article` structured data for an editorial guide.
 *
 * Emitted by `/guides/[slug]`. Every field is derived from the typed article
 * record, so the markup a crawler reads is generated from the same data as the
 * byline a person reads and the two cannot disagree.
 */
export function articleSchema(input: ArticleSchemaInput): JsonLdSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: siteConfig.language,
    author: { "@type": input.author.kind, name: input.author.name },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.imagePath ? { image: absoluteUrl(input.imagePath) } : {}),
    ...(input.reviewer
      ? {
          reviewedBy: {
            "@type": "Person",
            name: input.reviewer.name,
            honorificSuffix: input.reviewer.credentials,
          },
        }
      : {}),
  };
}

export interface DiscussionForumPostingSchemaInput {
  headline: string;
  text: string;
  path: string;
  datePublished: string;
  authorName: string;
  replyCount: number;
}

/** Reserved for Milestone 2 (Community Engine). Not emitted yet. */
export function discussionForumPostingSchema(
  input: DiscussionForumPostingSchemaInput,
): JsonLdSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "DiscussionForumPosting",
    headline: input.headline,
    text: input.text,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    inLanguage: siteConfig.language,
    author: { "@type": "Person", name: input.authorName },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: input.replyCount,
    },
  };
}

export interface ProfilePageSchemaInput {
  displayName: string;
  path: string;
  dateCreated: string;
  description?: string;
}

/** Reserved for Milestone 4 (Member and Pet Profiles). Not emitted yet. */
export function profilePageSchema(input: ProfilePageSchemaInput): JsonLdSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ProfilePage",
    url: absoluteUrl(input.path),
    dateCreated: input.dateCreated,
    mainEntity: {
      "@type": "Person",
      name: input.displayName,
      ...(input.description ? { description: input.description } : {}),
    },
  };
}
