"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { createDiscussion, createReply, removeContribution } from "../actions";
import { allCommunityCategories } from "../taxonomy";

type Entry = { id: string; title?: string; body: string; author: string; author_id: string | null; created_at: string };
type Feed = { available: boolean; viewerId?: string | null; threads: Entry[]; posts: Entry[]; more?: boolean; error?: string };
const date = (value: string) => new Date(value).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: "America/Vancouver" });

export function CommunityBoard({ category, threadId }: { category?: string; threadId?: string }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  const router = useRouter();
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(threadId ? { thread: threadId } : { category: category ?? "" });
    params.set("page", String(page));
    fetch(`/api/community?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(response => response.json()).then(setFeed)
      .catch(error => { if (error.name !== "AbortError") setFeed({ available: false, threads: [], posts: [] }); });
    return () => controller.abort();
  }, [category, threadId, page, revision]);
  const remove = (kind: "thread" | "reply", id: string) => startTransition(async () => {
    const result = await removeContribution(kind, id);
    if (result.error) setNotice(result.error);
    else if (kind === "thread") router.push("/community");
    else { setNotice("Your reply was removed."); refresh(); }
  });
  if (!feed) return <p role="status" className="community-board">Opening the conversation…</p>;
  if (feed.error) return <div className="community-board"><p role="status">{feed.error}</p><ButtonLink href="/community">Browse community topics</ButtonLink></div>;
  if (!feed.available) return <div className="community-board"><p role="status">We couldn’t load the community right now. Please try again shortly.</p><Button onClick={refresh} variant="secondary">Try again</Button></div>;
  const thread = threadId ? feed.threads[0] : null;
  return <div className="community-board">
    {thread ? <>
      <p className="text-sm">By {thread.author} · {date(thread.created_at)}</p>
      <h2 className="mt-4 text-title-1">{thread.title}</h2>
      <div className="community-copy my-6">{thread.body}</div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary" onClick={async () => {
          try { await navigator.clipboard.writeText(location.href); setNotice("Discussion link copied."); }
          catch { setNotice("Copy the page address from your browser to share this discussion."); }
        }}>Copy share link</Button>
        <a className="underline" href={`mailto:hello@thepetclub.ca?subject=${encodeURIComponent("Community report: " + thread.id)}&body=${encodeURIComponent("Please review https://thepetclub.ca/community/discussion/" + thread.id + "\nReason: ")}`}>Report a concern</a>
        {feed.viewerId === thread.author_id ? <Button disabled={pending} variant="danger" onClick={() => remove("thread", thread.id)}>Remove my discussion</Button> : null}
      </div>
      <h2 className="mt-10 text-title-1">The conversation</h2>
      {feed.posts.length ? feed.posts.map(post => <article className="community-post" key={post.id}>
        <p className="text-sm">{post.author} · {date(post.created_at)}</p>
        <p className="community-copy mt-3">{post.body}</p>
        {feed.viewerId === post.author_id ? <Button disabled={pending} variant="link" onClick={() => remove("reply", post.id)}>Remove my reply</Button> : null}
      </article>) : <p className="my-5">No replies yet. A little kindness is a good place to start.</p>}
      {feed.viewerId ? <ReplyForm threadId={thread.id} onPublished={refresh} /> : <ButtonLink className="mt-6" href={`/sign-in?next=${encodeURIComponent(`/community/discussion/${thread.id}`)}`}>Sign in to reply</ButtonLink>}
    </> : <>
      <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="text-title-1">Real life. Shared here.</h2><ButtonLink href={`/community/${category}/new`}>Start a conversation ↗</ButtonLink></div>
      {feed.threads.length ? <div className="community-list">{feed.threads.map(item => <Link href={`/community/discussion/${item.id}`} key={item.id}><small>{item.author} · {date(item.created_at)}</small><h3>{item.title}</h3><p className="line-clamp-2 break-words">{item.body}</p><span className="mt-4 inline-block text-sm">Read & reply ↗</span></Link>)}</div> : <p className="my-6">No discussions here yet. Share a question, a small win, or a story worth telling.</p>}
    </>}
    {(page > 0 || feed.more) && <nav aria-label="Conversation pages" className="my-6 flex gap-4"><Button disabled={page === 0} variant="secondary" onClick={() => setPage(value => value - 1)}>Previous</Button><span className="self-center">Page {page + 1}</span><Button disabled={!feed.more} variant="secondary" onClick={() => setPage(value => value + 1)}>Next</Button></nav>}
    <p role="status" className="mt-4">{notice}</p>
  </div>;
}

function ReplyForm({ threadId, onPublished }: { threadId: string; onPublished: () => void }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    startTransition(async () => {
      const result = await createReply({}, data);
      setMessage(result.error ?? "Your reply is published.");
      if (result.success) { form.reset(); onPublished(); }
    });
  }
  return <form className="community-compose mt-8" onSubmit={submit}><input type="hidden" name="threadId" value={threadId} /><label htmlFor="reply-body">Your reply<textarea id="reply-body" name="body" required maxLength={10000} rows={5} /></label><p className="text-sm">Be kind. Don’t post private contact details or veterinary diagnoses.</p><Button type="submit" disabled={pending}>{pending ? "Publishing…" : "Publish reply"}</Button><p role="status">{message}</p></form>;
}

export function DiscussionForm({ category, lostFound = false }: { category: string; lostFound?: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    if (lostFound) {
      data.set("body", `Pet: ${data.get("pet")}\nArea: ${data.get("area")}\nLast seen / found: ${data.get("when")}\n\n${data.get("body")}\n\nPlease reply in this discussion with information.`);
    }
    startTransition(async () => {
      const result = await createDiscussion({}, data);
      setMessage(result.error ?? "Published. Opening your discussion…");
      if (result.url) router.push(result.url);
    });
  }
  return <form className="community-compose" onSubmit={submit}>
    {lostFound ? <label htmlFor="discussion-category">Report type<select id="discussion-category" name="category" defaultValue={category}>{allCommunityCategories.filter(item => ["lost-dogs", "lost-cats", "found-pets"].includes(item.slug)).map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label> : <input type="hidden" name="category" value={category} />}
    <label htmlFor="discussion-title">{lostFound ? "Report title" : "Give your conversation a title"}<input id="discussion-title" name="title" required minLength={5} maxLength={160} placeholder={lostFound ? "Lost golden retriever near Lynn Valley" : "What’s on your mind?"} /></label>
    {lostFound && <><label htmlFor="report-pet">Pet name and description<input id="report-pet" name="pet" required maxLength={160} /></label><label htmlFor="report-area">City, province and nearest public landmark<input id="report-area" name="area" required maxLength={180} /></label><label htmlFor="report-when">Date last seen or found<input id="report-when" name="when" type="date" required /></label></>}
    <label htmlFor="discussion-body">{lostFound ? "What should people know?" : "Your story or question"}<textarea id="discussion-body" name="body" rows={8} required minLength={10} maxLength={10000} /></label>
    <p className="text-sm">Your post is public. Share an approximate area, not your home address, phone number, microchip number or passwords. Replies stay in this discussion.</p>
    {lostFound && <p className="text-sm">This publishes a community report, not an emergency alert. Contact local shelters and animal services directly. Add a reply when your pet is reunited.</p>}
    <label className="!flex items-start gap-3 text-sm"><input className="!w-auto mt-1" type="checkbox" required /><span>I agree to the <Link className="underline" href="/community-guidelines">community guidelines</Link>.</span></label>
    <Button disabled={pending} type="submit">{pending ? "Publishing…" : lostFound ? "Publish report" : "Publish discussion"}</Button><p role="status">{message}</p>
  </form>;
}
