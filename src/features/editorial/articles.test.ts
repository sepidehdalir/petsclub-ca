import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { findCommunityCategory } from "@/features/community/taxonomy";
import {
  allArticleSections,
  articleDescription,
  articlePath,
  articles,
  articlesForSurface,
  findArticle,
  getArticleSection,
  publishedArticles,
  relatedArticles,
  type Article,
} from "@/features/editorial/articles";
import { allReviewers, findReviewer, getAuthor } from "@/features/editorial/authors";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { absoluteUrl } from "@/lib/seo/urls";
import { isValidSlug } from "@/lib/utils/slug";

const CONTENT_DIR = fileURLToPath(new URL("../../content/articles/", import.meta.url));

function bodyPath(slug: string): string {
  return `${CONTENT_DIR}${slug}.mdx`;
}

function readBody(article: Article): string {
  return readFileSync(bodyPath(article.slug), "utf8");
}

/**
 * Prose word count, for the reading-time check.
 *
 * JSX tags, import lines and the contents of code fences are stripped, so what
 * is counted is what a reader actually reads rather than the file's length.
 */
function countWords(source: string): number {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^import .*$/gm, " ")
    .split(/\s+/)
    .filter((word) => /[a-zA-Z0-9]/.test(word)).length;
}

describe("article registry", () => {
  it("gives every article a valid, unique slug and the canonical /guides path", () => {
    const slugs = articles.map((article) => article.slug);

    for (const article of articles) {
      expect(isValidSlug(article.slug), `${article.slug}: not a valid slug`).toBe(true);
      expect(articlePath(article.slug)).toBe(`/guides/${article.slug}`);
      expect(findArticle(article.slug)).toBe(article);
    }

    expect(new Set(slugs).size, `duplicate slug in ${slugs.join(", ")}`).toBe(slugs.length);
  });

  it("pairs every article with a body file, and every body file with an article", () => {
    for (const article of articles) {
      expect(
        existsSync(bodyPath(article.slug)),
        `${article.slug}: no body at content/articles/${article.slug}.mdx`,
      ).toBe(true);
    }

    // The reverse direction matters just as much: an `.mdx` file with no
    // registry entry has no route, no metadata and no byline, and would sit in
    // the repository looking published.
    const orphans = readdirSync(CONTENT_DIR)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""))
      .filter((slug) => findArticle(slug) === null);

    expect(orphans, `content files with no registry entry: ${orphans.join(", ")}`).toEqual([]);
  });

  it("states a reading time that matches the article that was written", () => {
    // A stated reading time is a small promise, and it is the kind that rots
    // silently when an article is edited. Tolerance is one minute either way.
    for (const article of articles) {
      const words = countWords(readBody(article));
      const actual = Math.max(1, Math.round(words / 225));

      expect(
        Math.abs(article.readingMinutes - actual),
        `${article.slug}: states ${article.readingMinutes} min, body is ${words} words (~${actual} min)`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("carries sane, ordered dates", () => {
    for (const article of articles) {
      for (const [field, value] of [
        ["publishedAt", article.publishedAt],
        ["updatedAt", article.updatedAt],
      ] as const) {
        expect(value, `${article.slug}: ${field} must be YYYY-MM-DD`).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        );
        expect(
          Number.isNaN(new Date(value).getTime()),
          `${article.slug}: ${field} is not a real date`,
        ).toBe(false);
      }

      expect(
        article.updatedAt >= article.publishedAt,
        `${article.slug}: updated before it was published`,
      ).toBe(true);
    }
  });

  it("resolves every internal reference", () => {
    for (const article of articles) {
      const section = getArticleSection(article.section);
      expect(section, `${article.slug}: unknown section`).toBeDefined();
      expect(getAuthor(article.authorId), `${article.slug}: unknown author`).toBeDefined();

      for (const slug of article.relatedSlugs ?? []) {
        expect(slug, `${article.slug}: related to itself`).not.toBe(article.slug);
        expect(findArticle(slug), `${article.slug}: related article ${slug} missing`).not.toBeNull();
      }

      for (const slug of article.relatedCategorySlugs ?? []) {
        expect(
          findCommunityCategory(slug),
          `${article.slug}: community category ${slug} is not in the taxonomy`,
        ).not.toBeNull();
      }

      expect(relatedArticles(article).some((related) => related.slug === article.slug)).toBe(
        false,
      );
    }
  });

  it("points every section at a surface that exists", () => {
    for (const section of allArticleSections) {
      const page = fileURLToPath(
        new URL(`../../app${section.surfacePath}/page.tsx`, import.meta.url),
      );
      expect(
        existsSync(page),
        `section ${section.id} surfaces on ${section.surfacePath}, which has no page`,
      ).toBe(true);
    }
  });

  it("lists an article on its own section surface and on the guides hub", () => {
    for (const article of articles) {
      const surface = getArticleSection(article.section).surfacePath;
      expect(articlesForSurface(surface)).toContain(article);
      expect(articlesForSurface("/guides")).toContain(article);
    }
  });

  it("keeps meta descriptions within the length a result page will show", () => {
    for (const article of articles) {
      const description = articleDescription(article);
      expect(description.length, `${article.slug}: description is ${description.length} chars`)
        .toBeLessThanOrEqual(165);
      expect(description.trim().length).toBeGreaterThan(50);
    }
  });
});

/**
 * Trust guards.
 *
 * These are the assertions this project exists to make. A pet publication that
 * invents a credential, a reviewer or a statistic has done more harm than one
 * that publishes nothing at all, and none of that is caught by a typechecker.
 * See the note at the top of `features/editorial/authors.ts`.
 */
describe("editorial trust rules", () => {
  it("never credits a reviewer who is not on the register", () => {
    for (const article of articles) {
      if (article.reviewerId === undefined) {
        continue;
      }

      expect(
        findReviewer(article.reviewerId),
        `${article.slug}: credits reviewer "${article.reviewerId}", who is not on the register`,
      ).not.toBeNull();
    }
  });

  it("records a verifiable licence for any reviewer that exists", () => {
    // Empty today. When it is not, a name alone is not a credential — a reader
    // must be able to look the registration up.
    for (const reviewer of allReviewers) {
      expect(reviewer.credentials.trim().length, `${reviewer.id}: credentials`).toBeGreaterThan(0);
      expect(reviewer.college.trim().length, `${reviewer.id}: licensing college`).toBeGreaterThan(0);
      expect(
        reviewer.registrationNumber.trim().length,
        `${reviewer.id}: registration number`,
      ).toBeGreaterThan(0);
    }
  });

  it("makes no claim of professional review anywhere in a body", () => {
    // Phrases that assert scrutiny the site has not had. `<VetNote>` is the
    // sanctioned way to write about veterinary care: it tells a reader when to
    // call one, and never implies that one wrote or approved the passage.
    const forbidden = [
      /vet(erinarian)?[\s-]?reviewed/i,
      /reviewed by (a |our )?(vet|veterinar)/i,
      /\bour (vets|veterinarians)\b/i,
      /\bwe recommend (a |this )?(treatment|dose|medication)/i,
      /clinically proven/i,
      /\bexperts agree\b/i,
      /\bboard[\s-]certified\b/i,
    ];

    for (const article of articles) {
      const body = readBody(article);

      for (const pattern of forbidden) {
        expect(
          pattern.test(body),
          `${article.slug}: body matches a forbidden claim pattern ${pattern}`,
        ).toBe(false);
      }
    }
  });

  it("does not quote a statistic without somewhere to check it", () => {
    // The failure mode this catches is a plausible-sounding figure invented to
    // make a paragraph land harder. A percentage may appear, but only in an
    // article that cites a source a reader can follow.
    for (const article of articles) {
      const hasFigure = /\d\s?%|\d+\s?(percent|per cent)/i.test(readBody(article));

      if (hasFigure) {
        expect(
          (article.sources ?? []).length,
          `${article.slug}: quotes a figure but cites no source`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("declares a veterinary boundary on anything that touches health", () => {
    // If a body draws the "when to call a vet" callout, the article must also
    // carry the standing notice that closes the page.
    for (const article of articles) {
      if (/<VetNote>/.test(readBody(article))) {
        expect(
          article.veterinaryNotice,
          `${article.slug}: uses <VetNote> but does not set veterinaryNotice`,
        ).toBe(true);
      }
    }
  });

  it("keeps tags internal — no public tag pages", () => {
    // Tags organise the registry and nothing else. Tag pages would be thin,
    // near-duplicate and indexable, which is the opposite of the reason this
    // site exists.
    const tagRoute = fileURLToPath(new URL("../../app/tags", import.meta.url));
    expect(existsSync(tagRoute), "public tag pages must not exist yet").toBe(false);

    for (const article of articles) {
      expect(article.tags.length, `${article.slug}: no tags`).toBeGreaterThan(0);
      for (const tag of article.tags) {
        expect(isValidSlug(tag), `${article.slug}: tag "${tag}" is not slug-shaped`).toBe(true);
      }
    }
  });
});

/**
 * Editorial workflow state must not reach a reader.
 *
 * This is a regression guard for a real bug: the article template rendered
 * "Editorial draft — not yet published" and the whole fact-check queue onto the
 * live page, so the first thing a visitor on a phone read was the newsroom's
 * to-do list. `noindex` had been treated as if it made the page private. It
 * does not — it keeps a page out of search results, and everything rendered is
 * public regardless.
 *
 * `status` stays readable by components, because the byline legitimately needs
 * it to decide whether a publication date exists yet. What is checked here is
 * that the *reader-facing copy* never comes back.
 */
describe("editorial state stays internal", () => {
  const COMPONENT_DIR = fileURLToPath(new URL("./components/", import.meta.url));

  const componentSources = readdirSync(COMPONENT_DIR)
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => ({
      file,
      // Comments are stripped first: this file and the components themselves
      // discuss the banned strings in order to explain why they are banned.
      source: readFileSync(`${COMPONENT_DIR}${file}`, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/^\s*\/\/.*$/gm, " "),
    }));

  it("is actually scanning the templates", () => {
    // Without this, moving or renaming the component directory would turn
    // every assertion below into a loop over nothing that passes silently.
    expect(componentSources.length).toBeGreaterThanOrEqual(6);
  });

  it("renders no draft banner or verification queue", () => {
    const banned = [
      /not yet published/i,
      /editorial draft/i,
      /flagged for verification/i,
      /before publication/i,
      /\bDrafted\b/,
      /open questions/i,
    ];

    for (const { file, source } of componentSources) {
      for (const pattern of banned) {
        expect(
          pattern.test(source),
          `${file}: renders internal editorial copy matching ${pattern}`,
        ).toBe(false);
      }
    }
  });

  it("never reads the verification queue from a component", () => {
    const offenders = componentSources
      .filter(({ source }) => source.includes("needsVerification"))
      .map(({ file }) => file);

    expect(
      offenders,
      `needsVerification is editorial-only; read by ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("keeps the flagged claims in the model, where an editor can find them", () => {
    // The field is the alternative to guessing, so it has to stay meaningful
    // now that nothing renders it — an unused field rots quietly.
    for (const article of articles) {
      for (const item of article.needsVerification ?? []) {
        expect(
          item.trim().length,
          `${article.slug}: empty verification note`,
        ).toBeGreaterThan(20);
      }
    }
  });
});

describe("article indexing", () => {
  it("keeps unreviewed articles out of the sitemap", () => {
    const urls = buildSitemapEntries().map((entry) => entry.url);

    for (const article of articles) {
      const url = absoluteUrl(articlePath(article.slug));

      if (article.status === "published") {
        expect(urls, `${article.slug} is published but missing from the sitemap`).toContain(url);
      } else {
        expect(urls, `${article.slug} is ${article.status} but listed in the sitemap`).not.toContain(
          url,
        );
      }
    }
  });

  it("exposes only published articles to the sitemap builder", () => {
    for (const article of publishedArticles()) {
      expect(article.status).toBe("published");
    }
  });
});
