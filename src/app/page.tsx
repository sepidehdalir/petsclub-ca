import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout-primitives";
import { Media } from "@/components/ui/media";
import { siteConfig } from "@/config/site";
import { ArticleListSection } from "@/features/editorial/components/article-list-section";
import { createMetadata } from "@/lib/seo/metadata";
import { getMediaAsset } from "@/media/manifest";

export const metadata: Metadata = createMetadata({ path: "/", description: siteConfig.description });

export default function HomePage() {
  return <>
    <section className="club-hero" aria-labelledby="hero-heading">
      <Container>
        <div className="club-hero-grid">
          <div className="club-hero-copy">
            <p className="club-eyebrow">For the life you share</p>
            <h1 id="hero-heading">Little paws.<br />A bigger world.</h1>
            <p className="club-hero-deck">Life with pets is full of firsts. Find thoughtful guides, everyday inspiration and product discoveries for your Canadian home.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <ButtonLink href="/guides" size="lg">Find your next read <span aria-hidden="true">↗</span></ButtonLink>
              <ButtonLink href="/compare/catit-digger-vs-wave-circuit" size="lg" variant="secondary">Discover products</ButtonLink>
            </div>
            <p className="club-hero-note">Made for curious cats, good dogs & their people.</p>
          </div>
          <div className="club-hero-images">
            <Media asset={getMediaAsset("dogs-autumn-bridge")} ratio="portrait" sizes="(min-width: 1152px) 440px, (min-width: 768px) 40vw, 75vw" priority className="club-hero-dog" />
            <div className="club-hero-cat"><Media asset={getMediaAsset("cats-window-tabby")} ratio="square" sizes="(min-width: 1152px) 240px, (min-width: 768px) 22vw, 40vw" /><span>Home is wherever they are.</span></div>
            <span className="club-photo-label">The everyday, extraordinary.</span>
          </div>
        </div>
      </Container>
    </section>
    <nav aria-label="Explore The Pet Club" className="club-topic-strip"><Container><div className="club-topic-links">
      {[["/dogs", "For dog people"], ["/cats", "For cat people"], ["/guides", "Life in Canada"], ["/compare/catit-digger-vs-wave-circuit", "Product discovery"]].map(([href, label]) => <Link key={href} href={href}>{label}<span aria-hidden="true">↗</span></Link>)}
    </div></Container></nav>
    <Section aria-labelledby="world-heading"><Container>
      <div className="club-section-intro"><div><p className="club-eyebrow">A world of good company</p><h2 id="world-heading">Their world. Your next chapter.</h2></div><p>From the first day home to the routines that make life better. Start with the companion beside you.</p></div>
      <div className="club-world-grid">
        <Link href="/dogs" className="club-world-card"><Media asset={getMediaAsset("dogs-golden-in-leaves")} ratio="landscape" sizes="(min-width: 1152px) 540px, (min-width: 640px) 45vw, 92vw" alt="" /><div><span className="club-eyebrow">Walks, wags & new beginnings</span><h3>Life with dogs <span aria-hidden="true">↗</span></h3><p>Build a daily rhythm, welcome a puppy and explore together.</p></div></Link>
        <Link href="/cats" className="club-world-card"><Media asset={getMediaAsset("cats-two-resting-together")} ratio="landscape" sizes="(min-width: 1152px) 540px, (min-width: 640px) 45vw, 92vw" alt="" /><div><span className="club-eyebrow">Small rituals, big personalities</span><h3>Life with cats <span aria-hidden="true">↗</span></h3><p>Make room for play, quiet corners and a little feline curiosity.</p></div></Link>
      </div>
    </Container></Section>
    <ArticleListSection surfacePath="/guides" id="latest-guides" eyebrow="The reading room" title="Good reads for real life." description="Practical, carefully sourced guides with Canadian pet owners in mind." limit={3} action={<ButtonLink href="/guides" variant="secondary">All guides ↗</ButtonLink>} />
    <Section tone="muted" aria-labelledby="discovery-heading"><Container><div className="club-discovery">
      <Media asset={getMediaAsset("cats-feather-toy-play")} ratio="landscape" sizes="(min-width: 1152px) 540px, (min-width: 768px) 45vw, 92vw" />
      <div><p className="club-eyebrow">Thoughtful product discovery</p><h2 id="discovery-heading">A little more play.<br />A little less guesswork.</h2><p>Food puzzles or a ball circuit? Explore two different ways to enrich your cat’s day, with clear features and things to check before buying.</p><ButtonLink href="/compare/catit-digger-vs-wave-circuit">Explore the comparison ↗</ButtonLink><p className="text-caption text-foreground-muted mt-4">Retailer-listed features, not hands-on testing. Affiliate links are disclosed on the comparison page.</p></div>
    </div></Container></Section>
    <Section aria-labelledby="canada-heading"><Container><div className="club-canada"><div><p className="club-eyebrow">At home, across Canada</p><h2 id="canada-heading">For all the places<br />life takes you.</h2><p>Planning a move, budgeting for a new companion or heading out together? Our Canadian guides help you ask the right questions.</p><ButtonLink href="/guides" variant="secondary">Explore Canadian guides ↗</ButtonLink></div><Media asset={getMediaAsset("guides-dogs-winter-forest")} ratio="landscape" sizes="(min-width: 1152px) 590px, (min-width: 768px) 50vw, 92vw" /></div></Container></Section>
    <section className="club-community"><Container><p className="club-eyebrow">A club in the making</p><h2>Better together.</h2><p>We’re building a place for Canadian pet people to connect. Explore the planned community categories while we prepare for public conversations.</p><ButtonLink href="/community" variant="secondary">Meet the community idea ↗</ButtonLink><p className="text-caption mt-4">Posting and replies are not available yet.</p></Container></section>
  </>;
}
