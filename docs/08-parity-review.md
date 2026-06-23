# 08 — Feature-Parity Checklist & Readiness Review

Maps every ShaadiOra feature (from the spec) to where it's covered, plus the new feature, plus a final gap review.

---

## 1. Parity matrix (✅ = specified in this blueprint)

### Marketing & discovery
- ✅ Landing (hero, journey, report promo, stats, testimonials wall, FAQ, newsletter) — doc 05 §3, phase 7
- ✅ Templates gallery with faith + state filters, live-demo, select, struck-through pricing — doc 05 §4, phase 7
- ✅ 8 themed templates + Premium Custom, each with signature interaction + themed audio — doc 06 §4, phase 5
- ✅ Blog / About / Contact / Feedback + footer + newsletter — doc 05 §2, phase 7

### Builder (10 sections)
- ✅ Essentials (names, slug + live availability, date, city, countdown, hashtag, name-order switch) — doc 05 §6, phase 2
- ✅ Invitation card (blessing + both families) — phase 2
- ✅ Events (toggleable library, per-event editable cards) — phase 2
- ✅ Story (4-question personality tags + Our Story) — phase 2 (AI tags phase 6)
- ✅ Gallery (1/2/4 layout, upload or paste link) — phase 2
- ✅ Info / Things to Know (drag-reorder, editable cards) — phase 2
- ✅ Gifts & Shagun (heading, note, UPI/registry) — phase 2
- ✅ RSVP (WhatsApp / Google Form / Native + custom questions + popup) — phase 2/3
- ✅ Calendar (add-to-calendar per event, ICS) — phase 3
- ✅ Music (themed soundtrack toggle + floating widget) — phase 3
- ✅ Two-pane live preview (mobile/desktop), progress %, autosave, **local + cloud sync guard**, Save Draft, Clear Form, Change Template, Publish/Unpublish, one-time payment gate, WhatsApp help — doc 05 §6, docs 02 (`revision`), 03 (`saveSection`)

### Guest-facing invite
- ✅ Cinematic themed microsite at `/<slug>`, countdown, all enabled sections, RSVP popup, wishes, gallery, maps/directions, add-to-calendar, soundtrack, WhatsApp contact — doc 05 §7, phase 3

### Dashboard
- ✅ Overview stats (views, RSVPs accepted/declined, attending, wishes) — phase 4
- ✅ Publish panel (view/copy/share), journey tracker, live recent RSVPs, countdown, quick actions — phase 4
- ✅ Guest list directory (search, filters, **CSV/Excel export**) — doc 03 §5, phase 4
- ✅ Wishes wall, Timeline & Events, Payments, saved Wedding Report, Write a Review — phase 4

### AI Wedding Report
- ✅ 12-step personalized quiz (city picker, budget slider w/ per-guest calc, pick-2) — doc 05 §9, phase 6
- ✅ AI generation → shareable report (`?s=<uuid>`) — doc 02/03 §6
- ✅ Metrics, tabs, budget intelligence, vendor Free Quotes — doc 03 §6
- ✅ Export to WhatsApp + PDF, Save to account — doc 03 §6

### New (upgrade)
- ✅ **AI-first intake: invitation-card image upload → vision extraction → full auto-draft → review in builder** — doc 04, phase 6
- ✅ Low-resistance suggestion flow across sections — doc 04 §5

### Platform
- ✅ Phone-OTP auth — doc 01/03
- ✅ Razorpay one-time **and** Premium subscription — doc 01/02/03
- ✅ WhatsApp Business integration — doc 01/03 §9
- ✅ Image CDN (R2/Cloudflare) — doc 01
- ✅ Analytics (GA4 + first-party) — doc 01
- ✅ Ads (AdSense on content + vendor lead-gen) — doc 01
- ✅ SEO/SSR, fast on slow networks — doc 01/06
- ✅ Theme/branding system (rebrand = one file) — doc 00 §2, scaffold `brand.ts`
- ✅ PWA-first mobile, RN later — doc 01, phase 7/8

**Result: 100% of the spec's parity checklist is covered, plus the new AI-first card-intake feature.**

---

## 2. Readiness review — is this enough to hand to Claude Code?

**Strengths**
- Contracts are explicit: Prisma schema, tRPC/REST endpoints, template plugin boundary, AI output schemas. Claude Code can implement against fixed interfaces.
- Phasing is shippable and dependency-ordered (engine → API → builder → guest → dashboard → AI → marketing).
- Branding + theming are centralized and verifiable in review.
- Current-2026 tech facts verified (Next 16, Razorpay subs + UPI Intent, GA4 via @next/third-parties, WhatsApp per-message pricing, vision-LLM for cards).

**Decisions Claude Code should NOT re-litigate (locked)**
Brand = Nimantran · dual monetization · PWA→RN · Next 16 stack · template-as-plugin · server-side AI.

**Open items to confirm before/early in build (not blockers):**
1. **Domain** — secure `nimantran.app`/`.in`/`getnimantran.com`; set `NEXT_PUBLIC_BRAND_DOMAIN`.
2. **Premium tier contents** — exact perks per Premium (extra templates? custom domain? ad-free? AI credit amount?). Placeholder entitlements set; finalize the plan/pricing.
3. **Custom-domain feature** — current site offers `name.com` as a contact-us upsell; decide if self-serve custom domains are in scope (affects DNS/cert automation).
4. **Rituals knowledge base** — source/curate `content/rituals/<faith>.json` for AI accuracy (the one content dependency that gates AI copy quality).
5. **Legal/compliance** — DPDP Act (India) data export/delete, privacy policy, T&S, payment refund policy, AdSense + WhatsApp policy compliance.
6. **Vendor lead-gen** — "Free Quotes" monetization needs vendor partnerships / a lead marketplace; product-side stubbed, business-side TBD.
7. **Image rights** — gallery uploads + uploaded invitation cards: storage retention + consent copy.
8. **Accessibility budget** — confirm WCAG 2.1 AA as the bar (assumed in doc 05 §10).

**Risks & mitigations**
- *Cinematic interactions are heavy* → lazy-load per template, reduced-motion fallback, performance budget (doc 06 §5).
- *AI cultural inaccuracy* → curated rituals KB + schema validation + human-editable (doc 04 §4).
- *Payment edge cases* → webhook is source of truth, idempotent, UPI Intent/QR per NPCI change (doc 03 §8).
- *OCR variance on ornate cards* → confidence policy + graceful manual fallback; flow never dead-ends (doc 04 §6).

---

## 3. Suggested first commit for Claude Code
1. Scaffold install + Prisma migrate (Phase 0).
2. Implement `brand.ts`-driven shell + GA4 + auth OTP.
3. Build the template engine + **Imperial Heritage** end-to-end (Phase 1) — this validates the single most important architectural decision before breadth.
