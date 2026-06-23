# ShaadiOra — Product Specification & Rebuild Blueprint

*Prepared for: Karan · Date: 23 June 2026*
*Source: Live walkthrough of https://shaadiora.com (public site + paid test account: builder, dashboard, wedding report)*

---

## 0. Purpose of this document

This is a complete, accurate record of **everything ShaadiOra does today**, captured from a live walkthrough of the production site (public pages, the logged-in builder, the dashboard, and the full AI Wedding Report flow). It is written so it can be:

1. Used as the single source of truth for the feature set ("an exact replica with all the features it offers right now").
2. Fed directly to AI coding tools to regenerate the codebase on a new architecture.
3. Used to design the **AI-first invitation intake** you want at the start of the flow.

The document has two halves:

- **Part A — What exists today** (sections 1–8): pages, flows, every builder section, the dashboard, the AI Wedding Report, design language, pricing.
- **Part B — Rebuild blueprint** (sections 9–14): proposed architecture, data model, tech stack, the new AI intake design, a build roadmap, and a feature parity checklist.

---

# PART A — WHAT EXISTS TODAY

## 1. Product summary

ShaadiOra is a **luxury Indian wedding website + digital invitation builder**. A couple picks a culturally-themed, cinematic, mobile-first template, fills in their details through a guided builder, and publishes a personalized wedding microsite at `shaadiora.com/<their-slug>`. Guests open one link to view ceremonies, get directions, RSVP, leave wishes, and view a gallery. The couple manages everything (RSVPs, guests, wishes, payments) from a dashboard.

A second, distinct product lives alongside it: the **Wedding Intelligence Report** — a free, AI-generated wedding-planning report driven by a 12-step quiz, used as a lead magnet and consultation tool.

**Positioning / tagline:** "A Wedding Website Your Guests Will Never Forget." · "Crafting a digital sanctuary for your seven sacred steps."

**Tone:** premium, cinematic, devotional (Sanskrit shlokas, gold-on-dark palette, particle/starfield animations), heavily India-first (faith- and region-specific themes).

**Trust signals used on site:** 1,450+ couples, 4.9/5 rating, 99% would recommend, "5 min avg setup", 2,847 reports generated this month.

---

## 2. Site map & navigation

**Primary nav:** Home · Templates · Builder · Wedding Report · More (dropdown) · Account/login chip.

**More dropdown / footer links:** Blog, About, Contact, Feedback.

**Footer:** brand blurb, social ("Follow our journey"), Explore links (Home, Templates, Builder, Wedding Report, Blog, About, Contact, Feedback), newsletter signup ("Wedding planning tips, free templates & offers"), Privacy Policy, Terms of Service. Footer credit: "© 2026 SHAADIORA.COM" and a personal attribution "Need a custom website, app, or AI? Visit pranavfulkari.com".

**Key routes observed:**

| Route | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/templates` | Template gallery with faith/region filters |
| `/builder` | The invitation builder (auth-gated; loads draft) |
| `/dashboard` | Couple's management dashboard (auth-gated) |
| `/wedding-report` | AI Wedding Report intro + 12-step quiz |
| `/wedding-report/report?s=<uuid>` | Generated shareable report |
| `/<slug>` (e.g. `/prajuwedsnikhil`) | The published guest-facing invitation |

**Auth:** phone-number based (account chip shows `+91 7…725`). Login is required for builder, dashboard, and saving a report.

---

## 3. Landing page (`/`)

Sections, in scroll order:

1. **Hero** — animated starfield, brand monogram, shlokas (॥ श्री गणेशाय नमः ॥ • ॥ शुभ विवाह ॥), headline "A Wedding Website Your Guests Will Never Forget", "Swipe to create" / "Scroll to unveil" prompts.
2. **Wedding Templates** — "Choose Your Perfect Design", horizontally featured template cards (each with Live Demo + Select Design + price), link to View All Templates.
3. **Your Shaadi Journey** — a 7-step "seven sacred chapters" explainer: (01) Select Template, (02) Customise Styling, (03) Smart Invitations, (04) Sacred Venue (Google Maps), (05) Ritual Timeline, (06) Go Live (custom domain), (07) Eternal Memories (guestbook + galleries).
4. **Wedding Intelligence Report promo** — "India's First Wedding Intelligence Report", "4 fun games", positioned as a ₹8,000 consultation free, ~8 min, with an animated sample report (readiness %, alignment %, budget dream-vs-actual, budget split donut).
5. **Stats band** — 2,847 reports generated, ₹8K consultation value, 4.9 average rating, 8 min average completion.
6. **Testimonials** — large rotating wall of verified reviews (couples, city, guest count, star rating), bilingual (Hindi/Hinglish + English), covering many regions, faiths, and wedding types.
7. **FAQ** — accordion: what is it, cost, build time, RSVP/photos, regional templates, no skills needed, custom design, how to share.
8. **Newsletter + footer.**

---

## 4. Templates (`/templates`)

Heading: "The Sartorial Collection — Beautiful Wedding Websites For Your Celebration."

**Filters:**
- **By Faith:** All Faiths · Hindu (॥ Shubh Vivah ॥) · Muslim (✦ Nikah Mubarak ✦) · Christian (✙ Holy Matrimony ✙) · Sikh (☬ Anand Karaj ☬) · Buddhist (☸ Vivah Mangalam ☸) · Jain (✵ Lagna Shubh Muhurat ✵) · Parsi (✦ Lagan Mubarak ✦)
- **By State:** All States · Maharashtra · Punjab · Rajasthan · South Indian · Bengali · Gujarati · Seven Sisters (North East)

Each card: thumbnail, **Live Demo** badge, name, tag (region • motif/palette), descriptive blurb, original price (struck through) + current price, **Live Demo** and **Select Design** buttons.

**Templates observed (8 themed + 1 custom):**

| Template | Region / Theme | Hook (signature interaction) | Price (from → now) |
|---|---|---|---|
| Imperial Heritage | All • Royal Maroon & Gold | Regal crimson + peacock-gold borders | ₹1,999 → ₹1 |
| Punjabi Virsa | Punjab • Phulkari & Marigold | Pull-the-dhol curtain reveal, marigold petal showers, bhangra animations | ₹3,999 → ₹1,999 |
| Muggu Vaakili | Tamil Nadu & Andhra • Kolam & Deepam | Trace the kolam to break dawn; lit diya travels a rice-flour line; tap lamps | ₹1,999 → ₹999 |
| Paithani Mor | Maharashtra • Dhol-Tasha & Ganeshotsav | Play the dhol to enter; gulal bursts on tap; rhythm-staff ceremonies | ₹2,999 → ₹1,499 |
| Mewar Jharokha | Rajasthan • Udaipur Pichwai & Sheesh Mahal | Slide carved jharokha shutters; swaying jhoomer; peacocks; fireworks finale | ₹5,999 → ₹2,999 |
| Vintage Ride | All • Ivory, Charcoal & Gold | Scroll drives a vintage convertible down a sunset highway to an invite deck | ₹1,999 → ₹999 |
| Kerala Backwaters | Kerala • Kettuvallam & Mural Poetry | Drift on a houseboat; light nilavilakku lamps; part kasavu curtains | ₹1,999 → ₹999 |
| Premium Custom | All • Designed by team | Handcrafted from scratch by ShaadiOra designers | ₹29,999 → ₹14,999 |

**Pricing model:** per-template, **one-time payment** (no subscription seen). Each template carries its own price; the builder footer shows the active template's price and a Publish button gates publishing behind that payment. Custom is a high-touch upsell ("View Perks" / "Order Now").

Each template is a **cinematic, interactive, mobile-first experience** — not a static page. Signature scroll/tap interactions and themed background music are the core differentiator.

---

## 5. The Builder (`/builder`) — core product

Layout: **two-pane editor.**
- **Left:** section tabs + the active section's form fields, with Back / Next buttons to move sequentially.
- **Right:** a **live preview** rendered inside a phone frame, with a **mobile/desktop toggle**. The preview updates instantly as fields change.

**Top bar:** back arrow · ShaadiOra logo · "Builder Mode" badge · **Progress ring + %** ("Keep building…") · "All changes saved" autosave indicator · mobile/desktop toggle · **Need Help?** · Home · **Dashboard** · **Clear Form** · **Save Draft** · **Preview**.

**Bottom bar:** active **Theme** name + **Change Template** link · template **price (₹999)** + "one-time payment" · **Unpublish** · **Publish**. A floating WhatsApp **Help** button sits bottom-right.

**Persistence model:** edits autosave locally; leaving with unsynced edits triggers an **"Unsaved Cloud Changes"** modal → Save & Exit / Discard & Exit / Keep Editing. So there are **two persistence layers: local draft + cloud account sync.**

### Builder sections (10 tabs)

Each section can typically be toggled on/off ("Include/Show this section"). Sections:

**1. Essentials — "The Couple"**
- **Custom invitation URL:** `shaadiora.com/<slug>` with **live availability checking** ("Checking availability…"). Upsell: "Want a premium custom domain like prajuwedsnikhil.com? Contact us."
- Bride's Name, Groom's Name (emoji allowed in names).
- **Name Display Order** with a Switch (Bride & Groom ↔ Groom & Bride).
- Drives the hero: "The Wedding Of [names]", date, city, **live countdown timer** (days/hrs/min/sec), wedding hashtag (e.g. `#pranik`), "You are invited".

**2. Invitation — "Invitation Card"**
- Show Invitation Section toggle.
- Opening Blessing (free text).
- Family details: Bride's Father, Bride's Mother, Groom's Father, Groom's Mother → renders "With the compliments of / Bride's Family / Groom's Family".

**3. Events — "Celebration Events"**
- "Select events to include. Each gets a detail card you can edit."
- **Event library (toggleable):** Mehendi, Haldi, Sagan, Cocktail, Sangeet, Tilak, Engagement, Baraat, Shaadi, Pheras, Reception, Vidaai (and more). Each selected event renders a card with icon, name, **location**, and an editable **description** (pre-filled with a tasteful default).

**4. Story — "Meet the Couple"**
- Include toggle. Two sub-tabs:
  - **Personality Tags:** "Answer these 4 simple questions — we'll generate personality tags automatically." (e.g. "How did your story begin?" → Through family/arranged, At work or college, …). Produces tags like *Campus Sweethearts, Foodie Partners, Chai & Chat, Classic Romantics.* (An auto-generation/AI-style feature.)
  - **Our Story:** free-text love story.

**5. Gallery — "Photo Gallery"**
- Include toggle.
- **Photo Layout:** 1 / 2 / 4 photos.
- **Upload slots** (Slot 1, Slot 2, …) via **Upload Photo** or **Paste image link**.

**6. Info — "Things to Know"**
- Show toggle.
- **Active cards** are **drag-to-reorder** and click-to-edit. Defaults: Dress Code, Parking, Wedding Hashtag, Venue Address. Each card has a heading + body; cards can be added/removed/reordered.

**7. Gifts — "Gifts & Shagun"**
- Include toggle ("Show or hide payment details and registry links").
- Editable Section Heading + Blessings Message/Note.
- Digital payment / registry details (UPI etc.) for shagun.

**8. RSVP — "RSVP Setup"**
- Enable RSVP Section toggle.
- **RSVP Destination Style (3 modes):**
  - **WhatsApp** — direct prefilled chat.
  - **Google Form** — link to an external form.
  - **Native Form** — "Save entries to ShaadiOra." → **ShaadiOra Native Guestlist**: an interactive RSVP form on the page; all guest entries (names, phone numbers, guest counts, personal messages) auto-compile into the private dashboard. No external setup.
- Editable Section Heading + RSVP intro copy. Guest-facing CTA "Joyfully Accept" opens an **interactive RSVP popup**. (Testimonials confirm **custom RSVP questions**, e.g. meal preference — veg/non-veg/Jain — and attending counts.)

**9. Calendar — "Save the Date & Calendar"**
- Enable Calendar Section toggle. "Let guests add ceremonies to their calendar or schedule meetings" → **add-to-calendar** buttons per event.

**10. Music — "Soundtrack & Melodies"**
- Enable Website Soundtrack toggle. A delicate floating music widget plays the selected themed track (e.g. shehnai) when guests tap it.

**Guest-facing invite also includes:** "Have Questions? Reach out to us on WhatsApp" with a tap-to-chat button to the couple's number.

---

## 6. The Dashboard (`/dashboard`)

Header: "Welcome back, [names] · Manage your invitation and view guest responses" + **Open Builder**.

**Tabs:** Overview · Guest List · Wishes Wall · Timeline & Events · Payments · Wedding Report · Write a Review.

**Overview:**
- **Stat cards:** Total Views, RSVPs Received (accepted/declined breakdown), Guests Attending (total confirmed), Wishes Received.
- **Publish status panel:** "Invitation is published and live at shaadiora.com/<slug>" with **View Invite / Copy Link / Share**.
- **Journey tracker:** Signed Up → Designed → Customised → Published.
- **Recent RSVP Submissions** (live; "responses appear here instantly") + View All Guestlist.
- **Wedding Countdown** + View Live Invite.
- **Quick Actions:** Go to Builder, Take Invite Offline (unpublish), Manage Guests, Wishes Wall.

**Guest List — "RSVP Guestlist Directory":**
- "Viewing N total guest responses."
- Search by name or phone.
- Filters: All Responses · Attending Only · Declines Only · With Message.
- (Testimonials confirm **CSV / Excel export** with clean columns: name, phone, attending count, wishes.)

**Wishes Wall:** collected guest wishes/messages.
**Timeline & Events:** the couple's event schedule view.
**Payments:** payment/order records for the invite.
**Wedding Report:** access the couple's saved AI report.
**Write a Review:** prompt to submit a testimonial.

---

## 7. The AI Wedding Intelligence Report (`/wedding-report`)

A standalone lead-gen + planning tool. **Free · ~2–8 min · no login to start** (login required to save).

**Intro screen:** "Your personal Wedding Intelligence" → Create my report. Promises: Readiness score, Wedding DNA, Budget plan, next moves.

**Intake = a 12-step quiz** (marketed as "4 fun games"; grouped into themed chapters). Captured in full:

| Step | Chapter | Question | Answer type |
|---|---|---|---|
| Pre | Let's begin | Bride's name, Groom's name, Wedding City (searchable, state-grouped, "Other" manual), Wedding Date | Form |
| Q1 | The Foundation | Where are you with your venue? | Booked / Shortlisted / Just starting |
| Q2 | The Numbers | How clear is your budget? | Set with a buffer / A rough number / Not yet |
| Q3 | The Circle | Is your guest list decided? | Locked / Still debating / No idea yet |
| Q4 | The Families | Are both families on the same page? | Fully aligned / Some friction / Real tension |
| Q5 | The Energy | How does planning, *[Name]*, feel right now? *(personalized)* | Calm & in control / A bit much / Overwhelmed |
| Q6 | Your Setting | Which wedding setting calls to you? | Heritage Palace / Beach Destination / Urban Luxury Hotel / Nature Retreat (visual 2×2) |
| Q7 | Your Palette | Which colour story is yours? | Royal Reds & Gold / Pastel & Whites / Earthy & Rustic / Bold & Eclectic |
| Q8 | Your Table | How should guests feast? | Lavish Buffet / Curated Gourmet Plated / Interactive Food Stations / Intimate Family-Style |
| Q9 | Your Ceremony | Which ceremony feels right? | Full Traditional / Short & Meaningful / Modern Fusion / Unconventional |
| Q10 | The Scale | How many guests are you expecting? | 50–200 / 200–400 / 400–600 / 600–900 / 900+ |
| Q11 | The Budget | What's your realistic wedding budget? | **Slider ₹5L–₹3Cr+**, live "≈ ₹/guest" calc |
| Q12 | Your Heart | What matters most to you two? (pick up to 2) | Venue / Food / Décor / Photos & Film / Outfits & Glam / Music & Party |

Then "**Reveal my Wedding Report**" → an **AI generation step** ("Composing the report for [names]… Mapping your Wedding DNA…").

**Generated report (`/wedding-report/report?s=<uuid>`):**
- Personalized headline ("[names], you're ahead of most couples at your stage"), city + days-to-wedding.
- **Hero metrics:** Days Away, **Readiness %** (+ persona, e.g. "Wedding Prodigy"), **Wedding DNA** (e.g. "Grand / Grand Celebrationists").
- **Tabs:** Overview · Readiness · Wedding DNA · Budget · Vendors · Watch Out For · Roadmap · Wedding Hub · Free Quotes · Share.
- **Wedding DNA scores:** Scale / Vibe / Focus / Exp (radar-style).
- **Budget Intelligence:** dream-vs-actual forecast with gap, **budget split %** across Venue/Catering/Décor/Photo/Fashion/Music/Stay/Rituals, per-guest math, and **scores** (Luxury, Guest Exp, Visual, Efficiency).
- **#1 priority right now** + phase guidance tied to days-to-wedding.
- **Outputs/actions:** **Export to WhatsApp**, **Export to PDF**, **Save to my account**, **Free Quotes** (vendor lead-gen), optional add-ons (e.g. "The Shaadi Sync — how aligned are you really?").

This report is the clearest existing example of **AI-driven personalization** and is the conceptual template for the new AI intake (see §11).

---

## 8. Design language & UX patterns

- **Palette:** near-black backgrounds, gold/brass accents, maroon CTAs; per-template palettes (peacock-teal, marigold, kasavu cream, saffron, etc.).
- **Typography:** elegant serif display (italic accents) + refined sans for labels/UI; generous letter-spacing on small caps labels.
- **Motion:** animated starfield/particles, radial light bursts, progress rings, section reveal-on-scroll, themed signature interactions per template, themed background audio.
- **Mobile-first:** everything designed for the phone first; builder previews in a phone frame by default with a desktop toggle.
- **Devotional/cultural framing:** Sanskrit shlokas, faith-specific salutations, region-specific motifs.
- **Microcopy:** warm, ceremonial ("Eternal Memories", "Seven Sacred Chapters", "Joyfully Accept").
- **Recurring UX patterns:** toggle-to-include sections, inline slug availability check, drag-reorder cards, live two-pane preview, autosave + cloud-sync guard, one-time-payment publish gate, WhatsApp-native sharing/support.

---

# PART B — REBUILD BLUEPRINT

> The goal: an **exact functional replica** of everything in Part A, on a **clean new architecture**, with an **AI-first intake** added at the very start to make filling in the invitation effortless.

## 9. Recommended architecture (high level)

A modern, modular monolith that can split into services later:

- **Frontend:** Next.js (App Router) + React + TypeScript. SSR/SSG for marketing + published invites (SEO + fast first paint on slow networks — explicitly praised in testimonials); client interactivity for builder.
- **Styling/animation:** Tailwind CSS + a token-based theme system; Framer Motion + GSAP for the cinematic template interactions; Lottie for complex per-template motion.
- **Backend/API:** Next.js route handlers or a separate NestJS/Express API; tRPC or REST. 
- **Database:** PostgreSQL (relational fits couples/guests/RSVPs cleanly) via Prisma ORM. Redis for caching slug lookups, view counts, and rate limiting.
- **Auth:** phone-OTP (e.g. Twilio/MSG91) — matches current phone login; JWT/session.
- **Storage/CDN:** S3-compatible object storage + CDN (Cloudflare) for gallery images and audio; on-the-fly image optimization.
- **Payments:** Razorpay (India-first, UPI) for the one-time per-template publish fee; webhook-driven entitlement.
- **AI layer:** an LLM service (Claude/GPT) behind a server-side gateway for the new intake, the Wedding Report, the personality tags, and copy generation. Never call the model from the client.
- **Notifications:** WhatsApp Business API (sharing, RSVP confirmations, support), email for receipts.
- **Hosting:** Vercel (frontend) + managed Postgres (Neon/RDS) + Cloudflare; or a single cloud (AWS) if you prefer consolidation.

**Architectural principles:** template = a self-contained, data-driven module (schema + renderer + assets + interactions); the builder edits a single normalized `invitation` JSON; the same renderer powers both the builder preview and the published site (one source of truth, no drift).

## 10. Suggested data model (core entities)

- **User** (id, phone, name, createdAt).
- **Invitation** (id, userId, slug *(unique, availability-checked)*, templateId, status `draft|published|offline`, paymentStatus, themeSettings, displayOrder, publishedAt).
- **InvitationContent** (one JSON blob or normalized tables): couple (names, date, city, hashtag, countdown), invitationCard (blessing, parents), sectionsEnabled map.
- **Event** (id, invitationId, type, title, icon, location, description, datetime, order, calendarEnabled).
- **StorySection** (personalityAnswers, generatedTags[], storyText, included).
- **GalleryItem** (id, invitationId, url, slot, order; layout setting on invitation).
- **InfoCard** (id, invitationId, heading, body, order, enabled).
- **GiftDetails** (heading, note, upiId, registryLinks[], enabled).
- **RsvpConfig** (mode `whatsapp|googleform|native`, heading, intro, customQuestions[]).
- **RsvpResponse** (id, invitationId, guestName, phone, attending bool, guestCount, message, answers{}, createdAt) — feeds the dashboard guest list.
- **Wish** (id, invitationId, name, message, createdAt) — wishes wall.
- **MusicConfig** (enabled, trackId).
- **Payment** (id, invitationId, amount, provider, providerRef, status).
- **AnalyticsEvent** (invitationId, type `view|visit`, ts) — powers Total Views.
- **WeddingReport** (id, userId?, shareId(uuid), inputs{12 answers}, generatedJson, createdAt).

## 11. The new AI-first intake (the headline upgrade)

**Problem today:** the builder is excellent but still asks the couple to fill ~10 sections field-by-field. **Goal:** let AI do 80% of the form, so the couple mostly *reviews and confirms*.

**Proposed flow:**

1. **Conversational/quick intake** (reuse the polished Wedding Report quiz UX): names, date, city, faith/region, languages, ceremonies they'll have, vibe, palette, guest scale, hashtag, love-story prompt. Mostly taps + a few short text answers; optional voice or "paste your WhatsApp save-the-date" input.
2. **AI draft generation:** the LLM produces a **complete invitation draft** from those answers:
   - Picks/recommends the best-fit **template** (by faith + region + vibe + palette + scale).
   - Writes the **opening blessing**, each **event description** (correct rituals for the selected faith/region), the **"Meet the Couple" story** + personality tags, **Things-to-Know** cards (dress code, parking, hashtag, venue), **Gifts** note, and **RSVP** intro copy.
   - Suggests the **slug** and checks availability.
   - Proposes a **soundtrack** and gallery layout.
3. **Review & refine:** drop the couple into the existing two-pane builder with everything pre-filled. Every AI field has an inline **"regenerate / make it shorter / more traditional / more modern"** control. Nothing is locked — full manual control retained.
4. **Publish** as today (one-time payment per template).

**Why this is achievable:** the Wedding Report already proves the intake UX, the AI generation step, and structured personalized output. The new intake is the same pattern pointed at *populating the invitation schema* instead of a report.

**AI guardrails:** all generation server-side; validate AI output against the invitation JSON schema; ritual/faith content drawn from a curated knowledge base per faith/region to avoid inaccuracies; human-editable everywhere.

## 12. Template engine (most important rebuild decision)

Treat each template as a **plugin**:
- `template.config` — metadata (name, faith, region, palette, price, motifs).
- `schema` — which sections/fields it supports + defaults.
- `Renderer` — a React component tree that consumes the invitation JSON.
- `interactions` — the signature animation (dhol, kolam, jharokha, houseboat, vintage car…), lazy-loaded.
- `assets` — vectors, textures, audio.

Benefits: add templates without touching core; the builder auto-adapts its form to the template schema; one renderer serves preview + live site; Custom template = a bespoke config the design team authors.

## 13. Build roadmap (phased)

- **Phase 0 — Foundations:** repo, design tokens, auth (phone OTP), DB + Prisma schema, storage/CDN, payments sandbox.
- **Phase 1 — Template engine + 1 template** end-to-end (schema → renderer → builder → publish at `/<slug>`).
- **Phase 2 — Full builder:** all 10 sections, autosave + cloud-sync guard, slug availability, mobile/desktop preview.
- **Phase 3 — Guest experience:** published invite, native RSVP popup + custom questions, wishes wall, gallery, calendar, soundtrack, WhatsApp share/support, view analytics.
- **Phase 4 — Dashboard:** overview stats, guest list (filters + CSV/Excel export), wishes, timeline, payments, journey tracker.
- **Phase 5 — Port remaining templates** (all 8 + Custom pipeline).
- **Phase 6 — AI layer:** Wedding Report parity, then the **AI-first intake** (§11), personality tags, copy regeneration.
- **Phase 7 — Marketing site:** landing, templates gallery + filters, testimonials, FAQ, blog, SEO.

## 14. Feature parity checklist (must-haves for "exact replica")

**Marketing & discovery**
- [ ] Landing page (hero, journey, report promo, stats, testimonials wall, FAQ, newsletter)
- [ ] Templates gallery with **faith** + **state** filters, live-demo + select, struck-through pricing
- [ ] 8 themed templates + Premium Custom upsell, each with signature interaction + themed audio

**Builder (10 sections)**
- [ ] Essentials (names, slug + live availability, date, city, countdown, hashtag, name order switch)
- [ ] Invitation card (blessing + both families)
- [ ] Events (toggleable library, per-event editable cards: name/location/description)
- [ ] Story (4-question personality tags + Our Story)
- [ ] Gallery (1/2/4 layout, upload or paste link)
- [ ] Info / Things to Know (drag-reorder, editable cards)
- [ ] Gifts & Shagun (heading, note, UPI/registry)
- [ ] RSVP (WhatsApp / Google Form / Native guestlist + custom questions + interactive popup)
- [ ] Calendar (add-to-calendar per event)
- [ ] Music (themed soundtrack toggle + floating widget)
- [ ] Two-pane live preview (mobile/desktop), progress %, autosave, **local + cloud sync guard**, Save Draft, Clear Form, Change Template, Publish/Unpublish, one-time payment gate, WhatsApp help

**Guest-facing invite**
- [ ] Cinematic themed microsite at `/<slug>`, countdown, all enabled sections, RSVP popup, wishes, gallery, maps/directions, add-to-calendar, soundtrack, WhatsApp contact

**Dashboard**
- [ ] Overview stats (views, RSVPs accepted/declined, attending, wishes)
- [ ] Publish panel (view/copy/share), journey tracker, live recent RSVPs, countdown, quick actions
- [ ] Guest list directory (search, filters, **CSV/Excel export**)
- [ ] Wishes wall, Timeline & Events, Payments, saved Wedding Report, Write a Review

**AI Wedding Report**
- [ ] 12-step personalized quiz (incl. city picker, budget slider w/ per-guest calc, pick-2 priorities)
- [ ] AI generation step → shareable report (`?s=<uuid>`)
- [ ] Metrics (Days, Readiness, Wedding DNA), tabs (Overview/Readiness/DNA/Budget/Vendors/Watch Out For/Roadmap/Hub), budget intelligence, vendor Free Quotes
- [ ] Export to WhatsApp + PDF, Save to account

**New (upgrade)**
- [ ] AI-first invitation intake that auto-drafts the entire invitation, then drops into the builder for review/refine

**Platform**
- [ ] Phone-OTP auth, Razorpay one-time payments, WhatsApp Business integration, image CDN, analytics, SEO/SSR, fast on slow networks

---

*End of document. Screens referenced were captured live from the production site and the paid test account on 23 June 2026. Pricing and template lineup reflect what was live on that date and may change.*
