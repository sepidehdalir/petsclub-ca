import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Container, Section } from "@/components/ui/layout-primitives";
import { CommunityBoard } from "@/features/community/components/live-community";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  return createMetadata({ title: "The conversation", path: `/community/discussion/${threadId}`, robots: "private-noindex" });
}
export default async function DiscussionPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  if (!z.uuid().safeParse(threadId).success) notFound();
  return <><PageHeader eyebrow="THE CLUBHOUSE" title="Good company." description="Real stories. Helpful replies. People who get it." breadcrumbs={[{ name: "Community", path: "/community" }]} /><Section><Container width="prose"><CommunityBoard threadId={threadId} /></Container></Section></>;
}
