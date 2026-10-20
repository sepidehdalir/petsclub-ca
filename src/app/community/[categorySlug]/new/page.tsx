import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Container, Section } from "@/components/ui/layout-primitives";
import { ButtonLink } from "@/components/ui/button";
import { findCommunityCategory } from "@/features/community/taxonomy";
import { DiscussionForm } from "@/features/community/components/live-community";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  return createMetadata({ title: "Start a conversation", path: `/community/${categorySlug}/new`, robots: "private-noindex" });
}
export default async function NewDiscussionPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const match = findCommunityCategory(categorySlug);
  if (!match) notFound();
  const lostFound = ["lost-dogs", "lost-cats", "found-pets"].includes(categorySlug);
  const db = isSupabaseConfigured ? await createSupabaseServerClient() : null;
  const user = db ? (await db.auth.getUser()).data.user : null;
  return <><PageHeader eyebrow={match.category.name} title={lostFound ? "Bring them home." : "Let’s talk pets."} description={lostFound ? "Publish a local lost or found pet report. Kind people make a difference." : "A question, a little win, a wonderfully ordinary story. There’s room for it here."} breadcrumbs={[{ name: "Community", path: "/community" }, { name: match.category.name, path: `/community/${categorySlug}` }]} /><Section><Container width="prose">{user ? <DiscussionForm category={categorySlug} lostFound={lostFound} /> : <div className="community-compose"><h2 className="text-title-1">A little introduction first.</h2><p>Sign in so you can publish, reply and manage your own contributions.</p><ButtonLink href={`/sign-in?next=${encodeURIComponent(`/community/${categorySlug}/new`)}`}>Sign in to continue</ButtonLink><ButtonLink href="/sign-up" variant="secondary">Create an account</ButtonLink></div>}</Container></Section></>;
}
