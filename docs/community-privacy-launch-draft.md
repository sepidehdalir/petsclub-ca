# Community privacy and guidelines: editorial proposal, not published policy

This document is for owner review. It is not legal advice or an assertion that legal review has occurred. Do not remove the public policy's pending-review status or enable public posting solely because this draft exists.

## Proposed plain-language disclosure

Your display name, discussion title, message and replies are public when published. Avoid posting private contact details, identifying information about other people, personal medical records or information about children. Community posts are experiences and opinions, not veterinary care.

We use Supabase to store account information and community content, and Vercel to serve the website. Authentication credentials are handled by the authentication provider. We do not publish account email addresses. Verify the actual hosting region and processor terms before describing international processing or residency.

Reports are private. Authorized moderators review the reported content and reason. The normal moderation queue does not show the reporter's identity, although restricted database administrators can access the stored report record when needed to investigate abuse. Moderation actions are recorded with the moderator, target, action, reason and time.

Removing a contribution hides it from public view; it does not immediately erase the retained database record or backups. When an account is permanently deleted from authentication storage, the database removes its profile and attribution links while discussions/replies may remain unattributed so other members' conversations remain understandable. An operational request and response process is needed for access, correction, removal and privacy concerns before promising those functions.

To prevent duplicate submissions and enforce posting limits, the site records a request identifier, account reference, action, timestamp, result ID and a one-way hash of the request. This log does not contain a duplicate copy of the message text. It is still associated with the account and is not anonymous data.

## Decisions required before publication

- Confirm a monitored privacy/contact address and responsible owner. Do not invent a privacy officer or claim round-the-clock moderation.
- Choose and implement retention periods for resolved report text and moderation logs. Suggested review starting point: review resolved reports after 90 days, retain only what is needed for appeals or documented abuse, and review audit records after 12 months. These are proposals, not current automated deletion rules or legal minimums.
- Keep the minimal idempotency ledger for the account lifetime initially to prevent replay of old request IDs; do not claim a shorter deletion period without designing safe replay expiry. Permanent deletion of the authentication record cascades its operation records. Soft deletion or suspension does not erase these records.
- Define a concrete appeals channel and handling procedure. Do not promise an SLA until coverage is confirmed.
- Decide account eligibility/age policy and handling of accidental personal information before opening signups broadly. No age threshold is invented by this change.
- Review processor locations, backup retention and any legal exceptions with qualified advice where needed.

## Guidelines changes to prepare for launch

Replace the statement that moderation ships in a later milestone only after the tools are deployed and checked. Explain that moderators can hide, lock, restore or remove public visibility, that locked discussions remain readable, and that reports are private. Existing prohibitions on harassment, fabricated credentials, personal-data posting, cruelty and undisclosed advertising remain. No paid promotion, affiliate spam or automatic outbound links are introduced.

## Non-destructive rollback

Keep COMMUNITY_ENABLED unset/false and the database settings row disabled until release approval and verification. If opening later reveals a problem, close both gates first and redeploy the last known good application. Keep discussions, reports and audit records intact for investigation. Do not restore broad direct-write grants as an emergency shortcut. Any reversal of database privileges needs its own reviewed SQL plan; dropping tables or restoring an old backup is not part of this draft approval.
