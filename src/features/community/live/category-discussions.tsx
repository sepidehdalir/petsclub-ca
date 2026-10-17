import Link from "next/link";
import { communityIdentity } from "./server";
import { CommunityForm } from "./form";
import { pageNumber } from "./contracts";

export async function CategoryDiscussions({
  slug,
  page,
}: {
  slug: string;
  page?: string | string[];
}) {
  const { client, user } = await communityIdentity();
  if (!client) return null;
  const n = pageNumber(page);
  const { data: category, error: categoryError } = await client
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!category || categoryError)
    return (
      <p>
        Member discussions are temporarily unavailable. Editorial guides remain
        available below.
      </p>
    );
  const { data: threads, error } = await client
    .from("threads")
    .select("id,title,status,reply_count,last_activity_at")
    .eq("category_id", category.id)
    .in("status", ["published", "locked"])
    .order("last_activity_at", { ascending: false })
    .order("id")
    .range((n - 1) * 20, n * 20);
  if (error)
    return <p>We could not load discussions. Please try again later.</p>;
  return (
    <section className="my-10" aria-label="Member discussions">
      <h2 className="font-serif text-title-2">Member discussions</h2>
      <p>
        Share experiences respectfully. For urgent health concerns, contact a
        veterinarian.{" "}
        <Link href="/community-guidelines" className="underline">
          Community guidelines
        </Link>
      </p>
      {threads?.length ? (
        <ul className="divide-y divide-border">
          {threads.slice(0, 20).map((t) => (
            <li className="py-4" key={t.id}>
              <Link
                className="underline"
                href={`/community/discussions/${t.id}`}
              >
                {t.title}
              </Link>
              <p>
                {t.reply_count} replies
                {t.status === "locked" ? " · Replies closed" : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="my-5">
          {n === 1
            ? "No discussions yet. You can start the first conversation."
            : "No discussions on this page."}
        </p>
      )}
      <nav aria-label="Discussion pages" className="flex gap-5">
        {n > 1 && <Link href={`?page=${n - 1}`}>Previous</Link>}
        {(threads?.length ?? 0) > 20 && (
          <Link href={`?page=${n + 1}`}>Next</Link>
        )}
      </nav>
      {user?.email_confirmed_at ? (
        <CommunityForm
          operation="thread"
          category={slug}
          label="Start a discussion"
        />
      ) : (
        <p className="my-5">
          <Link
            href={`/sign-in?next=${encodeURIComponent(`/community/${slug}`)}`}
            className="underline"
          >
            Sign in
          </Link>{" "}
          with a confirmed email to contribute.
        </p>
      )}
    </section>
  );
}
