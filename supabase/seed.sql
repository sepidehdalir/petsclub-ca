-- ============================================================================
-- ThePetClub.ca — taxonomy seed
-- ============================================================================
-- Seeds the forum category tree. This is *structural* data, not content:
-- it contains no users, no threads and no replies, so nothing here can be
-- mistaken for real community activity.
--
-- The tree mirrors src/features/community/taxonomy.ts exactly. Keep the two in
-- step until Milestone 2 makes the database the single source of truth.
--
-- Safe to re-run: every statement upserts on the unique `slug`.
--
-- Apply with:
--   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Top-level groups
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug, description, sort_order, parent_id)
values
  ('Dogs', 'dogs',
   'Everything dog — from first-week puppy questions to senior care, nutrition and behaviour.',
   1, null),
  ('Cats', 'cats',
   'Cat care, health and behaviour — for indoor cats, catios and everything in between.',
   2, null),
  ('Canadian Pet Life', 'canadian-pet-life',
   'The Canada-specific side of pet ownership — costs, insurance, products, travel and provincial rules.',
   3, null),
  ('Community', 'community',
   'The social heart of The Pet Club — introductions, photos, stories and memorials.',
   4, null),
  ('Lost & Found', 'lost-and-found',
   'Community-powered help for missing pets across Canada.',
   5, null)
on conflict (slug) do update
set name        = excluded.name,
    description = excluded.description,
    sort_order  = excluded.sort_order,
    parent_id   = excluded.parent_id;

-- ---------------------------------------------------------------------------
-- Leaf categories
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug, description, sort_order, parent_id)
select v.name, v.slug, v.description, v.sort_order, parent.id
from (
  values
    ('General Dog Discussion', 'general-dog-discussion',
     'Open conversation about life with dogs in Canada.', 1, 'dogs'),
    ('Puppies', 'puppies',
     'Bringing a puppy home, socialisation, sleep and early routines.', 2, 'dogs'),
    ('Dog Health', 'dog-health',
     'Symptoms, vet visits, preventative care and recovery experiences.', 3, 'dogs'),
    ('Dog Food & Nutrition', 'dog-food-and-nutrition',
     'Kibble, raw, fresh and prescription diets available in Canada.', 4, 'dogs'),
    ('Training & Behaviour', 'dog-training-and-behaviour',
     'Recall, reactivity, crate training and working with Canadian trainers.', 5, 'dogs'),
    ('Breeds', 'dog-breeds',
     'Breed traits, breed-specific care and finding reputable breeders or rescues.', 6, 'dogs'),

    ('General Cat Discussion', 'general-cat-discussion',
     'Open conversation about life with cats in Canada.', 1, 'cats'),
    ('Kittens', 'kittens',
     'Early weeks, litter training, vaccinations and kitten-proofing.', 2, 'cats'),
    ('Cat Health', 'cat-health',
     'Urinary health, dental care, weight management and vet experiences.', 3, 'cats'),
    ('Cat Food & Nutrition', 'cat-food-and-nutrition',
     'Wet, dry and prescription diets, plus hydration and feeding routines.', 4, 'cats'),
    ('Behaviour', 'cat-behaviour',
     'Litter box issues, scratching, enrichment and multi-cat households.', 5, 'cats'),
    ('Breeds', 'cat-breeds',
     'Breed traits, grooming needs and adopting from Canadian rescues.', 6, 'cats'),

    ('Pet Insurance', 'pet-insurance',
     'Comparing Canadian pet insurance providers, coverage and real claim outcomes.', 1, 'canadian-pet-life'),
    ('Vet Costs', 'vet-costs',
     'What procedures actually cost across provinces and how to plan for them.', 2, 'canadian-pet-life'),
    ('Canadian Pet Products', 'canadian-pet-products',
     'Canadian-made and Canada-available food, gear and supplies.', 3, 'canadian-pet-life'),
    ('Travelling With Pets', 'travelling-with-pets',
     'Flying within Canada, road trips, border crossings and paperwork.', 4, 'canadian-pet-life'),
    ('Pet-Friendly Canada', 'pet-friendly-canada',
     'Pet-friendly rentals, patios, parks, trails and hotels across the country.', 5, 'canadian-pet-life'),
    ('Provincial Questions', 'provincial-questions',
     'Bylaws, licensing and province-specific rules for pet owners.', 6, 'canadian-pet-life'),

    ('Introduce Yourself', 'introduce-yourself',
     'New here? Tell the community about you and your pets.', 1, 'community'),
    ('Pet Photos', 'pet-photos',
     'Share photos of your dogs, cats and other companions.', 2, 'community'),
    ('Pet Stories', 'pet-stories',
     'Adoption stories, milestones and the moments worth writing down.', 3, 'community'),
    ('Memorials', 'memorials',
     'A gentle space to remember the pets we have lost.', 4, 'community'),

    ('Lost Dogs', 'lost-dogs',
     'Post a missing dog with the details that help neighbours recognise them.', 1, 'lost-and-found'),
    ('Lost Cats', 'lost-cats',
     'Post a missing cat and coordinate local search efforts.', 2, 'lost-and-found'),
    ('Found Pets', 'found-pets',
     'Found a pet? Post here to help reunite them with their family.', 3, 'lost-and-found')
) as v(name, slug, description, sort_order, parent_slug)
join public.categories parent on parent.slug = v.parent_slug
on conflict (slug) do update
set name        = excluded.name,
    description = excluded.description,
    sort_order  = excluded.sort_order,
    parent_id   = excluded.parent_id;
