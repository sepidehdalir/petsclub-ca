import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Container, Section } from "@/components/ui/layout-primitives";
import { EmptyState } from "@/components/ui/states";
import { communityTaxonomy } from "@/features/community/taxonomy";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Search",
  description: "Search PetsClub discussions, guides and Canadian pet resources.",
  path: "/search",
  // A results page has no stable content of its own and must not compete with
  // the pages it points at.
  noIndex: true,
});

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const rawQuery = searchParams["q"];
  // `q` arrives as string | string[] | undefined; take the first value only.
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Search PetsClub"
        description="Full-text search across discussions and guides is part of a later milestone. Until then, the category index below is the fastest way to find a topic."
        breadcrumbs={[{ name: "Search", path: "/search" }]}
      />

      <Section aria-labelledby="search-form-heading">
        <Container width="prose">
          <h2 id="search-form-heading" className="sr-only">
            Search form
          </h2>

          {/*
            A plain GET form: it works without JavaScript, keeps the query in
            the URL, and is exactly the shape the real search endpoint will
            take, so wiring it up later changes the handler, not the markup.
          */}
          <form action="/search" method="get" role="search" className="flex items-end gap-3">
            <Field htmlFor="search-query" label="Search" className="flex-1">
              <Input
                id="search-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Try “pet insurance” or “puppy vaccinations”"
                autoComplete="off"
              />
            </Field>
            <Button type="submit" className="mb-0">
              Search
            </Button>
          </form>

          <div className="mt-8">
            {query ? (
              <EmptyState
                title="Search is not available yet"
                // The query is rendered as a text node by React, which escapes
                // it — no user-controlled markup can reach the page.
                description={`We could not search for “${query}” because full-text search has not launched. Browse the categories below in the meantime.`}
                action={
                  <ButtonLink href="/community" variant="secondary">
                    Browse all categories
                  </ButtonLink>
                }
              />
            ) : (
              <EmptyState
                title="Nothing to search yet"
                description="PetsClub search launches alongside the community engine. Browse by category for now."
                action={
                  <ButtonLink href="/community" variant="secondary">
                    Browse all categories
                  </ButtonLink>
                }
              />
            )}
          </div>
        </Container>
      </Section>

      <Section tone="muted" spacing="compact">
        <Container>
          <h2 className="text-xl font-semibold text-foreground">Browse by category</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {communityTaxonomy.map((group) => (
              <div key={group.slug}>
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-foreground-muted">
                  {group.name}
                </h3>
                <ul className="mt-3 space-y-2">
                  {group.children.map((category) => (
                    <li key={category.slug}>
                      <ButtonLink
                        href={`/community/${category.slug}`}
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-sm font-normal"
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
