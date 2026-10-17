"use client";
import { useActionState, useId, useState } from "react";
import { mutateCommunity } from "./actions";
import type { CommunityMutation } from "./contracts";

export function CommunityForm({
  operation,
  target,
  category,
  title = "",
  body = "",
  label,
}: {
  operation: CommunityMutation["operation"];
  target?: string;
  category?: string;
  title?: string;
  body?: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(mutateCommunity, {});
  const id = useId();
  // Stable across retries; rotate only after a successful submission/remount.
  const [titleText, setTitleText] = useState(title);
  const [bodyText, setBodyText] = useState(body);
  const [reasonText, setReasonText] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const content = ["thread", "reply", "edit_thread", "edit_post"].includes(
    operation,
  );
  const reason =
    operation.startsWith("report_") ||
    operation.startsWith("moderate_") ||
    operation === "resolve_report";
  return (
    <form
      action={action}
      className="my-5 space-y-3 rounded-xl border border-border p-4"
    >
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="operation" value={operation} />
      {target && <input type="hidden" name="target" value={target} />}
      {category && <input type="hidden" name="category" value={category} />}
      {["thread", "edit_thread"].includes(operation) && (
        <label className="block" htmlFor={`${id}-title`}>
          Title
          <input
            id={`${id}-title`}
            name="title"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            minLength={5}
            maxLength={160}
            required
            className="mt-1 block w-full rounded border border-border p-2"
          />
        </label>
      )}
      {content && (
        <label className="block" htmlFor={`${id}-body`}>
          {operation === "reply" ? "Your reply" : "Your message"}
          <textarea
            id={`${id}-body`}
            name="body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            minLength={1}
            maxLength={20000}
            rows={5}
            required
            className="mt-1 block w-full rounded border border-border p-2"
          />
          <span className="text-caption">
            Plain text only. Do not share private contact details, medical
            records or urgent veterinary questions.
          </span>
        </label>
      )}
      {reason && (
        <label className="block" htmlFor={`${id}-reason`}>
          Reason
          <textarea
            id={`${id}-reason`}
            name="reason"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            minLength={5}
            maxLength={1000}
            rows={2}
            required
            className="mt-1 block w-full rounded border border-border p-2"
          />
        </label>
      )}
      {operation.startsWith("moderate_") && (
        <label className="block" htmlFor={`${id}-status`}>
          Action
          <select
            id={`${id}-status`}
            name="status"
            className="ml-2 rounded border p-2"
          >
            <option value="hidden">Hide</option>
            {operation === "moderate_thread" && (
              <option value="locked">Lock replies</option>
            )}
            <option value="published">Restore</option>
            <option value="deleted">Remove from public view</option>
          </select>
        </label>
      )}
      {operation.startsWith("delete_") && (
        <label className="block">
          <input type="checkbox" required /> Remove my contribution from public
          view
        </label>
      )}
      <button
        disabled={pending || !!state.success}
        className="rounded bg-pine-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : label}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && (
        <p role="status">
          {state.success}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => window.location.reload()}
          >
            Reload discussion
          </button>
        </p>
      )}
    </form>
  );
}
