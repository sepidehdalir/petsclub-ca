import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import {
  breadcrumbListSchema,
  discussionForumPostingSchema,
  organizationSchema,
  webSiteSchema,
} from "@/lib/seo/structured-data";
import { absoluteUrl, canonicalUrl, normalizePath } from "@/lib/seo/urls";

describe("normalizePath", () => {
  it("normalises the root", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("/");
  });

  it("adds a leading slash and strips trailing slashes", () => {
    expect(normalizePath("community")).toBe("/community");
    expect(normalizePath("/community/")).toBe("/community");
    expect(normalizePath("/community///")).toBe("/community");
  });
});

describe("absoluteUrl", () => {
  it("builds URLs against the configured origin", () => {
    expect(absoluteUrl("/community")).toBe(`${siteConfig.url}/community`);
  });

  it("does not leave a trailing slash on the root", () => {
    expect(absoluteUrl("/")).toBe(siteConfig.url);
    expect(absoluteUrl()).toBe(siteConfig.url);
  });
});

describe("canonicalUrl", () => {
  it("drops query strings so filtered variants point at the clean URL", () => {
    expect(canonicalUrl("/community?page=2")).toBe(`${siteConfig.url}/community`);
    expect(canonicalUrl("/search?q=insurance")).toBe(`${siteConfig.url}/search`);
  });
});

describe("createMetadata", () => {
  it("always sets a canonical URL", () => {
    const metadata = createMetadata({ title: "Dogs", path: "/dogs" });
    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/dogs`);
  });

  it("uses the absolute site title on the homepage and a plain title elsewhere", () => {
    // A bare string lets the root layout's `%s | PetsClub` template apply;
    // the homepage overrides it so the brand name is not repeated.
    expect(createMetadata({ title: "Dogs" }).title).toBe("Dogs");
    expect(createMetadata({}).title).toEqual({
      absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
    });
  });

  it("marks utility pages noindex", () => {
    const metadata = createMetadata({ title: "Search", path: "/search", noIndex: true });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("marks content pages indexable", () => {
    const metadata = createMetadata({ title: "Dogs", path: "/dogs" });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("produces Open Graph and Twitter cards pointing at the same URL", () => {
    const metadata = createMetadata({ title: "Cats", path: "/cats" });
    expect(metadata.openGraph?.url).toBe(`${siteConfig.url}/cats`);
    expect(metadata.twitter?.title).toBe(`Cats | ${siteConfig.name}`);
  });
});

describe("buildSitemapEntries", () => {
  const entries = buildSitemapEntries();
  const urls = entries.map((entry) => entry.url);

  it("includes the homepage and the community hub", () => {
    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/community"));
  });

  it("includes every topic and category page", () => {
    expect(urls).toContain(absoluteUrl("/dogs"));
    expect(urls).toContain(absoluteUrl("/lost-found"));
    expect(urls).toContain(absoluteUrl("/community/dog-health"));
    expect(urls).toContain(absoluteUrl("/community/found-pets"));
  });

  it("excludes noindex routes", () => {
    // These are disallowed in robots.txt and marked noindex; listing them in
    // the sitemap would contradict both.
    for (const path of ["/search", "/sign-in", "/sign-up", "/account", "/reset-password"]) {
      expect(urls).not.toContain(absoluteUrl(path));
    }
  });

  it("contains no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("emits absolute URLs with valid priorities", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith(siteConfig.url)).toBe(true);
      expect(entry.priority).toBeGreaterThan(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });
});

describe("structured data", () => {
  it("links WebSite to Organization by @id", () => {
    const organization = organizationSchema();
    const website = webSiteSchema();

    expect(website["publisher"]).toEqual({ "@id": organization["@id"] });
  });

  it("does not advertise a SearchAction while search is unimplemented", () => {
    expect(webSiteSchema()["potentialAction"]).toBeUndefined();
  });

  it("numbers breadcrumb positions from one and resolves absolute URLs", () => {
    const schema = breadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: "Community", path: "/community" },
      { name: "Dog Health", path: "/community/dog-health" },
    ]);

    expect(schema["itemListElement"]).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Community", item: absoluteUrl("/community") },
      {
        "@type": "ListItem",
        position: 3,
        name: "Dog Health",
        item: absoluteUrl("/community/dog-health"),
      },
    ]);
  });

  it("builds a DiscussionForumPosting with an interaction counter", () => {
    const schema = discussionForumPostingSchema({
      headline: "Best pet insurance in Canada?",
      text: "Looking for recommendations.",
      path: "/community/pet-insurance/best-pet-insurance",
      datePublished: "2026-01-15T00:00:00.000Z",
      authorName: "A member",
      replyCount: 24,
    });

    expect(schema["@type"]).toBe("DiscussionForumPosting");
    expect(schema["interactionStatistic"]).toMatchObject({ userInteractionCount: 24 });
  });
});
