# ADR 0005 — Community and editorial as one platform

**Status:** Accepted (Milestone 1)

## Context

Canadian pet owners are served badly by the current web. Most authoritative
content is written for a United States audience: wrong currency, products not
sold here, and rules on licensing, insurance and travel that do not apply.

Two obvious products address this — a forum, or an editorial site. Each has a
well-known failure mode. A forum with no content has no reason for anyone to
arrive. An editorial site with no community has no reason for anyone to return,
and no signal about what to write next.

## Decision

Build both on one platform, one domain and one taxonomy. Editorial guides and
community categories are two presentations of the same subject tree.

## Rationale

- **They solve each other's cold-start problem.** Guides bring search traffic;
  the community converts readers into members. Community questions reveal which
  guides to write, and unanswered questions are a content backlog.
- **One domain compounds authority.** Splitting across `thepetclub.ca` and a
  separate content domain would divide link equity and force the same visitor to
  learn two brands. The owner also holds `catbar.ca` and `petbar.ca`; they are
  explicitly *not* used for this, precisely so The Pet Club traffic stays
  consolidated.
- **The taxonomy is the shared spine.** `features/community/taxonomy.ts` defines
  the subject tree; `config/topics.ts` groups it for editorial section fronts.
  A single tree keeps internal linking coherent — a `/dogs` reader is one click
  from `Dog Food & Nutrition` discussion.
- **Structured data differs, structure does not.** Guides will emit `Article`,
  threads `DiscussionForumPosting`. Both hang off the same `Organization` and
  `WebSite` nodes.

## Consequences

- Editorial and community share a design system and shell, so the platform must
  read as one brand rather than a blog bolted onto a forum.
- Moderation covers both member posts and comments on guides; the `posts` table
  is shaped to serve both.
- Milestone ordering matters: the community engine ships before the editorial
  platform, because unanswered questions are the most reliable input for
  deciding which guides to commission.
