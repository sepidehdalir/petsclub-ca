import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Container, Section } from "@/components/ui/layout-primitives";
import { communityIdentity } from "@/features/community/live/server";
import { CommunityForm } from "@/features/community/live/form";
import { pageNumber } from "@/features/community/live/contracts";

// User content is never interpolated into public metadata or evaluated as MDX.
export const metadata: Metadata = {
  title: "Member discussion | The Pet Club",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";
export default async function Discussion({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { threadId } = await params;
  if (!z.uuid().safeParse(threadId).success) notFound();
  const { client, user, moderator } = await communityIdentity();
  if (!client) notFound();
  const { data: t, error } = await client
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle();
  if (error)
    return (
      <Container>
        <p>Discussion unavailable. Please try again later.</p>
      </Container>
    );
  if (!t) notFound();
  const n = pageNumber((await searchParams).page);
  const { data: posts, error: postsError } = await client
    .from("posts")
    .select("*")
    .eq("thread_id", t.id)
    .order("created_at")
    .order("id")
    .range((n - 1) * 20, n * 20);
  const ids = [
    ...new Set(
      [t.author_id, ...(posts ?? []).map((p) => p.author_id)].filter(
        (id): id is string => !!id,
      ),
    ),
  ];
  const { data: profiles } = ids.length
    ? await client.from("profiles").select("id,display_name").in("id", ids)
    : { data: [] };
  const names = new Map(profiles?.map((p) => [p.id, p.display_name]));
  const author = (id: string | null) =>
    id ? (names.get(id) ?? "Member") : "Deleted account";
  const confirmed = !!user?.email_confirmed_at;
  return (
    <Section>
      <Container>
        <Link href="/community">All community topics</Link>
        <article className="mx-auto max-w-3xl space-y-5 break-words">
          <h1 className="font-serif text-display-3">{t.title}</h1>
          <p>
            By {author(t.author_id)} ·{" "}
            {new Date(t.created_at).toLocaleDateString("en-CA", {
              timeZone: "UTC",
            })}
          </p>
          {t.status !== "published" && (
            <p role="status">
              Discussion status: {t.status}. Replies are closed.
            </p>
          )}
          <p className="whitespace-pre-wrap">{t.body}</p>
          {confirmed && user.id === t.author_id && t.status === "published" && (
            <details>
              <summary>Edit or remove your discussion</summary>
              <CommunityForm
                operation="edit_thread"
                target={t.id}
                title={t.title}
                body={t.body}
                label="Save changes"
              />
              <CommunityForm
                operation="delete_thread"
                target={t.id}
                label="Remove discussion"
              />
            </details>
          )}
          {confirmed && (
            <details>
              <summary>Report this discussion</summary>
              <CommunityForm
                operation="report_thread"
                target={t.id}
                label="Send report"
              />
            </details>
          )}
          {moderator && (
            <details>
              <summary>Moderate discussion</summary>
              <CommunityForm
                operation="moderate_thread"
                target={t.id}
                label="Apply moderation"
              />
            </details>
          )}
          <h2 className="font-serif text-title-2">Replies</h2>
          {postsError ? (
            <p>Replies could not be loaded. Please retry later.</p>
          ) : !posts?.length ? (
            <p>No replies on this page.</p>
          ) : (
            posts.slice(0, 20).map((p) => (
              <section
                key={p.id}
                className="rounded-xl border border-border p-4"
                aria-label={`Reply by ${author(p.author_id)}`}
              >
                <p>
                  By {author(p.author_id)}
                  {p.status !== "published" && ` · ${p.status}`}
                </p>
                <p className="my-3 whitespace-pre-wrap">{p.body}</p>
                {confirmed &&
                  p.author_id === user.id &&
                  p.status === "published" &&
                  t.status === "published" && (
                    <details>
                      <summary>Edit or remove your reply</summary>
                      <CommunityForm
                        operation="edit_post"
                        target={p.id}
                        body={p.body}
                        label="Save reply"
                      />
                      <CommunityForm
                        operation="delete_post"
                        target={p.id}
                        label="Remove reply"
                      />
                    </details>
                  )}
                {confirmed && (
                  <details>
                    <summary>Report reply</summary>
                    <CommunityForm
                      operation="report_post"
                      target={p.id}
                      label="Send report"
                    />
                  </details>
                )}
                {moderator && (
                  <details>
                    <summary>Moderate reply</summary>
                    <CommunityForm
                      operation="moderate_post"
                      target={p.id}
                      label="Apply moderation"
                    />
                  </details>
                )}
              </section>
            ))
          )}
          <nav aria-label="Reply pages" className="flex gap-5">
            {n > 1 && <Link href={`?page=${n - 1}`}>Previous</Link>}
            {(posts?.length ?? 0) > 20 && (
              <Link href={`?page=${n + 1}`}>Next</Link>
            )}
          </nav>
          {confirmed && t.status === "published" ? (
            <CommunityForm
              key={t.reply_count}
              operation="reply"
              target={t.id}
              label="Post reply"
            />
          ) : (
            !user && (
              <Link
                className="underline"
                href={`/sign-in?next=${encodeURIComponent(`/community/discussions/${t.id}`)}`}
              >
                Sign in to reply
              </Link>
            )
          )}
        </article>
      </Container>
    </Section>
  );
}
