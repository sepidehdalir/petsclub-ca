# ADR 0006 — Redeem emailed tokens behind a POST

**Status:** Accepted (Milestone 1 hardening)

## Context

Supabase's default email templates link to `{{ .ConfirmationURL }}`, which
points at `/auth/v1/verify` on the project's own domain. A `GET` to that URL
redeems the one-time token and redirects onward. Our `/auth/callback` route
behaved the same way for `?token_hash=`: it called `verifyOtp` during a `GET`.

Both designs assume the first `GET` comes from the person who received the
email. That assumption is false. Mail providers, corporate gateways and
endpoint-security products routinely *prefetch* links to scan them for malware,
and a prefetch is an ordinary `GET`.

This is not theoretical here. The first real production signup on
`thepetclub.ca` was recorded as:

| Field | Value |
| --- | --- |
| `confirmation_sent_at` | `23:24:09.166Z` |
| `email_confirmed_at` | `23:24:28.463Z` — 19.3 s later |
| `last_sign_in_at` | `null` |
| `auth.sessions` | empty |

The token was redeemed 19 seconds after dispatch, yet no session was ever
created. Something followed the link and completed nothing. When the account
holder clicked it moments later, they were told the link had expired.

The account happened to end up confirmed, so the damage was limited to a
confusing error. A recovery link consumed the same way is worse: the user
cannot reset their password and has no idea why.

## Decision

Redemption requires a `POST`.

`/auth/confirm` accepts the token as a query parameter and **renders a button**.
The `GET` is side-effect free — it may be prefetched any number of times. Only
submitting the form runs `confirmEmailAction`, which is where `verifyOtp` is
finally called.

The Supabase email templates are changed to link at this route directly, using
`{{ .TokenHash }}`, so Supabase's own verify endpoint is no longer in the path.

`/auth/callback` keeps the `?code=` PKCE exchange for OAuth, and now *forwards*
any `?token_hash=` request to `/auth/confirm` instead of redeeming it, so links
issued before this change fail safe rather than being spent.

## Rationale

- **The vulnerable property was the HTTP method, not the endpoint.** Simply
  switching from `ConfirmationURL` to `token_hash` fixes nothing while
  verification still happens on a `GET`. Moving it behind a `POST` is what
  actually helps, because scanners fetch links; they do not fill in forms.
- **PKCE is unaffected where it does work.** The `?code=` exchange is bound to
  the `code_verifier` cookie, so a scanner without that cookie cannot complete
  it. That path is retained untouched for OAuth. Emailed tokens never had that
  protection: possession of the token has always been sufficient, which is
  precisely why spending it early is harmful.
- **The form must never auto-submit.** A scanner that executes JavaScript would
  spend a token submitted on mount exactly as it spends a prefetched link. The
  button is a real form submission and requires a real click.
- **It degrades without JavaScript**, like every other form in this codebase.
- **`type` is validated against an allow-list** before reaching `verifyOtp`; it
  arrives from a query string and is attacker-controllable.

## Alternatives considered

- **Six-digit codes (`{{ .Token }}`) typed by hand.** Immune to prefetching and
  arguably the most robust option, but it is a larger UX change and needs a
  code-entry screen. Worth revisiting if scanners begin submitting forms.
- **Keep `GET` and detect scanners** by User-Agent or heuristics. Rejected:
  an allow-list of well-behaved fetchers is unmaintainable and fails open.
- **Shorten token lifetime.** Does not help at all — the prefetch happens within
  seconds of delivery.
- **Accept it and tell users to request a new link.** Rejected: the second link
  is prefetched too. The failure is systematic, not intermittent.

## Consequences

- Confirming an email is now two steps: open the link, press a button. This is
  a common and well-understood pattern.
- The email templates are no longer Supabase's defaults and must be kept in
  step with this route. The template body is recorded in the README.
- `/auth/confirm` must never be made static or cached; it is
  `force-dynamic` and `noIndex`.
