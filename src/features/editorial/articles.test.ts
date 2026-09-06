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
