import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Container, Section } from "@/components/ui/layout-primitives";
import { EmptyState } from "@/components/ui/states";
import { communityTaxonomy } from "@/features/community/taxonomy";
import { ArticleCard } from "@/features/editorial/components/article-card";
import { searchPublishedGuides } from "@/features/editorial/search";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Search",
  description: "Find published Canadian pet care guides and helpful product resources.",
  path: "/search",
  robots: "private-noindex",
});

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const rawQuery = searchParams["q"];
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim().slice(0, 120) ?? "";
  const results = searchPublishedGuides(query);

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Find what your pet needs."
        description="Search our published Canadian pet care guides, training advice and product research. Community discussions will be searchable once posting opens."
        breadcrumbs={[{ name: "Search", path: "/search" }]}
      />

      <Section aria-labelledby="search-form-heading">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 id="search-form-heading" className="sr-only">Search guides</h2>
            <form action="/search" method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field htmlFor="search-query" label="What are you looking for?" className="flex-1">
                <Input
                  id="search-query"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Try “puppy vaccinations” or “pet insurance”"
                  autoComplete="off"
                  maxLength={120}
                />
              </Field>
              <Button type="submit" className="shrink-0">Find guides</Button>
            </form>
            {!query ? (
              <nav aria-label="Popular searches" className="mt-5 flex flex-wrap gap-2">
                {[
                  ["Puppy care", "puppy"],
                  ["Pet insurance", "pet insurance"],
                  ["Cat enrichment", "cat enrichment"],
                  ["Dog training", "dog training"],
                ].map(([label, q]) => (
                  <ButtonLink key={q} href={`/search?q=${encodeURIComponent(q ?? "")}`} variant="secondary" size="sm">
                    {label}
                  </ButtonLink>
                ))}
              </nav>
            ) : null}
          </div>

          {query ? (
            <div className="mt-12" aria-live="polite">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-label uppercase text-pine-700">Published guides</p>
                  <h2 className="mt-2 text-title-2 text-foreground">
                    {results.length === 0
                      ? "No matching guides"
                      : `${results.length} ${results.length === 1 ? "guide" : "guides"} found`}
                  </h2>
                </div>
                <p className="text-body-sm text-foreground-muted">Results for “{query}”</p>
              </div>
              {results.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((article) => (
                    <ArticleCard
                      key={article.slug}
                      article={article}
                      sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Try a different search"
                  description="Try a shorter phrase, another pet topic, or browse our Canadian guides."
                  action={<ButtonLink href="/guides" variant="secondary">Browse all guides</ButtonLink>}
                />
              )}
            </div>
          ) : (
            <div className="mt-12 rounded-card bg-surface-muted px-6 py-8 sm:px-9">
              <p className="text-label uppercase text-pine-700">Start exploring</p>
              <h2 className="mt-2 text-title-2 text-foreground">Good advice is worth finding.</h2>
              <p className="mt-3 max-w-2xl text-body text-foreground-muted">
                Browse practical guides researched for pet owners in Canada, from the first
                week with a puppy to choosing products for an indoor cat.
              </p>
              <ButtonLink href="/guides" variant="editorialQuiet" className="mt-5">
                Explore Canadian guides ↗
              </ButtonLink>
            </div>
          )}
        </Container>
      </Section>

      <Section tone="muted" spacing="compact">
        <Container>
          <h2 className="text-title-2 text-foreground">Explore community topics</h2>
          <p className="mt-2 text-body-sm text-foreground-muted">
            Community categories are open for browsing. Member posting will launch separately.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {communityTaxonomy.map((group) => (
              <div key={group.slug}>
                <h3 className="font-sans text-label-lg uppercase text-foreground-muted">{group.name}</h3>
                <ul className="mt-3 space-y-2">
                  {group.children.map((category) => (
                    <li key={category.slug}>
                      <ButtonLink
                        href={`/community/${category.slug}`}
                        variant="link"
                        size="sm"
                        className="h-auto whitespace-normal px-0 text-left text-sm font-normal"
                      >
                        {category.name}
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
