import { describe, expect, it } from "vitest";

import { footerNavigation, primaryNavigation, topicRoutes } from "@/config/navigation";
import { topics } from "@/config/topics";
import {
  allCommunityCategories,
  communityCategoryPath,
  communityTaxonomy,
  findCommunityCategory,
  findCommunityGroup,
} from "@/features/community/taxonomy";
import { plannedGuides } from "@/features/editorial/fixtures";
import { demoThreads } from "@/features/community/fixtures";
import { isValidSlug } from "@/lib/utils/slug";

/**
 * The taxonomy is referenced by slug from navigation, topic config, fixtures
 * and the sitemap. Nothing in TypeScript catches a renamed slug, so these
 * tests are what turn a broken cross-reference into a failing build instead of
 * a silent dead link in production.
 */
describe("community taxonomy", () => {
  it("uses valid, unique slugs everywhere", () => {
    const slugs = [
      ...communityTaxonomy.map((group) => group.slug),
      ...allCommunityCategories.map((category) => category.slug),
    ];

    for (const slug of slugs) {
      expect(isValidSlug(slug), `invalid slug: ${slug}`).toBe(true);
    }

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every group and category a name and description", () => {
    for (const group of communityTaxonomy) {
      expect(group.name.length).toBeGreaterThan(0);
      expect(group.description.length).toBeGreaterThan(0);
      expect(group.children.length).toBeGreaterThan(0);

      for (const category of group.children) {
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("flattens every leaf category exactly once", () => {
    const expected = communityTaxonomy.reduce(
      (total, group) => total + group.children.length,
      0,
    );
    expect(allCommunityCategories).toHaveLength(expected);
  });

  it("resolves a category to its parent group", () => {
    const match = findCommunityCategory("dog-health");
    expect(match?.group.slug).toBe("dogs");
    expect(match?.category.name).toBe("Dog Health");
  });

  it("returns null for an unknown slug rather than throwing", () => {
    expect(findCommunityCategory("does-not-exist")).toBeNull();
    expect(findCommunityGroup("does-not-exist")).toBeNull();
  });

  it("builds category paths under /community", () => {
    expect(communityCategoryPath("puppies")).toBe("/community/puppies");
  });
});

describe("cross-references", () => {
  const categorySlugs = new Set(allCommunityCategories.map((category) => category.slug));
  const guideIds = new Set(plannedGuides.map((guide) => guide.id));
  const topicPaths = new Set(topics.map((topic) => topic.path));

  it("every topic references categories and guides that exist", () => {
    for (const topic of topics) {
      expect(topic.categorySlugs.length).toBeGreaterThan(0);

      for (const slug of topic.categorySlugs) {
        expect(categorySlugs.has(slug), `${topic.path} -> missing category ${slug}`).toBe(true);
      }

      for (const id of topic.guideIds) {
        expect(guideIds.has(id), `${topic.path} -> missing guide ${id}`).toBe(true);
      }
    }
  });

  it("every fixture thread points at a real category", () => {
    for (const thread of demoThreads) {
      expect(
        categorySlugs.has(thread.categorySlug),
        `demo thread ${thread.id} -> missing category ${thread.categorySlug}`,
      ).toBe(true);
    }
  });

  it("every /community/... link in the footer resolves to a real category", () => {
    const footerCategoryLinks = footerNavigation
      .flatMap((group) => group.items)
      .map((item) => item.href)
      .filter((href) => href.startsWith("/community/"));

    expect(footerCategoryLinks.length).toBeGreaterThan(0);

    for (const href of footerCategoryLinks) {
      const slug = href.replace("/community/", "");
      expect(categorySlugs.has(slug), `footer link -> missing category ${slug}`).toBe(true);
    }
  });

  it("keeps topicRoutes in step with the topic definitions", () => {
    // /guides and /lost-found are standalone sections, not topic-template
    // pages, so they appear in topicRoutes without a TopicDefinition.
    const standaloneRoutes = ["/guides", "/lost-found"];

    for (const route of topicRoutes) {
      expect(
        topicPaths.has(route) || standaloneRoutes.includes(route),
        `topicRoutes contains ${route} with no page behind it`,
      ).toBe(true);
    }

    for (const topic of topics) {
      expect(topicRoutes).toContain(topic.path);
    }
  });

  it("exposes every primary navigation destination", () => {
    const hrefs = primaryNavigation.map((item) => item.href);
    expect(hrefs).toContain("/community");
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
