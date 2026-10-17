import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout-primitives";
import { communityIdentity } from "@/features/community/live/server";
import { CommunityForm } from "@/features/community/live/form";
export const metadata = {
  title: "Community moderation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Moderation() {
  const { client, moderator } = await communityIdentity();
  if (!client || !moderator) notFound();
  const { data: reports, error } = await client.rpc("community_report_queue");
  return (
    <Section>
      <Container>
        <h1 className="font-serif text-title-1">Reports awaiting review</h1>
        <p>
          Review the content and act proportionately. Reporter details are
          private.
        </p>
        {error ? (
          <p>Reports could not be loaded.</p>
        ) : !reports?.length ? (
          <p>No reports awaiting review.</p>
        ) : (
          reports.map((r) => (
            <article key={r.id} className="my-5 rounded border p-4">
              <p>
                {r.kind}: {r.target}
              </p>
              <p className="whitespace-pre-wrap break-words">{r.reason}</p>
              <Link href={`/community/discussions/${r.thread_id}`}>
                Review discussion and replies
              </Link>
              <CommunityForm
                operation="resolve_report"
                target={r.id}
                label="Resolve report"
              />
            </article>
          ))
        )}
      </Container>
    </Section>
  );
}
