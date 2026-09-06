import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { findCommunityCategory } from "@/features/community/taxonomy";
import {
  articleRobotsPolicy,
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
import { createMetadata } from "@/lib/seo/metadata";
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

  it("publishes exactly the fifteen dependency articles, and holds the other twenty", () => {
    expect(articles).toHaveLength(35);
    const published = articles.filter((a) => a.status === "published").map((a) => a.slug);
    expect([...published].sort()).toEqual([...JOURNEY_DEPENDENCIES].sort());
    expect(published).toHaveLength(15);
    expect(articles.filter((a) => a.status === "in-review")).toHaveLength(20);
  });

  it("dates all fifteen to one real first-publication day, and revises none", () => {
    const published = articles.filter((a) => a.status === "published");
    // One launch, one date. Fifteen different dates would mean fifteen guesses.
    expect(new Set(published.map((a) => a.publishedAt))).toEqual(new Set([LAUNCH_DATE]));
    for (const article of published) {
      expect(article.updatedAt, `${article.slug} carries a revision date`).toBeUndefined();
      expect(articlePublicationDates(article)).toEqual({
        datePublished: LAUNCH_DATE,
        dateModified: LAUNCH_DATE,
      });
    }
  });

  it("leaves every held article dateless, in every surface", () => {
    for (const article of articles.filter((a) => a.status === "in-review")) {
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
    // Publication dates now exist, but only the real launch day may appear —
    // and only on a published article. No revision date exists yet at all.
    const dates = [...registry.matchAll(/\n {4}publishedAt: "([^"]+)"/g)].map((m) => m[1]);
    expect(dates).toHaveLength(15);
    expect(new Set(dates)).toEqual(new Set([LAUNCH_DATE]));
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
    const broken = { ...real, status: "published", publishedAt: undefined } as unknown as Article;
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

  it("carries no SEO-level hold, and indexes exactly the published fifteen", () => {
    // Every article is still `indexable`, meaning none is held back for search
    // reasons. What holds the other twenty is `status` — the honest reason.
    for (const article of articles) expect(article.indexable, article.slug).toBe(true);
    expect(indexableArticles().map((a) => a.slug).sort()).toEqual([...JOURNEY_DEPENDENCIES].sort());
    expect(indexableArticles()).toHaveLength(15);
    expect(publishedArticles()).toHaveLength(15);
  });

  it("drives the sitemap and the meta tag from one predicate", () => {
    const route = readFileSync(
      fileURLToPath(new URL("../../app/guides/[slug]/page.tsx", import.meta.url)),
      "utf8",
    );
    expect(route).toContain("robots: articleRobotsPolicy(article)");
    expect(route).not.toMatch(/robots: article\.status/);

    const sitemap = readFileSync(
      fileURLToPath(new URL("../../lib/seo/sitemap.ts", import.meta.url)),
      "utf8",
    );
    expect(sitemap).toContain("indexableArticles()");
    expect(sitemap).not.toMatch(/publishedArticles\(\)/);
  });

  it("puts exactly the fifteen guides, and no query-string variant, in the sitemap", () => {
    const all = urls();
    const guides = all
      .filter((u) => new URL(u).pathname.startsWith("/guides/"))
      .map((u) => new URL(u).pathname.replace("/guides/", ""));
    expect([...guides].sort()).toEqual([...JOURNEY_DEPENDENCIES].sort());
    expect(guides).toHaveLength(15);

    // And none of the twenty held articles leaked in.
    const held = articles.filter((a) => a.status === "in-review").map((a) => a.slug);
    expect(held).toHaveLength(20);
    for (const slug of held) expect(guides, `${slug} leaked into the sitemap`).not.toContain(slug);

    expect(all.some((u) => u.includes("?"))).toBe(false);
    expect(new Set(all).size, "duplicate sitemap URL").toBe(all.length);
    // 41 original + 15 guides + the Journey hub and its six indexed stages.
    expect(all).toHaveLength(63);
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
    // Compared on pathname, not substring: two guide slugs legitimately begin
    // "puppy-", and `includes("/puppy")` would match /guides/puppy-... .
    // Journey routes are in the sitemap now, but the article list cannot be
    // what put them there — and /my-puppy is in neither.
    const journeyRoutes = urls().filter((u) => {
      const path = new URL(u).pathname;
      return path === "/puppy" || path.startsWith("/puppy/");
    });
    expect(journeyRoutes).toHaveLength(7);
    expect(urls().some((u) => new URL(u).pathname.startsWith("/my-puppy"))).toBe(false);
    expect(indexableArticles().some((a) => articlePath(a.slug).startsWith("/puppy"))).toBe(false);
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

/**
 * ## Behaviour folklore, in the article library
 *
 * The Puppy Journey has guards for this. The dependency audit found they would
 * not have caught either of the two contradictions in Batch B, for the same
 * reason in both cases: the articles never used a banned phrase. The
 * socialisation guide said "a second period of increased wariness during
 * adolescence" — the second fear period, in other words — and the training
 * guide asserted a six-to-eighteen-month regression window. A phrase list
 * would have missed both.
 *
 * So this scans for the *assertions* rather than the vocabulary, and it is
 * deliberately narrower than the Journey's six families: only the behavioural
 * claims that the Journey has taken a position on, applied to all 35 articles.
 *
 * Attribution and rejection are clause-scoped, exactly as in the Journey
 * guard, so "people are told their dog is being dominant" and "we could not
 * find a source for a second fear period" both pass while the bare assertions
 * do not.
 */
const FOLKLORE = [
  // A scheduled fear event, however it is worded.
  /\bsecond\s+(?:fear|wariness)\s+(?:period|stage|phase|window)\b/i,
  /\b(?:period|stage|phase)\s+of\s+(?:increased\s+)?(?:fear|wariness|fearfulness)\b/i,
  /\bfear\s+(?:period|stage)\s+(?:arrives|begins|starts|happens|sets in)\b/i,
  // A universal adolescent regression window.
  /\b(?:six|6)\s*(?:to|–|-)\s*(?:eighteen|18)\s*months\b[^.]{0,60}\b(?:regress|worse|decline|lose|undone)\b/i,
  /\b(?:regress\w*|worse|decline\w*|deteriorat\w*)\b[^.]{0,60}\bbetween\s+(?:roughly\s+)?(?:six|6)\s*(?:to|and|–|-)\s*(?:eighteen|18)\s*months\b/i,
  /\ball\s+(?:adolescent\s+)?dogs\b[^.]{0,50}\bregress\b/i,
  // Dominance and its family.
  /\bpack\s+leader\b|\balpha\s+(?:dog|male|role|status)\b/i,
  /\b(?:establish|assert|show|maintain)\w*\s+dominance\b/i,
  /\b(?:is|are|was|were|being)\s+(?:testing|pushing)\s+(?:the\s+|his\s+|her\s+|your\s+|its\s+)?boundaries\b/i,
  // Stubbornness as a developmental explanation.
  /\b(?:is|are|being)\s+(?:just\s+)?stubborn\b[^.]{0,40}\b(?:because|adolescen|developmental|age)\b/i,
  /\b(?:adolescen\w+|developmental)\b[^.]{0,40}\b(?:stubbornness|being stubborn)\b/i,
];

/** Attribution, rejection or reported speech, in the same clause as the claim. */
const FOLKLORE_EXEMPT =
  /\b(?:not|never|no|nothing|nobody)\b|\bcould not find\b|\brather than\b|\binstead of\b|\bmyth\b|\bfolklore\b|\bmisreading\b|\b(?:are|is)\s+told\b|\bpeople\s+(?:say|call|assume|are told)\b|\byou will hear\b|\bAsher\b|\bMcEvoy\b|\bMerck\b|\bAVSAB\b|\bstudy\b|\bguide[- ]dog\b|\bwe have taken it out\b|\bremoved\b/i;

function folkloreClauses(sentence: string): string[] {
  return sentence
    .split(/\s*[;—]\s*|,\s+(?:then|and then|but|so|which|where)\s+/)
    .filter((part) => part.trim().length > 0);
}

/** Every folklore assertion in one sentence, unexcused by its own clause. */
function folkloreViolations(sentence: string): string[] {
  const found: string[] = [];
  for (const pattern of FOLKLORE) {
    for (const clause of folkloreClauses(sentence)) {
      const hit = pattern.exec(clause);
      if (hit && !FOLKLORE_EXEMPT.test(clause)) found.push(hit[0]);
    }
  }
  return found;
}

const ARTICLE_BODIES = articles.map((article) => ({
  slug: article.slug,
  body: readFileSync(
    fileURLToPath(new URL(`../../content/articles/${article.slug}.mdx`, import.meta.url)),
    "utf8",
  ),
}));

describe("behaviour folklore across the article library", () => {
  it("scans every article body, not a sample", () => {
    expect(ARTICLE_BODIES).toHaveLength(35);
    for (const { slug, body } of ARTICLE_BODIES) {
      expect(body.length, `${slug} body is empty`).toBeGreaterThan(2000);
    }
  });

  it("asserts no behaviour folklore in any article", () => {
    const offenders: string[] = [];
    for (const { slug, body } of ARTICLE_BODIES) {
      for (const sentence of body.split(/(?<=[.?!])\s+/)) {
        for (const hit of folkloreViolations(sentence)) {
          offenders.push(`${slug}: "${hit}" in "${sentence.trim().slice(0, 110)}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("catches the two claims the Journey guards would have missed", () => {
    // Verbatim from the articles before this batch. Neither used a banned
    // phrase, which is why a vocabulary list would not have found them.
    for (const sentence of [
      "Many dogs go through a second period of increased wariness during adolescence, when things they previously accepted suddenly become suspicious.",
      "Many dogs get noticeably worse between roughly six and eighteen months.",
    ]) {
      expect(folkloreViolations(sentence), `still slips through: ${sentence}`).not.toEqual([]);
    }
  });

  it("catches the rest of the family", () => {
    for (const sentence of [
      "A second fear period arrives around eight months.",
      "You need to be the pack leader.",
      "Establish dominance early or the dog will.",
      "Your dog is testing boundaries at this age.",
      "He is being stubborn because he is adolescent.",
      "All adolescent dogs regress for a while.",
    ]) {
      expect(folkloreViolations(sentence), `missed: ${sentence}`).not.toEqual([]);
    }
  });

  it("allows rejection, reported speech and attributed findings", () => {
    for (const sentence of [
      "It is the point at which a great many people are told their dog is being dominant, stubborn or spiteful.",
      "We could not find a source for a second fear period, so it is not in this guide.",
      "There is no evidence for a scheduled adolescent fear stage.",
      "Asher and colleagues found that at around eight months carers rated their dogs as less trainable than at five or twelve.",
      "That was a guide-dog population, so it is not a six-to-eighteen-month timetable your dog is due on.",
      "AVSAB names forceful manipulation such as alpha rolls or dominance downs among the techniques to avoid.",
      "A dog finding new things harder later is worth reading as that curve continuing, rather than as a second window opening on a timetable.",
    ]) {
      expect(folkloreViolations(sentence), `false positive: ${sentence}`).toEqual([]);
    }
  });
});

describe("Batch B — puppy behaviour and training evidence", () => {
  const body = (slug: string) => ARTICLE_BODIES.find((a) => a.slug === slug)!.body;
  const register = (slug: string) =>
    (articles.find((a) => a.slug === slug)!.needsVerification ?? []).join(" ");
  const sourceUrls = (slug: string) =>
    (articles.find((a) => a.slug === slug)!.sources ?? []).map((x) => x.url).join(" ");

  it("replaces the socialisation wariness claim with a sourced trajectory", () => {
    const b = body("puppy-socialisation-checklist");
    expect(b).not.toMatch(/second period of increased wariness/i);
    expect(b).not.toMatch(/second fear (?:period|stage|phase)/i);

    // What replaced it is attributed, gradual, and individual.
    expect(b).toMatch(/McEvoy/);
    expect(b).toMatch(/three to five weeks/i);
    expect(b).toMatch(/Merck Veterinary Manual/);
    expect(b).toMatch(/juvenile period/i);
    expect(b).toMatch(/Neither is a stage with dates on it/i);
    expect(b).toMatch(/varies enormously from dog to dog|individual/i);
    // Pain and illness named, with a route to help.
    expect(b).toMatch(/pain and illness/i);
    expect(b).toMatch(/qualified behaviour professional/i);

    expect(sourceUrls("puppy-socialisation-checklist")).toContain("PMC9655304");
    expect(register("puppy-socialisation-checklist")).toMatch(/RESOLVED 2026-09-06/);
  });

  it("makes the body-language signals sourced and explicitly non-specific", () => {
    const b = body("puppy-socialisation-checklist");
    expect(b).toMatch(/Merck Veterinary Manual lists low body posture/i);
    expect(b).toMatch(/piloerection/);
    expect(b).toMatch(/displacement/i);
    // The point that matters: no single signal is a verdict.
    expect(b).toMatch(/None of these is a fear signal on its own/i);
    expect(b).toMatch(/combination|context/i);
    expect(b).not.toMatch(/\bmeans your (?:dog|puppy) is afraid\b/i);
    expect(sourceUrls("puppy-socialisation-checklist")).toMatch(/merckvetmanual\.com\/behavior/);
  });

  it("replaces the adolescence window with what Asher actually measured", () => {
    const b = body("loose-leash-walking-and-recall");
    expect(b).not.toMatch(/get noticeably worse between roughly six and eighteen months/i);

    expect(b).toMatch(/Asher/);
    expect(b).toMatch(/five, eight and twelve months|roughly five, eight and twelve/i);
    expect(b).toMatch(/carers rated/i);
    expect(b).toMatch(/stranger/i);
    // The limitation travels with the finding.
    expect(b).toMatch(/guide-dog population/i);
    expect(b).toMatch(/age groupings would need reconsidering/i);
    expect(b).toMatch(/not a six-to-eighteen-month timetable/i);
    // And none of the folklore came back in its place. "dominance downs"
    // appears legitimately, quoted from AVSAB's list of techniques to avoid.
    expect(folkloreViolations(b)).toEqual([]);
    expect(b).not.toMatch(/\bpack leader\b|\btesting boundaries\b/i);

    expect(sourceUrls("loose-leash-walking-and-recall")).toMatch(/rsbl\.2020\.0097/);
  });

  it("states the AVSAB position as the statement actually words it", () => {
    const b = body("loose-leash-walking-and-recall");
    // Verified against the 2021 position statement PDF, retrieved directly.
    expect(b).toMatch(/only reward-based training methods are used for all dog training/i);
    // All four categories, not two.
    expect(b).toMatch(/choke chains, prong collars, electronic shock collars/i);
    expect(b).toMatch(/squirt bottles, shaker noise cans, compressed air cans/i);
    expect(b).toMatch(/alpha rolls or dominance downs/i);
    expect(b).toMatch(/leash jerking/i);
    expect(b).toMatch(/flooding/i);
    expect(b).toMatch(/there are no exceptions to this standard/i);
    expect(b).toMatch(/opt out/i);
    expect(register("loose-leash-walking-and-recall")).toMatch(/verified against the 2021 Humane Dog Training position statement/i);
  });

  it("removes the bladder formula and replaces it with sourced intervals", () => {
    const b = body("crate-training-a-puppy-in-canada");
    // The formula may only appear in the sentence saying it was taken out.
    for (const sentence of b.split(/(?<=[.?!])\s+/)) {
      if (!/age in months plus one hour/i.test(sentence)) continue;
      expect(sentence, "the formula is stated as guidance").toMatch(
        /taken it out|removed|could not find a veterinary source/i,
      );
    }
    expect(b).not.toMatch(/a three-month-old for about four hours/i);

    // What replaced it: intervals, attributed, with a confinement ceiling.
    expect(b).toMatch(/every one to two hours/i);
    expect(b).toMatch(/every four hours even if it has been resting/i);
    expect(b).toMatch(/around five months/i);
    expect(b).toMatch(/no more than about three hours alone in a crate/i);
    expect(b).toMatch(/VCA/);
    expect(sourceUrls("crate-training-a-puppy-in-canada")).toMatch(/vcahospitals\.com/);
    expect(register("crate-training-a-puppy-in-canada")).toMatch(/was REMOVED/);
  });

  it("carries no unsupported numeric bladder-capacity formula anywhere", () => {
    for (const { slug, body: b } of ARTICLE_BODIES) {
      for (const sentence of b.split(/(?<=[.?!])\s+/)) {
        if (!/\bhold (?:on|it|their bladder)\b/i.test(sentence)) continue;
        if (!/bladder|urine|toilet|eliminat|crate|pee/i.test(sentence)) continue;
        expect(
          /taken it out|removed|could not find|varies|depends|VCA|veterinary/i.test(sentence),
          `${slug}: unsourced holding claim — ${sentence.slice(0, 110)}`,
        ).toBe(true);
      }
    }
  });

  it("states sleep the same way in both puppy guides, and sources it", () => {
    const crate = body("crate-training-a-puppy-in-canada");
    const first = body("bringing-home-a-puppy-first-30-days");

    for (const [slug, b] of [
      ["crate-training-a-puppy-in-canada", crate],
      ["bringing-home-a-puppy-first-30-days", first],
    ] as const) {
      // The unsupported figure is gone from both.
      expect(b, slug).not.toMatch(/sixteen (?:to|and) eighteen hours/i);
      expect(b, slug).not.toMatch(/16.{0,4}18 hours of sleep/i);
      // Both carry the measured figure, its source and its limitation.
      expect(b, slug).toMatch(/Generation Pup/);
      expect(b, slug).toMatch(/about 11 hours|11\.2/);
      expect(b, slug).toMatch(/sixteen weeks/i);
      expect(b, slug).toMatch(/owner-reported/i);
      expect(b, slug).toMatch(/not observing directly/i);
      expect(sourceUrls(slug)).toContain("PMC7401528");
    }

    // And neither drifts to a precise daily total of its own.
    expect(crate).toMatch(/in many short bouts/i);
    expect(first).toMatch(/in many short bouts/i);
    // The formula is not introduced into the first-30-days guide.
    expect(first).not.toMatch(/age in months plus one hour/i);
  });

  it("leaves no publication blocker in the four Batch B articles", () => {
    const BLOCKING =
      /before publication|before it is published|before publishing|attach a source or cut|source it before|confirm .{0,40}before|could not be (?:retrieved|confirmed|verified)|not yet sourced|re-check .{0,30}before/i;

    for (const slug of [
      "puppy-socialisation-checklist",
      "loose-leash-walking-and-recall",
      "crate-training-a-puppy-in-canada",
      "bringing-home-a-puppy-first-30-days",
    ]) {
      const items = articles.find((a) => a.slug === slug)!.needsVerification ?? [];
      // The label is the classification. A guardrail may legitimately contain
      // "confirm before naming a proportion" — that is a condition on a change
      // nobody is making, not an open question.
      const open = items.filter(
        (item) => BLOCKING.test(item) && !/^(?:RESOLVED|STANDING GUARDRAIL)/.test(item),
      );
      expect(open, `${slug} still has publication blockers`).toEqual([]);
      // Every remaining item declares which kind it is.
      for (const item of items) {
        expect(item, `${slug}: unlabelled register item`).toMatch(
          /^(?:RESOLVED|STANDING GUARDRAIL|OPEN \(NON-BLOCKING\))/,
        );
      }
    }
  });
});

/**
 * ## Parasite prescription, across the article library
 *
 * The pre-launch hardening report recorded this gap explicitly: "Start
 * heartworm prevention at 8 weeks and continue monthly" passed every guard
 * this project had. Parasite prevention was outside the six Journey families,
 * and nothing scanned the articles for it at all.
 *
 * Same shape as the folklore guard. It looks for *prescription* — a universal
 * age, product or cadence presented as what every animal needs — and not for
 * the word "heartworm". Discussion of risk, geography, label minimums and
 * questions for a veterinarian all have to pass, because that is what these
 * articles are made of.
 */
const PARASITE_RX = [
  // A universal start age.
  /\b(?:start|begin|commence)\w*\b[^.]{0,40}\b(?:heartworm|flea|tick|parasite|deworm\w*)\b[^.]{0,40}\bat\s+(?:\d+|six|eight|twelve|sixteen)\s*(?:weeks?|months?)\b/i,
  /\b(?:heartworm|flea|tick|parasite|deworm\w*)\b[^.]{0,40}\b(?:starts?|begins?)\b[^.]{0,25}\bat\s+(?:\d+|six|eight|twelve)\s*(?:weeks?|months?)\b/i,
  // Every animal needs it.
  /\b(?:every|all|each)\s+(?:puppy|puppies|kitten|kittens|dog|dogs|cat|cats|animal|animals)\b[^.]{0,60}\b(?:needs?|requires?|must have|should have|should be on)\b[^.]{0,40}\b(?:heartworm|flea|tick|parasite|deworm\w*|prevention|preventive)\b/i,
  // A universal cadence.
  /\bgive\b[^.]{0,40}\b(?:heartworm|flea|tick|parasite)\b[^.]{0,40}\bevery\s+month\b/i,
  /\b(?:monthly|every month)\b[^.]{0,40}\b(?:year-round|all year)\b[^.]{0,40}\b(?:every|all)\s+(?:dog|cat|dogs|cats)\b/i,
  // A national schedule.
  /\ball\s+Canadian\s+(?:dogs|cats|pets)\b[^.]{0,50}\b(?:need|require|should)\b/i,
];

const PARASITE_EXEMPT =
  /\b(?:not|never|no|nothing)\b|\bask\b|\bquestion\b|\byour veterinar\w+\b|\bclinic\b|\bdepends?\b|\bvaries\b|\brisk\b|\bwhere you live\b|\bgeograph\w+\b|\blabel\b|\bproduct\b|\bmay\b|\bmight\b|\busually\b|\btypically\b|\boften\b|\bsome\b|\bmost\b|\bconvention\b|\bPHAC\b|\bMerck\b|\bwe do not\b|\bthis (?:page|guide|article)\b/i;

function parasiteClauses(sentence: string): string[] {
  return sentence
    .split(/\s*[;—]\s*|,\s+(?:then|and then|but|so|which|where)\s+/)
    .filter((part) => part.trim().length > 0);
}

function parasiteRxViolations(sentence: string): string[] {
  const found: string[] = [];
  for (const pattern of PARASITE_RX) {
    for (const clause of parasiteClauses(sentence)) {
      const hit = pattern.exec(clause);
      if (hit && !PARASITE_EXEMPT.test(clause)) found.push(hit[0]);
    }
  }
  return found;
}

describe("parasite prescription across the article library", () => {
  it("prescribes no universal parasite age, product or cadence in any article", () => {
    const offenders: string[] = [];
    for (const { slug, body } of ARTICLE_BODIES) {
      for (const sentence of body.split(/(?<=[.?!])\s+/)) {
        for (const hit of parasiteRxViolations(sentence)) {
          offenders.push(`${slug}: "${hit}" in "${sentence.trim().slice(0, 110)}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("catches the sentence the hardening report said nothing caught", () => {
    expect(
      parasiteRxViolations("Start heartworm prevention at 8 weeks and continue monthly."),
      "the known gap is still open",
    ).not.toEqual([]);
  });

  it("catches the rest of the family", () => {
    for (const sentence of [
      "Every puppy needs monthly heartworm medication.",
      "Begin tick prevention at 12 weeks.",
      "All Canadian dogs need parasite medication from eight weeks.",
      "Give heartworm prevention every month.",
      "All dogs require flea prevention.",
    ]) {
      expect(parasiteRxViolations(sentence), `missed: ${sentence}`).not.toEqual([]);
    }
  });

  it("allows risk-based, label-based and veterinarian-directed prose", () => {
    for (const sentence of [
      "What parasite prevention does this puppy need here, and when does it start?",
      "Ask your veterinarian when to start heartworm prevention and whether it runs to a fixed end date.",
      "Many parasite products carry a minimum age or weight on the label, so the product decides that, not the calendar.",
      "1 June is the Canadian convention for starting heartworm prevention, and the reason is arithmetic about mosquitoes and temperature.",
      "Whether your dog needs tick prevention depends on where you live and where you travel.",
      "We do not publish one national parasite schedule, because the right one depends on your region and your veterinarian.",
    ]) {
      expect(parasiteRxViolations(sentence), `false positive: ${sentence}`).toEqual([]);
    }
  });
});

describe("Batch C — veterinary and medical evidence", () => {
  const body = (slug: string) => ARTICLE_BODIES.find((a) => a.slug === slug)!.body;
  const sourceUrls = (slug: string) =>
    (articles.find((a) => a.slug === slug)!.sources ?? []).map((x) => x.url).join(" ");

  it("follows the current PHAC risk-area map for blacklegged ticks", () => {
    const b = body("parasite-prevention-for-pets-in-canada");
    // The stale four-province list is gone.
    expect(b).not.toMatch(/established in southern Manitoba, southern and southeastern Ontario/i);
    expect(b).not.toMatch(/risk there has been comparatively stable/i);

    // PHAC's own terminology and coverage, including what was missing.
    expect(b).toMatch(/Public Health Agency of Canada/);
    expect(b).toMatch(/risk area/i);
    expect(b).toMatch(/New Brunswick/);
    expect(b).toMatch(/all of Nova Scotia/i);
    expect(b).toMatch(/53rd parallel/);
    expect(b).toMatch(/Vancouver Island/);
    // And PHAC's two caveats.
    expect(b).toMatch(/spreading to new areas/i);
    expect(b).toMatch(/outside the areas where they are known to live/i);
    expect(sourceUrls("parasite-prevention-for-pets-in-canada")).toMatch(/risk-lyme-disease/);
  });

  it("attributes the heartworm trend to the study, with its own limitation", () => {
    const b = body("parasite-prevention-for-pets-in-canada");
    expect(b).toMatch(/McGill/);
    expect(b).toMatch(/2007/);
    expect(b).toMatch(/tested/i);
    // The limitation the authors state, in the prose rather than a footnote.
    expect(b).toMatch(/only dogs that see a veterinarian and get tested/i);
    expect(b).toMatch(/not a measurement of every dog/i);
    expect(sourceUrls("parasite-prevention-for-pets-in-canada")).toContain("PMC6515813");
  });

  it("names the compound and sources the contact route for cats", () => {
    const b = body("parasite-prevention-for-pets-in-canada");
    expect(b).toMatch(/permethrin/i);
    expect(b).toMatch(/Merck/);
    expect(b).toMatch(/Pfister and Armstrong/);
    expect(b).toMatch(/contact with a permethrin-treated dog/i);
    expect(b).toMatch(/label says it is for cats/i);
    // Escalation, and nothing resembling treatment.
    expect(b).toMatch(/emergency|straight away/i);
    expect(b).not.toMatch(/induce vomiting/i);
    expect(b).not.toMatch(/\bmg\/kg\b|\bantidote\b|\bwash the cat with\b/i);
    expect(sourceUrls("parasite-prevention-for-pets-in-canada")).toContain("PMC4977707");
  });

  it("removes ticks the way the public health authority says to", () => {
    const b = body("parasite-prevention-for-pets-in-canada");
    expect(b).toMatch(/fine-tipped tweezers/i);
    expect(b).toMatch(/as close to the skin/i);
    expect(b).toMatch(/without twisting/i);
    expect(b).toMatch(/clean the bite/i);
    // The methods that must be named as wrong.
    expect(b).toMatch(/lit match/i);
    expect(b).toMatch(/petroleum jelly/i);
    expect(b).toMatch(/alcohol/i);
  });

  it("matches AAHA's sterilization table exactly, and claims no universal age", () => {
    const b = body("spaying-and-neutering-in-canada");
    // AAHA 2019 Textbox 1, read from the PDF.
    expect(b).toMatch(/45 lb/);
    expect(b).toMatch(/six months/i);
    expect(b).toMatch(/first heat/i);
    expect(b).toMatch(/five to six months|5 to 6 months/i);
    expect(b).toMatch(/9 (?:and|to) 15 months/i);
    expect(b).toMatch(/5 (?:and|to) 15 months/i);
    // No single answer.
    expect(b).toMatch(/no universal age/i);
    expect(b).not.toMatch(/neuter (?:all|every) dogs? at six months/i);
    expect(sourceUrls("spaying-and-neutering-in-canada")).toMatch(/canine-life-stage/);
  });

  it("drops the growth-plate mechanism and keeps associations as associations", () => {
    const b = body("spaying-and-neutering-in-canada");
    expect(b).not.toMatch(/sex hormones are part of what tells long bones to stop growing/i);
    // What replaced it is AAHA's own trade-off.
    expect(b).toMatch(/mammary neoplasia/i);
    expect(b).toMatch(/urethral sphincter mechanism incompetence/i);
    expect(b).toMatch(/clinical discretion/i);
    // Association language survives; causation does not appear.
    expect(b).toMatch(/associated in some breeds/i);
    expect(b).not.toMatch(/early neutering causes/i);
  });

  it("gives AVMA's parked-car figures as a rise above ambient, qualified", () => {
    const b = body("summer-heat-safety-for-dogs-in-canada");
    // The old absolutes are gone.
    expect(b).not.toMatch(/the inside of a car exceeds 38 °C \(100 °F\) within ten minutes/i);
    // AVMA's actual table shape, and its more useful point.
    expect(b).toMatch(/19 °F/);
    expect(b).toMatch(/43 °F/);
    expect(b).toMatch(/above/i);
    expect(b).toMatch(/much the same whether it is 70 °F or 110 °F outside/i);
    expect(b).toMatch(/averages across vehicles/i);
    expect(b).toMatch(/cracking the windows makes no difference/i);
    expect(sourceUrls("summer-heat-safety-for-dogs-in-canada")).toMatch(/pets-vehicles/);
  });

  it("carries no unsourced numeric pavement threshold", () => {
    const b = body("summer-heat-safety-for-dogs-in-canada");
    // Seven seconds may only appear in the sentence retiring it.
    for (const sentence of b.split(/(?<=[.?!])\s+/)) {
      if (!/seven[- ]second|seven seconds/i.test(sentence)) continue;
      expect(sentence, "seven seconds is still given as a rule").toMatch(
        /stopped giving|removed|no longer/i,
      );
    }
    expect(b).not.toMatch(/if you cannot keep it there comfortably for seven seconds/i);
    // The replacement is qualitative, with the attributed variant and the escalation.
    expect(b).toMatch(/Put a hand flat on the surface/i);
    expect(b).toMatch(/VCA/);
    expect(b).toMatch(/ten seconds/i);
    expect(b).toMatch(/screening test, not a measurement/i);
    expect(b).toMatch(/veterinary attention/i);
    expect(sourceUrls("summer-heat-safety-for-dogs-in-canada")).toMatch(/dog-paw-injuries/);
  });

  it("keeps the double-coat advice non-categorical and sourced", () => {
    const b = body("summer-heat-safety-for-dogs-in-canada");
    expect(b).not.toMatch(/never shave/i);
    expect(b).not.toMatch(/should not be shaved off/i);
    expect(b).toMatch(/warm-weather haircut/i);
    expect(b).toMatch(/AVMA/);
    expect(b).toMatch(/medical and grooming reasons/i);
  });

  it("keeps heatstroke advice from delaying veterinary care", () => {
    const b = body("summer-heat-safety-for-dogs-in-canada");
    expect(b).toMatch(/cool — not ice-cold/i);
    expect(b).toMatch(/Do not\s+delay transport/i);
    expect(b).toMatch(/closest veterinary/i);
    // No home treatment offered as a substitute, and no dosing.
    expect(b).not.toMatch(/\bmg\/kg\b|\baspirin\b|\bibuprofen\b/i);
    expect(b).not.toMatch(/ice bath|submerge/i);
  });

  it("agrees with the Puppy Journey on the shared claims", () => {
    const spay = body("spaying-and-neutering-in-canada");
    // The Journey's verified AAHA split, unchanged here.
    expect(spay).toMatch(/45 lb/);
    // No universal parasite schedule anywhere in the batch.
    for (const slug of [
      "parasite-prevention-for-pets-in-canada",
      "spaying-and-neutering-in-canada",
      "summer-heat-safety-for-dogs-in-canada",
    ]) {
      const b = body(slug);
      for (const sentence of b.split(/(?<=[.?!])\s+/)) {
        expect(parasiteRxViolations(sentence), `${slug}: ${sentence.slice(0, 90)}`).toEqual([]);
        expect(folkloreViolations(sentence), `${slug}: ${sentence.slice(0, 90)}`).toEqual([]);
      }
    }
  });

  it("leaves no publication blocker in the three Batch C articles", () => {
    const BLOCKING =
      /before publication|before it is published|attach a source or cut|source it before|confirm .{0,40}before|could not be (?:retrieved|confirmed|verified)|not yet sourced|re-check .{0,30}before|attach the underlying study|attach a (?:veterinary|toxicology|public health|conservation) source/i;

    for (const slug of [
      "parasite-prevention-for-pets-in-canada",
      "spaying-and-neutering-in-canada",
      "summer-heat-safety-for-dogs-in-canada",
    ]) {
      const items = articles.find((a) => a.slug === slug)!.needsVerification ?? [];
      const open = items.filter(
        (item) => BLOCKING.test(item) && !/^(?:RESOLVED|STANDING GUARDRAIL)/.test(item),
      );
      expect(open, `${slug} still has publication blockers`).toEqual([]);
    }
  });
});

/**
 * ## Absolute legal language, flagged for a human
 *
 * This project has now made the same mistake twice: "British Columbia sets no
 * legal requirement at all", and "premium, holistic and human-grade have no
 * defined legal meaning in Canada". Both were exhaustive negatives, both were
 * unsupported, and both survived several reviews because they read like
 * confident editorial prose rather than like claims.
 *
 * This does not certify legality — nothing here could. It flags the *shape* of
 * a claim that needs a named instrument behind it: a universal negative
 * ("no requirement anywhere", "never transfer", "no legal meaning") or a
 * universal positive across jurisdictions ("every province requires"). A hit
 * means a human checks the source, not that the sentence is wrong.
 *
 * Qualified constructions pass, because they are how these claims should be
 * written when the absence cannot be proved: "we are not presenting", "we
 * could not find", "check your new municipality", "varies by jurisdiction".
 */
const ABSOLUTE_LEGAL = [
  // Exhaustive negatives.
  /\bno legal (?:requirement|meaning|obligation|definition)\b(?![^.]{0,40}\b(?:we|could not|not presenting)\b)/i,
  /\bnot legally required\b|\bno provincial law\b|\bdoes not compel\b/i,
  /\b(?:municipal\s+)?licen[cs]es?\b[^.]{0,80}\b(?:never|do not|does not)\s+transfer\b/i,
  /\b(?:never|do not|does not)\s+transfer\b[^.]{0,40}\b(?:municipalit|cities|province)/i,
  /\bno (?:municipality|province|city)\b[^.]{0,40}\brequires?\b/i,
  /\bhas no legal meaning in Canada\b/i,
  // Universal positives across jurisdictions.
  /\bevery (?:province|territory|municipality|Canadian city)\b[^.]{0,60}\b(?:requires?|must|has the same|maintains)\b/i,
  /\ball (?:provinces|territories|municipalities)\b[^.]{0,50}\b(?:require|must|have the same)\b/i,
  /\bin every (?:province|territory|jurisdiction)\b/i,
];

/** Wording that makes an absolute claim a qualified one. */
const LEGAL_QUALIFIED =
  /\bwe are not (?:presenting|claiming|asserting)\b|\bwe could not (?:find|verify)\b|\bwe have not (?:checked|verified)\b|\bnot the same (?:as|in)\b|\bvaries by\b|\bdiffers? (?:by|from)\b|\bcheck (?:your|the) (?:new )?(?:municipalit|province|city|regulator)\w*\b|\bconfirm\b|\bask\b|\bcurrently lists?\b|\bas of\b|\brather than assum\w+\b|\bdo not assume\b/i;

function legalClauses(sentence: string): string[] {
  return sentence
    .split(/\s*[;—]\s*|,\s+(?:then|and then|but|so|which|where)\s+/)
    .filter((part) => part.trim().length > 0);
}

/** Absolute legal constructions in one sentence, unqualified in their clause. */
function absoluteLegalClaims(sentence: string): string[] {
  const found: string[] = [];
  for (const pattern of ABSOLUTE_LEGAL) {
    for (const clause of legalClauses(sentence)) {
      const hit = pattern.exec(clause);
      if (hit && !LEGAL_QUALIFIED.test(clause)) found.push(hit[0]);
    }
  }
  return found;
}

describe("absolute legal language across the article library", () => {
  it("flags no unqualified absolute legal claim in any article", () => {
    const offenders: string[] = [];
    for (const { slug, body } of ARTICLE_BODIES) {
      for (const sentence of body.split(/(?<=[.?!])\s+/)) {
        for (const hit of absoluteLegalClaims(sentence)) {
          offenders.push(`${slug}: "${hit}" in "${sentence.trim().slice(0, 120)}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("flags the constructions that got through before", () => {
    for (const sentence of [
      "British Columbia has no legal requirement at all.",
      "Pet licences never transfer between Canadian cities.",
      // The phrasing that slipped past the first version of this guard.
      "Municipal licences are issued by one municipality and generally do not transfer.",
      "Premium has no legal meaning in Canada.",
      "Every province has the same complaint process.",
      "No municipality requires cats to be licensed.",
      "The regulator is the destination for a complaint in every province.",
    ]) {
      expect(absoluteLegalClaims(sentence), `missed: ${sentence}`).not.toEqual([]);
    }
  });

  it("passes claims written the way these should be written", () => {
    for (const sentence of [
      "We are not presenting a province-wide legal vaccination requirement for British Columbia here.",
      "Check your new municipality rather than assuming a licence transfers.",
      "The complaint process varies by jurisdiction.",
      "As of September 2026, Toronto lists $25.00 for a spayed or neutered dog.",
      "We could not find a Canadian definition behind any of them.",
      "Do not assume the answer matches a neighbouring city.",
      // Negating uniformity is the safe form of the same sentence.
      "Confirm the pet position under your new province's tenancy law — it is not the same in every province.",
    ]) {
      expect(absoluteLegalClaims(sentence), `false positive: ${sentence}`).toEqual([]);
    }
  });
});

describe("Batch A — Canadian legal and regulatory evidence", () => {
  const body = (slug: string) => ARTICLE_BODIES.find((a) => a.slug === slug)!.body;
  const sourceUrls = (slug: string) =>
    (articles.find((a) => a.slug === slug)!.sources ?? []).map((x) => x.url).join(" ");

  it("states Vancouver's dog rule and asserts nothing about cats", () => {
    const b = body("pet-licensing-across-canada");
    expect(b).toMatch(/Animal Control By-law No\. 9150/);
    expect(b).toMatch(/three months and older require a licence/i);
    // The unverifiable half is declared rather than inferred.
    expect(b).toMatch(/not presenting a position on cats/i);
    expect(b).toMatch(/Vancouver Animal Services/);
    expect(b).not.toMatch(/Vancouver does not licence cats|Vancouver does not license cats/i);
  });

  it("dates and attributes the Toronto fees, and does not universalise them", () => {
    const b = body("pet-licensing-across-canada");
    expect(b).toMatch(/September 2026/);
    expect(b).toMatch(/\$25\.00/);
    expect(b).toMatch(/\$60\.00/);
    // The tiers that stop the headline figures reading as the whole picture.
    expect(b).toMatch(/65 and over/i);
    expect(b).toMatch(/\$50,000/);
    expect(b).toMatch(/not a Canadian price/i);
    expect(sourceUrls("pet-licensing-across-canada")).toMatch(/pet-licensing-fees/);
  });

  it("matches Edmonton's current bylaw and drops the unverified inclusion", () => {
    const b = body("pet-licensing-across-canada");
    expect(b).toMatch(/over 6 months of age/i);
    expect(b).toMatch(/19 May 2026/);
    expect(b).toMatch(/\$250/);
    // The microchip-inclusion claim is gone.
    expect(b).not.toMatch(/Edmonton's licence includes a microchip/i);
    expect(b).toMatch(/separate microchip programme/i);
  });

  it("claims no universal rule about licences transferring", () => {
    const b = body("pet-licensing-across-canada");
    expect(b).not.toMatch(/generally do not transfer/i);
    expect(b).not.toMatch(/never transfer/i);
    expect(b).toMatch(/Licensing is municipal/i);
    expect(b).toMatch(/not claiming none does/i);
    for (const sentence of b.split(/(?<=[.?!])\s+/)) {
      expect(absoluteLegalClaims(sentence), sentence.slice(0, 90)).toEqual([]);
    }
  });

  it("separates the mandatory pet-food label items from the recommended ones", () => {
    const b = body("reading-a-canadian-pet-food-label");
    expect(b).toMatch(/Consumer Packaging and Labelling Act/);
    expect(b).toMatch(/legal floor/i);
    // The three federal bodies, each with what the guide says it does.
    expect(b).toMatch(/inedible meat products/i);
    expect(b).toMatch(/unsubstantiated health claims/i);
    expect(b).toMatch(/bilingual common name/i);
    // And the softened version of the exhaustive negative.
    expect(b).toMatch(/None of those three is setting nutritional standards/i);
    expect(b).not.toMatch(/There is no federal agency setting nutritional standards/i);
  });

  it("does not present the pre-cooking measurement point as Canadian law", () => {
    const b = body("reading-a-canadian-pet-food-label");
    expect(b).toMatch(/descending order by percentage of weight/i);
    // Where the "before cooking" explanation comes from is now stated.
    expect(b).toMatch(/does not say at what point that weight is taken|What it does not say is at which point/i);
    expect(b).toMatch(/US labelling practice/i);
    expect(b).not.toMatch(/weight is measured \*\*as the ingredient goes into the batch/i);
    // Splitting is an interpretive term, not a legal one.
    expect(b).toMatch(/interpretive term/i);
  });

  it("makes no unsupported negative claim about marketing terms", () => {
    const b = body("reading-a-canadian-pet-food-label");
    expect(b).not.toMatch(/have no defined legal meaning in Canada/i);
    expect(b).not.toMatch(/not standing on a Canadian definition/i);
    // What replaced it.
    expect(b).toMatch(/appear nowhere in the Competition Bureau/i);
    expect(b).toMatch(/is not the same as .{0,20}none exists/i);
    expect(b).toMatch(/accurate, not misleading/i);
  });

  it("never calls AAFCO a Canadian regulator", () => {
    const b = body("reading-a-canadian-pet-food-label");
    expect(b).toMatch(/Association of American Feed Control Officials/);
    expect(b).toMatch(/American voluntary standard/i);
    expect(b).toMatch(/not a Canadian government approval/i);
    expect(b).not.toMatch(/AAFCO (?:regulates|requires|approves) .{0,20}Canad/i);
    expect(b).not.toMatch(/Canadian regulator[^.]{0,30}AAFCO/i);
  });

  it("claims no uniform veterinary register across thirteen jurisdictions", () => {
    const b = body("finding-a-veterinarian-in-canada");
    expect(b).not.toMatch(/every province and territory[^.]{0,60}register/i);
    expect(b).toMatch(/there is one national lookup, because there is not/i);
    expect(b).toMatch(/have not verified that every/i);
    // The two territories are government departments, and Yukon is absent.
    expect(b).toMatch(/government department/i);
    expect(b).toMatch(/Yukon is not on that list/i);
    expect(sourceUrls("finding-a-veterinarian-in-canada")).toMatch(/regulatory-bodies/);
  });

  it("routes complaints by category rather than uniformly to the regulator", () => {
    const b = body("finding-a-veterinarian-in-canada");
    expect(b).toMatch(/professional conduct/i);
    expect(b).toMatch(/billing|a bill/i);
    expect(b).toMatch(/animal welfare/i);
    expect(b).toMatch(/SPCA/);
    expect(b).toMatch(/do not assume the answer is the same as one province over/i);
  });

  it("leaves no publication blocker in the three Batch A articles", () => {
    const BLOCKING =
      /before publication|before it is published|attach a source or cut|source it before|confirm .{0,40}before|could not be (?:retrieved|confirmed|verified)|not yet sourced|re-check .{0,30}before|resolve this before/i;
    for (const slug of [
      "pet-licensing-across-canada",
      "reading-a-canadian-pet-food-label",
      "finding-a-veterinarian-in-canada",
    ]) {
      const items = articles.find((a) => a.slug === slug)!.needsVerification ?? [];
      const open = items.filter(
        (item) => BLOCKING.test(item) && !/^(?:RESOLVED|STANDING GUARDRAIL|OPEN \(NON-BLOCKING\))/.test(item),
      );
      expect(open, `${slug} still has publication blockers`).toEqual([]);
    }
  });

  it("keeps every source on these three articles a current official page", () => {
    // Checked live during the batch; recorded here so a dead link is a visible
    // decision rather than a silent one.
    const expected: Record<string, RegExp[]> = {
      "pet-licensing-across-canada": [/toronto\.ca/, /ottawa\.ca/, /calgary\.ca/, /edmonton\.ca/, /vancouver\.ca/],
      "reading-a-canadian-pet-food-label": [/competition-bureau\.canada\.ca/, /inspection\.canada\.ca/],
      "finding-a-veterinarian-in-canada": [/canadianveterinarians\.net/],
    };
    for (const [slug, patterns] of Object.entries(expected)) {
      const urls = sourceUrls(slug);
      for (const pattern of patterns) {
        expect(urls, `${slug} lost ${pattern}`).toMatch(pattern);
      }
      // Official domains only — no blog or aggregator crept in.
      for (const url of (articles.find((a) => a.slug === slug)!.sources ?? []).map((x) => x.url)) {
        expect(url, `${slug}: ${url}`).toMatch(/\.ca\/|\.gc\.ca|canada\.ca|canadianveterinarians\.net/);
      }
    }
  });
});

/**
 * The day the dependency cluster first went public.
 *
 * Not a drafting, commit or remediation date. If a later launch moves it, this
 * constant and the registry move together — the tests below compare the two.
 */
const LAUNCH_DATE = "2026-09-06";

/** The fifteen articles the Puppy Journey links from its stages. */
const JOURNEY_DEPENDENCIES = [
  "bringing-home-a-puppy-first-30-days",
  "crate-training-a-puppy-in-canada",
  "puppy-socialisation-checklist",
  "puppy-vaccination-schedule-in-canada",
  "loose-leash-walking-and-recall",
  "spaying-and-neutering-in-canada",
  "dental-care-for-dogs-and-cats",
  "parasite-prevention-for-pets-in-canada",
  "finding-a-veterinarian-in-canada",
  "pet-licensing-across-canada",
  "reading-a-canadian-pet-food-label",
  "emergency-vet-visits-in-canada",
  "cost-of-owning-a-dog-in-canada",
  "winter-dog-care-in-canada",
  "summer-heat-safety-for-dogs-in-canada",
] as const;

/** Register wording that means an item is still blocking publication. */
const BLOCKING_ITEM =
  /before publication|before it is published|before publishing|attach a source or cut|source it before|confirm .{0,40}before|could not be (?:retrieved|confirmed|verified)|not yet sourced|re-check .{0,30}before|attach the underlying study|attach a (?:veterinary|toxicology|public health|conservation) source|resolve this before/i;

describe("Batch D — vaccination and cost evidence", () => {
  const body = (slug: string) => ARTICLE_BODIES.find((a) => a.slug === slug)!.body;
  const sourceUrls = (slug: string) =>
    (articles.find((a) => a.slug === slug)!.sources ?? []).map((x) => x.url).join(" ");

  it("renders Alberta's post-exposure rule conditionally, from the province's own page", () => {
    const b = body("puppy-vaccination-schedule-in-canada");
    // The two halves of the condition, not just "unvaccinated".
    expect(b).toMatch(/unvaccinated \*or which do not receive a booster promptly/i);
    expect(b).toMatch(/three- to six-month quarantine/i);
    expect(b).toMatch(/within 96 hours/i);
    expect(b).toMatch(/will not require quarantine/i);
    expect(b).toMatch(/public health veterinarian/i);
    expect(b).toMatch(/risk assessment/i);
    // Alberta's framework, not the country's.
    expect(b).toMatch(/Alberta's framework, not the country's/i);
    expect(b).not.toMatch(/across Canada[^.]{0,40}quarantine/i);
    expect(sourceUrls("puppy-vaccination-schedule-in-canada")).toMatch(/alberta\.ca\/rabies-information/);
  });

  it("keeps the already-resolved vaccination material correct", () => {
    const b = body("puppy-vaccination-schedule-in-canada");
    // Ontario, inclusive, from the regulation.
    expect(b).toMatch(/three months of age or over/);
    expect(b).not.toMatch(/over three months of age/);
    // BC, no unsupported negative.
    expect(b).not.toMatch(/sets no legal requirement|no legal requirement at all/i);
    expect(b).toMatch(/not presenting a province-wide legal requirement/i);
    // Core-series framing intact, and no age-alone prescription anywhere.
    expect(b).toMatch(/sixteen weeks or later|past 16 weeks|older than sixteen weeks/i);
    expect(b).toMatch(/26 weeks/);
    expect(b).toMatch(/twelve-month (?:booster|appointment)|twelve to sixteen months/i);
    for (const sentence of b.split(/(?<=[.?!])\s+/)) {
      expect(parasiteRxViolations(sentence), sentence.slice(0, 90)).toEqual([]);
      expect(absoluteLegalClaims(sentence), sentence.slice(0, 90)).toEqual([]);
    }
  });

  it("sources the licence-fee differential from two municipalities, dated", () => {
    const b = body("cost-of-owning-a-dog-in-canada");
    expect(b).toMatch(/September 2026/);
    expect(b).toMatch(/Toronto lists \$25\.00/);
    expect(b).toMatch(/\$60\.00/);
    expect(b).toMatch(/Calgary lists \$45/);
    expect(b).toMatch(/\$71/);
    // Two cities is not a national pattern, and the article says so.
    expect(b).toMatch(/not a Canadian pattern/i);
    expect(b).not.toMatch(/Canadian cities generally charge/i);
    const urls = sourceUrls("cost-of-owning-a-dog-in-canada");
    expect(urls).toMatch(/toronto\.ca/);
    expect(urls).toMatch(/calgary\.ca/);
  });

  it("sources adoption bundling as named examples rather than a rule", () => {
    const b = body("cost-of-owning-a-dog-in-canada");
    expect(b).toMatch(/BC SPCA/);
    expect(b).toMatch(/Calgary Humane Society/);
    expect(b).toMatch(/Some adoption fees bundle/i);
    expect(b).toMatch(/two organisations, not a national rule/i);
    expect(b).not.toMatch(/Rescue fees usually bundle/i);
    const urls = sourceUrls("cost-of-owning-a-dog-in-canada");
    expect(urls).toMatch(/spca\.bc\.ca/);
    expect(urls).toMatch(/calgaryhumane\.ca/);
  });

  it("states the food-cost relationship the way Merck states it", () => {
    const b = body("cost-of-owning-a-dog-in-canada");
    // The old claim was wrong, not merely unsourced.
    expect(b).not.toMatch(/scales almost directly with the dog/i);
    expect(b).toMatch(/not a linear function of body weight/i);
    expect(b).toMatch(/power of 0\.75/);
    expect(b).toMatch(/costs multiples of a small one/i);
    expect(b).toMatch(/30%/);
    expect(sourceUrls("cost-of-owning-a-dog-in-canada")).toMatch(/merckvetmanual\.com\/management-and-nutrition/);
    // No ration calculator crept in.
    expect(b).not.toMatch(/\bkcal\b/i);
  });

  it("publishes no national cost figure, and no unsourced price", () => {
    const article = articles.find((a) => a.slug === "cost-of-owning-a-dog-in-canada")!;
    const b = body("cost-of-owning-a-dog-in-canada");

    // The Sources section is no longer empty.
    expect((article.sources ?? []).length).toBeGreaterThanOrEqual(5);

    // Every dollar figure is dated and attributed to the city that sets it.
    const priced = b.split(/(?<=[.?!])\s+/).filter((x) => /\$\s?[\d,]/.test(x));
    expect(priced.length).toBeGreaterThan(0);
    for (const sentence of priced) {
      expect(sentence, `undated price: ${sentence.slice(0, 110)}`).toMatch(/as of \w+ \d{4}/i);
      expect(sentence, `unattributed price: ${sentence.slice(0, 110)}`).toMatch(/Toronto|Calgary/);
    }

    // And the article still refuses a national number.
    expect(b).toMatch(/does not give you a number, and that is deliberate/i);
    expect(b).not.toMatch(/the average (?:Canadian )?dog costs/i);
    expect(b).not.toMatch(/costs? about \$[\d,]+ (?:a|per) year/i);
  });
});

describe("Puppy Journey dependency set", () => {
  it("covers exactly the fifteen articles the Journey links", () => {
    expect(JOURNEY_DEPENDENCIES).toHaveLength(15);
    for (const slug of JOURNEY_DEPENDENCIES) {
      expect(articles.some((a) => a.slug === slug), `${slug} is missing`).toBe(true);
    }
  });

  it("leaves zero publication blockers across all fifteen", () => {
    const blockers: string[] = [];
    for (const slug of JOURNEY_DEPENDENCIES) {
      const items = articles.find((a) => a.slug === slug)!.needsVerification ?? [];
      for (const item of items) {
        if (!BLOCKING_ITEM.test(item)) continue;
        if (/^(?:RESOLVED|STANDING GUARDRAIL|OPEN \(NON-BLOCKING\))/.test(item)) continue;
        blockers.push(`${slug}: ${item.slice(0, 120)}`);
      }
    }
    expect(blockers).toEqual([]);
  });

  /**
   * The last blocker was the claim that very young animals have less
   * physiological reserve and deteriorate faster than adults.
   *
   * These tests are deliberately written against the prose and the sources
   * rather than against the register label, because a register label can be
   * changed by hand and prose cannot be changed without changing what the
   * reader is told. Relabelling the item would not make any of them pass.
   */
  describe("the physiological-reserve claim", () => {
    const RESERVE_ARTICLES = [
      "emergency-vet-visits-in-canada",
      "bringing-home-a-puppy-first-30-days",
      "bringing-home-a-kitten-first-30-days",
    ] as const;

    const body = (slug: string) => ARTICLE_BODIES.find((a) => a.slug === slug)!.body;
    const sourceText = (slug: string) =>
      (articles.find((a) => a.slug === slug)!.sources ?? [])
        .map((x) => `${x.label} ${x.publisher} ${x.url}`)
        .join(" ");

    it("1. asserts the broad reserve claim in no article in the library", () => {
      // The unsourced generalisation, in any of the three phrasings it had.
      const broad =
        /(?:far )?less reserve than an adult|little reserve\b|lacks? (?:the )?reserves? of an adult|deteriorates? faster than (?:an )?adults?|go(?:es)? downhill quickly/i;
      const offenders = ARTICLE_BODIES.filter(({ body }) => broad.test(body)).map((a) => a.slug);
      expect(offenders).toEqual([]);
    });

    it("2. states no universal claim about reserve across every organ system", () => {
      for (const slug of RESERVE_ARTICLES) {
        expect(body(slug), slug).not.toMatch(/physiological(?:ly)? reserve/i);
        expect(body(slug), slug).not.toMatch(/weak immune system|immature immune system/i);
        // No "every"/"any" symptom generalisation — asserted. A sentence that
        // *denies* the generalisation ("not that every symptom is more
        // dangerous") is the opposite of the failure, so the clause is only a
        // violation when nothing negates it.
        const claim =
          /(?:every|any|all) (?:symptom|illness|problem)s? (?:is|are) (?:more|far more) (?:dangerous|serious)/i;
        for (const clause of body(slug).split(/(?<=[.?!])\s+|(?:, | \u2014 )/)) {
          if (!claim.test(clause)) continue;
          expect(clause, `${slug}: ${clause}`).toMatch(/\bnot\b|\bnever\b|\brather than\b/i);
        }
      }
    });

    it("3. keeps only the mechanisms the sources actually establish", () => {
      const b = body("emergency-vet-visits-in-canada");
      // Fluid — Lee & Cohn, pediatric.
      expect(b).toMatch(/mild dehydration to hypovolaemia/i);
      expect(b).toMatch(/more fluid than adults/i);
      // Glucose and temperature — Merck, neonatal.
      expect(b).toMatch(/hypoglycaemia/i);
      expect(b).toMatch(/thermoregulatory mechanisms until four weeks/i);
    });

    it("4. carries the real age scope beside each mechanism, not a vague 'very young'", () => {
      const b = body("emergency-vet-visits-in-canada");
      // Pediatric is defined, and the neonatal findings are marked as neonatal.
      expect(b).toMatch(/pediatric patients .{0,120}six months/is);
      expect(b).toMatch(/neonatal period at the first 21 days/i);
      expect(b).toMatch(/neonates/i);
    });

    it("5. explicitly denies the overbroad reading it used to imply", () => {
      expect(body("emergency-vet-visits-in-canada")).toMatch(
        /not that every symptom is more dangerous in a young animal/i,
      );
    });

    it("6. retains the actionable advice: call sooner for a young animal", () => {
      const b = body("emergency-vet-visits-in-canada");
      expect(b).toMatch(/earns a call sooner than the same thing would in an adult/i);
      expect(b).toMatch(/same lower threshold applies/i);
      expect(body("bringing-home-a-puppy-first-30-days")).toMatch(/worth a call sooner/i);
    });

    it("7. attaches a real source to the claim in every article that makes it", () => {
      for (const slug of RESERVE_ARTICLES) {
        // The peer-reviewed pediatric fluid-therapy paper.
        expect(sourceText(slug), slug).toMatch(/27939859/);
      }
      // The emergency guide additionally carries Merck and the scope anchor.
      const emergency = sourceText("emergency-vet-visits-in-canada");
      expect(emergency).toMatch(/management-of-the-neonate/);
      expect(emergency).toMatch(/10390787/);
    });

    it("8. keeps the three articles from drifting apart on the same claim", () => {
      for (const slug of RESERVE_ARTICLES) {
        // Each names dehydration, and none reverts to a bare reserve claim.
        expect(body(slug), slug).toMatch(/dehydration/i);
      }
      // Both 30-days guides name low blood sugar in plain words, as they must.
      for (const slug of RESERVE_ARTICLES.slice(1)) {
        expect(body(slug), slug).toMatch(/low blood sugar/i);
      }
    });

    it("9. adds no numeric threshold for when to call", () => {
      const b = body("emergency-vet-visits-in-canada");
      // Hours/times that would read as an action cutoff.
      expect(b).not.toMatch(
        /(?:call|phone|seek|go)[^.]{0,60}\bwithin \d+\s*(?:hours?|minutes?)/i,
      );
      expect(b).not.toMatch(/\bmore than \d+\s*(?:hours?|times?)[^.]{0,40}(?:call|emergency)/i);
      // The only figures near the young-animal passage are source age scopes.
      const passage = b.slice(b.indexOf("Two smaller notes"), b.indexOf("Two smaller notes") + 1400);
      for (const n of passage.match(/\b\d+\b/g) ?? []) {
        expect(["21", "4"], `unexpected figure ${n}`).toContain(n);
      }
    });
  });

  /**
   * The safety sweep over the emergency advice that was already there. These
   * are the properties the brief names, checked against the prose rather than
   * assumed from the earlier gate.
   */
  it("keeps the emergency advice free of diagnosis, doses and home treatment", () => {
    const b = ARTICLE_BODIES.find((a) => a.slug === "emergency-vet-visits-in-canada")!.body;
    // No instruction *to* induce vomiting. The article does discuss induced
    // vomiting — to forbid it without veterinary direction, and to explain why
    // for corrosives and petroleum distillates — so the check is on direction,
    // not on the phrase. Every mention must be negated or conditioned.
    for (const clause of b.split(/(?<=[.?!])\s+/)) {
      if (!/induce vomiting|making an animal vomit|make (?:your|the) (?:dog|cat|pet) (?:vomit|sick)/i.test(clause)) {
        continue;
      }
      expect(clause, `unqualified emesis instruction: ${clause}`).toMatch(
        /\bdo not\b|\bnever\b|\bunless\b|\bcontraindicated\b|\bdanger\b|\bbrings the corrosive\b/i,
      );
    }
    expect(b).not.toMatch(/hydrogen peroxide/i);
    // No medication or dose.
    expect(b).not.toMatch(
      /\b\d+\s*(?:mg|ml|mcg|g)\b|\bper (?:kg|kilogram|pound|lb)\b|benadryl|diphenhydramine|ibuprofen|acetaminophen|aspirin/i,
    );
    // No home treatment offered as an alternative to care.
    expect(b).not.toMatch(/instead of (?:calling|seeing) (?:a|your) vet/i);
    expect(b).not.toMatch(/wait (?:it )?out (?:overnight|until morning)/i);
    // The disclaimer that it does not diagnose is still present.
    expect(b).toMatch(/Nothing here is a diagnosis/i);
  });

  it("holds every earlier batch's guard across the whole dependency set", () => {
    for (const slug of JOURNEY_DEPENDENCIES) {
      const { body } = ARTICLE_BODIES.find((a) => a.slug === slug)!;
      for (const sentence of body.split(/(?<=[.?!])\s+/)) {
        // Batch B: behaviour folklore.
        expect(folkloreViolations(sentence), `${slug}: ${sentence.slice(0, 80)}`).toEqual([]);
        // Batch C: parasite prescription.
        expect(parasiteRxViolations(sentence), `${slug}: ${sentence.slice(0, 80)}`).toEqual([]);
        // Batch A: absolute legal language.
        expect(absoluteLegalClaims(sentence), `${slug}: ${sentence.slice(0, 80)}`).toEqual([]);
      }
    }
  });

  it("gives every dependency article a real source", () => {
    for (const slug of JOURNEY_DEPENDENCIES) {
      const article = articles.find((a) => a.slug === slug)!;
      expect((article.sources ?? []).length, `${slug} has no sources`).toBeGreaterThan(0);
    }
  });

  it("publishes and indexes all fifteen, on the real launch date", () => {
    for (const slug of JOURNEY_DEPENDENCIES) {
      const article = articles.find((a) => a.slug === slug)!;
      expect(article.status, slug).toBe("published");
      expect(article.publishedAt, slug).toBe(LAUNCH_DATE);
      expect(article.updatedAt, slug).toBeUndefined();
      expect(article.indexable, slug).toBe(true);
      expect(isArticleIndexable(article), slug).toBe(true);
    }
  });

  it("renders index,follow for a published dependency article", () => {
    // The route derives its robots directive from the same predicate the
    // sitemap uses, so a published+indexable article cannot be told to noindex.
    const route = readFileSync(
      fileURLToPath(new URL("../../app/guides/[slug]/page.tsx", import.meta.url)),
      "utf8",
    );
    expect(route).toContain("robots: articleRobotsPolicy(article)");
    for (const slug of JOURNEY_DEPENDENCIES) {
      expect(isArticleIndexable(articles.find((a) => a.slug === slug)!), slug).toBe(true);
    }
  });
});

/**
 * M1: a published page held out of the index keeps its links followable.
 *
 * `isArticleIndexable` returning false covers two different situations —
 * still in review, and published but deliberately withheld — and before this
 * they emitted the same `noindex, nofollow`. That stranded every internal
 * link on a page held back from a launch wave, turning an indexing decision
 * into a crawl-graph defect. The states are separated here, against the
 * derived policy and against `createMetadata`'s actual output.
 */
describe("article robots policy", () => {
  const real = articles[0]!;
  const emitted = (article: Article) =>
    createMetadata({ path: articlePath(article.slug), robots: articleRobotsPolicy(article) }).robots;

  it("1. indexes and follows a published, indexable article", () => {
    const article = withState(real, { status: "published", publishedAt: "2026-10-01", indexable: true });
    expect(articleRobotsPolicy(article)).toBe("index");
    expect(emitted(article)).toMatchObject({ index: true, follow: true });
  });

  it("2. holds a published, non-indexable article out of the index but keeps it followable", () => {
    const article = withState(real, { status: "published", publishedAt: "2026-10-01", indexable: false });
    expect(articleRobotsPolicy(article)).toBe("public-noindex");
    expect(emitted(article)).toMatchObject({ index: false, follow: true });
  });

  it("3. follows nothing out of an article still in review", () => {
    for (const indexable of [true, false]) {
      const article = withState(real, { status: "in-review", indexable });
      expect(articleRobotsPolicy(article)).toBe("private-noindex");
      expect(emitted(article)).toMatchObject({ index: false, follow: false });
    }
  });

  it("9. keeps a public-noindex article out of the sitemap, and self-canonical", () => {
    const article = withState(real, { status: "published", publishedAt: "2026-10-01", indexable: false });
    // Sitemap membership is unchanged by M1: it still needs published AND indexable.
    expect(isArticleIndexable(article)).toBe(false);
    // 11. Held from search is not merged away: the canonical stays on itself.
    const metadata = createMetadata({
      path: articlePath(article.slug),
      robots: articleRobotsPolicy(article),
    });
    expect(metadata.alternates?.canonical).toBe(canonicalUrl(articlePath(article.slug)));
    // And the publication date still exists for a page that is genuinely published.
    expect(articlePublicationDates(article)).toEqual({
      datePublished: "2026-10-01",
      dateModified: "2026-10-01",
    });
  });

  it("12/13. leaves today's live articles exactly as they are", () => {
    for (const article of articles) {
      const expected = article.status === "published" ? "index" : "private-noindex";
      expect(articleRobotsPolicy(article), article.slug).toBe(expected);
    }
    expect(articles.filter((a) => articleRobotsPolicy(a) === "index")).toHaveLength(15);
    expect(articles.filter((a) => articleRobotsPolicy(a) === "private-noindex")).toHaveLength(20);
    // Nothing is in the middle state yet — that arrives with Journey Phase 2.
    expect(articles.filter((a) => articleRobotsPolicy(a) === "public-noindex")).toEqual([]);
  });

  it("15. leaves the article half of the sitemap at exactly 15", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    expect(urls.filter((u) => new URL(u).pathname.startsWith("/guides/"))).toHaveLength(15);
    expect(urls).toHaveLength(63);
  });
});
