"use client";
import { useState, type FormEvent } from "react";
import { inquiryDraft, inquiryTopics } from "./inquiry";

export function InquiryComposer() {
  const [topic, setTopic] = useState<string>(inquiryTopics[0]);
  const [organisation, setOrganisation] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<ReturnType<typeof inquiryDraft>>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = inquiryDraft(topic, organisation, message);
    setDraft(next); setCopied(false);
    setError(next ? "" : "Choose an enquiry type and add a message of up to 3,000 characters.");
  }
  function clearDraft() { setDraft(null); setCopied(false); setError(""); }
  return <section aria-labelledby="inquiry-heading" className="my-8 rounded-card border border-border bg-surface-muted p-5">
    <h2 id="inquiry-heading">Prepare an enquiry</h2>
    <p>Brand partners can describe the product, Canadian availability, proposed format, budget and timing. Sponsored work must be clearly disclosed and cannot buy a recommendation or veterinary endorsement.</p>
    <p>This tool prepares an email draft on your device. It sends nothing through this website and does not subscribe you to a mailing list. Send the draft in your email app, or copy it into your preferred service.</p>
    <form onSubmit={prepare} className="grid gap-4">
      <label htmlFor="inquiry-topic">Enquiry type<select id="inquiry-topic" value={topic} onChange={(event) => { setTopic(event.target.value); clearDraft(); }} className="block min-h-11 w-full rounded-md border border-border bg-surface p-3">{inquiryTopics.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label htmlFor="inquiry-organisation">Organisation (optional)<input id="inquiry-organisation" maxLength={120} value={organisation} onChange={(event) => { setOrganisation(event.target.value); clearDraft(); }} className="block min-h-11 w-full rounded-md border border-border bg-surface p-3" /></label>
      <label htmlFor="inquiry-message">Message<textarea id="inquiry-message" required maxLength={3000} rows={6} value={message} onChange={(event) => { setMessage(event.target.value); clearDraft(); }} className="block w-full rounded-md border border-border bg-surface p-3" /></label>
      <p className="text-body-sm">Avoid payment details, passwords and private medical information.</p>
      <button type="submit" className="min-h-11 rounded-md bg-pine-700 px-5 py-3 font-semibold text-white">Prepare email draft</button>
    </form>
    <p role="status">{error}</p>
    {draft ? <div className="mt-4 space-y-3">
      <p><strong>To:</strong> hello@thepetclub.ca<br /><strong>Subject:</strong> {draft.subject}</p>
      <p className="whitespace-pre-wrap break-words">{draft.body}</p>
      <a href={draft.href} className="inline-flex min-h-11 items-center underline" onClick={() => window.dispatchEvent(new CustomEvent("thepetclub:cta-click", { detail: { cta_id: "partnership_email_draft" } }))}>Open email draft</a>
      <button type="button" className="ml-4 min-h-11 underline" onClick={async () => {
        try { await navigator.clipboard.writeText(`To: hello@thepetclub.ca\nSubject: ${draft.subject}\n\n${draft.body}`); setCopied(true); }
        catch { setError("Copy was unavailable. Select and copy the draft above."); }
      }}>Copy draft</button>
      <p role="status">{copied ? "Copied. Send it in your email service; it has not been sent by this website." : "Draft ready. No message has been sent."}</p>
    </div> : null}
  </section>;
}
