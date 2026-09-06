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
  articlePublicationDates,
  indexableArticles,
  isArticleIndexable,
} from "@/features/editorial/articles";
import { allReviewers, findReviewer, getAuthor } from "@/features/editorial/authors";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { absoluteUrl, canonicalUrl } from "@/lib/seo/urls";
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

  it("carries sane, ordered dates only where one has been published", () => {
    // Every article used to carry a `publishedAt` from the day it was written.
    // Those were authoring dates, and none of these articles has ever been
    // public, so the union now forbids a date until publication.
    for (const article of articles) {
      if (article.status !== "published") {
        expect(article.publishedAt, `${article.slug} is in review with a date`).toBeUndefined();
        expect(article.updatedAt, `${article.slug} is in review with a date`).toBeUndefined();
        continue;
      }

      for (const [field, value] of [
        ["publishedAt", article.publishedAt],
        ["updatedAt", article.updatedAt ?? article.publishedAt],
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
        (article.updatedAt ?? article.publishedAt) >= article.publishedAt,
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

/**
 * An article in a state the repository is deliberately never in.
 *
 * Publishing a real article to test publication would leave the library
 * published. The real article supplies the content; the override supplies the
 * state.
 */
function withState(
  article: Article,
  state: {
    status: "in-review" | "published";
    publishedAt?: string;
    updatedAt?: string;
    indexable?: boolean;
  },
): Article {
  return { ...article, ...state } as Article;
}

describe("article publication dates", () => {
  const real = articles[0]!;

  it("keeps every article in review, with no publication date at all", () => {
    expect(articles).toHaveLength(35);
    for (const article of articles) {
      expect(article.status, article.slug).toBe("in-review");
      expect(article.publishedAt, `${article.slug} carries a publication date`).toBeUndefined();
      expect(article.updatedAt, `${article.slug} carries a revision date`).toBeUndefined();
      expect(articlePublicationDates(article)).toEqual({});
    }
  });

  it("leaves no authoring date anywhere in the registry", () => {
    // The old values were the dates the batches were written — 2026-09-01,
    // 09-02, 09-03, 09-05. They were removed rather than hidden, so there is
    // nothing left that a future edit could reach for as a publication date.
    const source = readFileSync(
      fileURLToPath(new URL("./articles.ts", import.meta.url)),
      "utf8",
    );
    const registry = source.slice(source.indexOf("export const articles"));
    for (const date of ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-05"]) {
      expect(registry, `${date} still appears in the registry`).not.toContain(`"${date}"`);
    }
    expect(registry).not.toMatch(/\n {4}publishedAt:/);
    expect(registry).not.toMatch(/\n {4}updatedAt:/);
    expect(registry).not.toMatch(/draftedAt|createdAt|authoredAt/);
  });

  it("uses publishedAt for datePublished once published", () => {
    expect(articlePublicationDates(withState(real, { status: "published", publishedAt: "2026-10-01" })))
      .toEqual({ datePublished: "2026-10-01", dateModified: "2026-10-01" });
  });

  it("prefers updatedAt for dateModified, and falls back to publishedAt", () => {
    expect(
      articlePublicationDates(
        withState(real, { status: "published", publishedAt: "2026-10-01", updatedAt: "2027-03-09" }),
      ),
    ).toEqual({ datePublished: "2026-10-01", dateModified: "2027-03-09" });

    expect(
      articlePublicationDates(withState(real, { status: "published", publishedAt: "2026-10-01" }))
        .dateModified,
    ).toBe("2026-10-01");
  });

  it("fails loudly if an article is published without a publication date", () => {
    // The union makes this a compile error; the cast is how a build could still
    // reach it. It must throw rather than silently omit the field.
    const broken = { ...real, status: "published" } as unknown as Article;
    expect(() => articlePublicationDates(broken)).toThrow(/published with no publishedAt/);
    expect(() => articlePublicationDates(broken)).toThrow(/not a publication date/);
  });

  it("renders no publication date, in any surface, while in review", () => {
    const byline = readFileSync(
      fileURLToPath(new URL("./components/article-byline.tsx", import.meta.url)),
      "utf8",
    );
    // The byline narrows on the discriminant rather than a boolean flag, so a
    // date can only be rendered where the type guarantees one exists.
    expect(byline).toContain('article.status === "published" ? article : null');
    expect(byline).not.toMatch(/publishedAt!/);

    const page = readFileSync(
      fileURLToPath(new URL("./components/article-page.tsx", import.meta.url)),
      "utf8",
    );
    expect(page).toContain("articlePublicationDates(article)");
    expect(page).not.toMatch(/datePublished: article\.publishedAt/);
  });
});

describe("article index policy", () => {
  const real = articles[0]!;
  const urls = () => buildSitemapEntries().map((entry) => entry.url);

  it("keeps content state and index policy as separate decisions", () => {
    // The four states, and only one of them indexes. Indexability can never
    // override review status, which is what makes it safe to set in advance.
    expect(isArticleIndexable(withState(real, { status: "in-review", indexable: false }))).toBe(false);
    expect(isArticleIndexable(withState(real, { status: "in-review", indexable: true }))).toBe(false);
    expect(
      isArticleIndexable(withState(real, { status: "published", publishedAt: "2026-10-01", indexable: false })),
    ).toBe(false);
    expect(
      isArticleIndexable(withState(real, { status: "published", publishedAt: "2026-10-01", indexable: true })),
    ).toBe(true);
  });

  it("carries no SEO-level hold today, and indexes nothing", () => {
    // Every article is `indexable`, meaning none is held back for search
    // reasons. What holds all 35 is `status`, which is the honest reason.
    for (const article of articles) expect(article.indexable, article.slug).toBe(true);
    expect(indexableArticles()).toEqual([]);
    expect(publishedArticles()).toEqual([]);
  });

  it("drives the sitemap and the meta tag from one predicate", () => {
    const route = readFileSync(
      fileURLToPath(new URL("../../app/guides/[slug]/page.tsx", import.meta.url)),
      "utf8",
    );
    expect(route).toContain("noIndex: !isArticleIndexable(article)");
    expect(route).not.toMatch(/noIndex: article\.status/);

    const sitemap = readFileSync(
      fileURLToPath(new URL("../../lib/seo/sitemap.ts", import.meta.url)),
      "utf8",
    );
    expect(sitemap).toContain("indexableArticles()");
    expect(sitemap).not.toMatch(/publishedArticles\(\)/);
  });

  it("puts no article, and no query-string variant, in the sitemap", () => {
    const all = urls();
    expect(all.filter((u) => u.includes("/guides/"))).toEqual([]);
    expect(all.some((u) => u.includes("?"))).toBe(false);
    expect(new Set(all).size).toBe(all.length);
  });

  it("would emit sitemap URLs that match each article's own canonical", () => {
    for (const article of articles) {
      expect(absoluteUrl(articlePath(article.slug))).toBe(canonicalUrl(articlePath(article.slug)));
    }
  });

  it("cannot reach the Puppy Journey or /my-puppy", () => {
    // Article state and Journey state are independent: neither list can emit
    // the other's routes, and /my-puppy is not in either.
    const paths = articles.map((a) => articlePath(a.slug));
    expect(paths.some((p) => p.startsWith("/puppy"))).toBe(false);
    expect(paths).not.toContain("/my-puppy");
    expect(urls().some((u) => u.includes("my-puppy"))).toBe(false);
    expect(urls().some((u) => u.includes("/puppy"))).toBe(false);
  });
});

describe("rabies legal copy in the vaccination guides", () => {
  const bodyOf = (slug: string) =>
    readFileSync(
      fileURLToPath(new URL(`../../content/articles/${slug}.mdx`, import.meta.url)),
      "utf8",
    );

  for (const slug of [
    "puppy-vaccination-schedule-in-canada",
    "kitten-vaccination-schedule-in-canada",
  ]) {
    it(`makes no unsupported negative legal claim for BC in ${slug}`, () => {
      const body = bodyOf(slug);

      // The exhaustive negative, in every phrasing it has worn.
      expect(body).not.toMatch(/sets no legal requirement/i);
      expect(body).not.toMatch(/no legal requirement at all/i);
      expect(body).not.toMatch(/(?:BC|British Columbia)[^.]{0,40}has no legal requirement/i);
      expect(body).not.toMatch(/does not compel|not legally required|no provincial law compels/i);

      // What BCCDC actually says, and our position stated as ours.
      expect(body).toMatch(/BCCDC|BC Centre for Disease Control/);
      expect(body).toMatch(/not presenting a province-wide legal requirement/i);
      // And it must not imply nothing else can apply.
      expect(body).toMatch(/municipal/i);
      expect(body).toMatch(/travel|import|bite-investigation/i);
    });

    it(`keeps Ontario's inclusive statutory threshold in ${slug}`, () => {
      const body = bodyOf(slug);
      expect(body).toMatch(/three months of age or over/);
      expect(body).not.toMatch(/over three months of age/);
      expect(body).not.toMatch(/after three months of age/);
      // The statute is named, so the claim is checkable.
      expect(body).toMatch(/Reg\. 567/);
    });
  }

  it("records both corrections where the next editor will find them", () => {
    for (const slug of [
      "puppy-vaccination-schedule-in-canada",
      "kitten-vaccination-schedule-in-canada",
    ]) {
      const article = articles.find((a) => a.slug === slug)!;
      const register = (article.needsVerification ?? []).join(" ");
      expect(register, slug).toMatch(/exhaustive negative legal claim/i);
      expect(register, slug).toMatch(/Do not restore the stronger wording without a named statute/i);
      expect(register, slug).toMatch(/R\.R\.O\. 1990, Reg\. 567/);
      expect(register, slug).toMatch(/three months of age or over/);
    }
  });
});
