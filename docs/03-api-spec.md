# 03 — API Spec

Two surfaces:
- **tRPC routers** for the authenticated app (builder, dashboard, intake, report) — end-to-end typed.
- **REST** for: public guest actions (RSVP, wishes, views), OTP, payments + webhooks, file uploads, and anything an external system calls.

All inputs validated with **Zod** (shared with client). Auth via session cookie (Auth.js). Rate-limited via Redis.

---

## 1. Auth (REST + tRPC)

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/otp/start` | `{ phone, channel? }` | Creates `OtpChallenge`, sends OTP via MSG91 (SMS) or WhatsApp. Rate-limited per phone/IP. |
| POST | `/api/auth/otp/verify` | `{ phone, code }` | Verifies, creates/finds User, issues session cookie. |
| POST | `/api/auth/logout` | — | Clears session. |
| `auth.me` (tRPC query) | — | — | Current user + entitlements summary. |

---

## 2. Templates & catalog (tRPC)

| Procedure | Type | Input | Returns |
|---|---|---|---|
| `templates.list` | query | `{ faith?, region? }` | Template[] (catalog + price), filtered. |
| `templates.get` | query | `{ id }` | Template + schema metadata (doc 06). |

Public REST mirror for SSG marketing pages: `GET /api/templates`.

---

## 3. Invitation / Builder (tRPC, auth)

| Procedure | Type | Input | Returns / Effect |
|---|---|---|---|
| `invitation.create` | mutation | `{ templateId, fromIntakeId? }` | New draft (optionally hydrated from an AI intake draft). |
| `invitation.get` | query | `{ id }` | Full aggregate (content + all sections) + `revision`. |
| `invitation.checkSlug` | query | `{ slug }` | `{ available }` — Redis-cached, debounced from client. |
| `invitation.saveSection` | mutation | `{ id, revision, section, payload }` | Saves one section; **rejects if `revision` stale** (sync guard) → client shows "Unsaved Cloud Changes". Bumps `revision`. |
| `invitation.saveAll` | mutation | `{ id, revision, document }` | Bulk save (used by AI draft confirm + Save Draft). |
| `invitation.setTemplate` | mutation | `{ id, templateId }` | Change template; re-maps fields to new schema. |
| `invitation.clearForm` | mutation | `{ id }` | Reset to template defaults. |
| `invitation.publish` | mutation | `{ id }` | **Entitlement-gated** (publish fee paid OR Premium). Sets PUBLISHED, `publishedAt`, warms CDN. |
| `invitation.unpublish` | mutation | `{ id }` | Sets OFFLINE. |
| `invitation.list` | query | — | User's invitations (for dashboard/account). |

**Section payload shapes** (one per builder tab) are the typed slices of doc 02: `essentials`, `invitationCard`, `events`, `story`, `gallery`, `info`, `gifts`, `rsvp`, `calendar`, `music`. Each validated by its Zod schema; the union forms the full invitation document.

---

## 4. Guest-facing (REST, public, per-slug)

| Method | Route | Body | Notes |
|---|---|---|---|
| GET | `/<slug>` | — | SSR published invite (Next route, not /api). Cached. |
| POST | `/api/i/:slug/rsvp` | `{ guestName, phone?, attending, guestCount, message?, answers? }` | Native RSVP → `RsvpResponse`. Rate-limited; spam-guarded. Fires WhatsApp confirmation (utility template) if configured. |
| POST | `/api/i/:slug/wish` | `{ name, message }` | Adds Wish (optional moderation). |
| POST | `/api/i/:slug/view` | `{ ref? }` | Fire-and-forget analytics; deduped per session. |
| GET | `/api/i/:slug/calendar/:eventId.ics` | — | ICS download for add-to-calendar. |

For WhatsApp & Google Form RSVP modes the page renders deep links instead of posting here.

---

## 5. Dashboard (tRPC, auth, owner-scoped)

| Procedure | Type | Input | Returns |
|---|---|---|---|
| `dash.overview` | query | `{ invitationId }` | Stat cards (views, rsvps accepted/declined, attending, wishes), publish status, journey tracker, countdown, recent RSVPs. |
| `dash.guests.list` | query | `{ invitationId, q?, filter? }` | Guest directory; filter = all/attending/declined/withMessage; search name/phone. |
| `dash.guests.export` | mutation | `{ invitationId, format: 'csv'|'xlsx' }` | Generates export (name, phone, attending count, message, answers) → signed R2 URL. |
| `dash.wishes.list` | query | `{ invitationId }` | Wishes wall. |
| `dash.wishes.moderate` | mutation | `{ wishId, approved }` | Optional. |
| `dash.timeline` | query | `{ invitationId }` | Events schedule view. |
| `dash.payments` | query | `{ invitationId }` | Payment/order records. |
| `dash.review.submit` | mutation | `{ rating, text, city?, guestCount? }` | Testimonial capture. |

---

## 6. AI Wedding Report (tRPC + REST)

| Procedure | Type | Input | Effect |
|---|---|---|---|
| `report.start` | mutation | `{ preForm }` | Creates `WeddingReport` (PENDING). |
| `report.submit` | mutation | `{ reportId, answers }` (12 steps) | Enqueues generation (Inngest) → status GENERATING. |
| `report.get` | query | `{ shareId }` | Returns generated report JSON when READY; supports public share. |
| POST | `/api/report/:shareId/pdf` | — | Renders PDF (Playwright) → signed URL. |
| POST | `/api/report/:shareId/whatsapp` | `{ phone }` | Sends report summary via WhatsApp template. |
| `report.save` | mutation | `{ shareId }` | Attach to user account (login required). |
| `report.quotes` | mutation | `{ shareId, categories[] }` | Vendor lead-gen ("Free Quotes") capture. |

Report generation contract (LLM output → validated JSON): `{ readiness, persona, daysAway, dna:{scale,vibe,focus,exp}, budget:{dream,actual,gap,splitPct{}, perGuest, scores{}}, priority, roadmap[], vendors[], watchOutFor[] }`.

---

## 7. AI-first intake + Card OCR (tRPC + REST) — the new feature

| Procedure / Route | Type | Input | Effect |
|---|---|---|---|
| POST `/api/intake/card` | REST | multipart image | Uploads card to R2, creates `CardUpload` (UPLOADED), enqueues OCR job. Returns `{ uploadId }`. |
| `intake.cardStatus` | query | `{ uploadId }` | Poll OCR: PROCESSING → EXTRACTED `{ extracted, confidence }`. |
| `intake.start` | mutation | `{ extracted?, answers? }` | Creates `IntakeSession`; seeds answers from card extraction. |
| `intake.answer` | mutation | `{ sessionId, step, value }` | Saves a quick-intake answer (taps/short text). |
| `intake.generateDraft` | mutation | `{ sessionId }` | Enqueues LLM job → produces full invitation draft (template pick + all section copy). Status DRAFTED. |
| `intake.getDraft` | query | `{ sessionId }` | Returns `aiDraft` when ready. |
| `intake.confirm` | mutation | `{ sessionId, edits? }` | Creates an `Invitation` from the draft (`invitation.create` with `fromIntakeId`) and drops user into builder. |
| `ai.regenerateField` | mutation | `{ invitationId, field, tone }` | Inline "regenerate / shorter / more traditional / more modern" per field. |
| `ai.personalityTags` | mutation | `{ answers }` | Generates Story tags from the 4 questions. |

Full extraction schema + prompts in **doc 04**.

---

## 8. Payments & webhooks (REST)

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/pay/order` | `{ invitationId }` | Creates Razorpay **Order** for the template's price (one-time publish fee). Returns order for UPI **Intent/QR** (UPI Collect deprecated). |
| POST | `/api/pay/subscription` | `{ plan }` | Creates Razorpay **Subscription** (Premium) via UPI Autopay / eMandate. |
| POST | `/api/pay/webhook` | Razorpay event | **Source of truth.** Verifies signature → on `payment.captured`/`order.paid` sets `Payment.CAPTURED` + `Invitation.paymentStatus=PAID` + grants `Entitlement(publish:<id>)`; on subscription events updates `Subscription` + `Entitlement(premium)`. Idempotent. |
| `pay.history` | tRPC query | `{ invitationId? }` | For dashboard Payments tab. |

**Entitlement resolver** (`lib/entitlements.ts`) answers: `canPublish(invitationId)`, `isPremium(userId)`, `adsDisabled(userId)`, `customDomainAllowed`, `aiCredits`. Reads `Entitlement` cache, falls back to `Payment`+`Subscription`.

---

## 9. Notifications (internal services, queue-driven)

- `whatsapp.send(template, to, vars)` — OTP (auth template), RSVP confirmation (utility), share, support hand-off. Per-message pricing; India utility/auth ~$0.01.
- `email.send` — receipts (Resend).
- All sends go through Inngest with retries + a `NotificationLog` (add if audit needed).

---

## 10. Cross-cutting

- **Errors:** typed error envelope `{ code, message, fieldErrors? }`; tRPC error formatter maps Zod issues.
- **Rate limits (Redis):** OTP (5/phone/hr), RSVP (per IP+slug), AI generate (per user/day, tied to `ai_credits`), slug-check (burst).
- **Idempotency:** payment webhook + AI jobs keyed by provider event id / session id.
- **AuthZ:** every `invitation.*`/`dash.*` checks `invitation.userId === session.userId`.
- **Caching:** slug→invitationId in Redis; published invite HTML via Next cache + CDN, invalidated on publish/unpublish/save-while-published.
