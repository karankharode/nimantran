# 05 — UI Layouts & Wireframes

Text wireframes + layout structures for every surface, the component inventory, and design tokens. Mobile-first; `[ ]` = button, `( )` = toggle, `▤` = card, `▦` = preview pane.

---

## 1. Design tokens (foundation)

```
Color (brand-level; templates override per-theme via CSS vars)
  --bg            #0a0a0a (near-black)      --surface  #14110d
  --gold          #c9a24b                   --gold-dim #8a6f33
  --maroon        #7a1f2b (CTA)             --text     #f3ece0
  --muted         #b9ad97                   --success  #3fae6b
Typography
  --font-display  Cormorant Garamond (serif, italic accents)
  --font-ui       Inter (labels/UI)
  scale: 12 / 14 / 16 / 20 / 28 / 40 / 64
Spacing  4 / 8 / 12 / 16 / 24 / 32 / 48 / 64    Radius 8 / 16 / 24 / full
Motion   reveal-on-scroll, progress rings, particle starfield, radial bursts
Elevation soft gold glow on focus; no harsh shadows
```
Per-template themes (palette, motif textures, display font, audio) come from the template config (doc 06) and re-map these vars.

---

## 2. Route map (Next.js App Router)

```
app/
  (marketing)/            page.tsx (landing)  templates/  blog/  about/  contact/  feedback/
  (auth)/                 login/   (OTP)
  intake/                 page.tsx (AI-first intake: card upload → quiz → draft)
  builder/                [invitationId]/page.tsx (two-pane editor)
  dashboard/              page.tsx + tabs
  wedding-report/         page.tsx (12-step) · report/page.tsx?s=uuid
  [slug]/                 page.tsx (published guest invite, SSR)
  api/                    (REST routes per doc 03)
```

---

## 3. Marketing landing `/`

```
┌───────────────────────────────────────────────┐
│ NAV  brand◆  Home Templates Builder Report More▾  [Login] │
├───────────────────────────────────────────────┤
│ HERO  · starfield · ॥ shloka ॥                  │
│   "An Invitation They'll Never Forget"          │
│   [Create with AI ▸]   [Browse Templates]       │  ← primary CTA = AI intake
│   "Upload your card, we'll build the rest"      │
├───────────────────────────────────────────────┤
│ TEMPLATES strip  ▤ ▤ ▤ →  [View All]            │
├───────────────────────────────────────────────┤
│ YOUR JOURNEY  01..07 seven sacred chapters      │
├───────────────────────────────────────────────┤
│ WEDDING REPORT promo  (animated sample)  [Try]  │
├───────────────────────────────────────────────┤
│ STATS band  couples · rating · setup time       │
├───────────────────────────────────────────────┤
│ TESTIMONIALS wall (rotating, bilingual)         │
├───────────────────────────────────────────────┤
│ FAQ accordion                                   │
├───────────────────────────────────────────────┤
│ NEWSLETTER + FOOTER (+ AdSense slot on blog only)│
└───────────────────────────────────────────────┘
```
New vs ShaadiOra: hero's primary CTA is the **AI intake** ("Create with AI / Upload your card").

---

## 4. Templates `/templates`

```
Heading + subhead
Filter row:  Faith [All|Hindu|Muslim|Christian|Sikh|Buddhist|Jain|Parsi]
             State [All|Maharashtra|Punjab|Rajasthan|South|Bengali|Gujarati|NE]
Grid of cards:
  ▤ thumbnail · "Live Demo" badge
     Name · region • motif
     blurb
     ₹orig (struck)  ₹now
     [Live Demo]  [Select Design]
... + Premium Custom upsell card [View Perks][Order Now]
```

---

## 5. AI-first intake `/intake` (NEW)

```
STEP 0 — Card upload
┌───────────────────────────────────┐
│  "Start with your invitation card" │
│   ┌───────────────────────────┐    │
│   │  ⬆ drag / 📷 camera / pick │    │
│   └───────────────────────────┘    │
│   [I don't have one yet →]         │
└───────────────────────────────────┘
STEP 1/2 — Extracting… then Confirm chips
   Bride: (Praju)✎   Groom: (Nikhil)✎   Date: (4 Dec 2026)✎
   Venue: (…)✎   "Confirm these?  [Yes, continue]"
STEP 3 — Quick quiz (tap cards; reuse report UX)
   Faith ▢▢▢ · Region ▢▢▢ · Ceremonies ☑☑☐ · Vibe 2×2 · Palette 2×2 · Scale ▢ · Hashtag ___
STEP 4 — "Composing your invitation…" (AI draft + template pick)
STEP 5 — → redirect into /builder with everything pre-filled
```

---

## 6. Builder `/builder/[id]` — two-pane editor

```
┌── TOP BAR ───────────────────────────────────────────────┐
│ ← brand◆ "Builder"  ◔ 60% Keep building  ✓All saved  [▢▣ mobile/desktop]  Help  Home  Dashboard  Clear  Save Draft  Preview │
├───────────────────────┬──────────────────────────────────┤
│ LEFT (section tabs +   │ RIGHT  ▦ live preview in phone     │
│ active form)           │        frame (same renderer as     │
│  1 Essentials          │        published invite)           │
│  2 Invitation          │   [updates instantly on edit]      │
│  3 Events              │                                    │
│  4 Story               │                                    │
│  5 Gallery             │                                    │
│  6 Info                │                                    │
│  7 Gifts               │                                    │
│  8 RSVP                │                                    │
│  9 Calendar            │                                    │
│ 10 Music               │                                    │
│  [Back]      [Next]    │                                    │
├───────────────────────┴──────────────────────────────────┤
│ BOTTOM  Theme: Punjabi Virsa [Change Template] · ₹1,999 one-time · [Unpublish] [Publish] │
└───────────────────────────────────────────────────────────┘
   floating: 🟢 WhatsApp Help (bottom-right)
   guard modal on exit w/ unsynced edits: [Save & Exit][Discard][Keep Editing]
```

### Section form structures (left pane)
- **1 Essentials:** slug field + live "Checking availability…" · Bride/Groom name · Name-order switch · date · city · hashtag. (Premium custom-domain upsell line.)
- **2 Invitation:** (show) toggle · opening blessing · bride father/mother · groom father/mother.
- **3 Events:** event library chips (toggle) → each adds an editable ▤ {icon, name, location+map, description}; AI "suggest ceremonies for [faith/region]".
- **4 Story:** sub-tabs *Personality Tags* (4 questions → auto tags) | *Our Story* (textarea); inline regenerate.
- **5 Gallery:** layout 1/2/4 · upload slots (upload or paste link).
- **6 Info:** drag-reorder editable cards (Dress Code, Parking, Hashtag, Venue) + add card.
- **7 Gifts:** (show) · heading · note · UPI id · registry links.
- **8 RSVP:** enable · mode [WhatsApp|Google Form|Native] · heading · intro · custom questions builder (meal veg/non-veg/Jain, counts).
- **9 Calendar:** enable · per-event add-to-calendar preview.
- **10 Music:** enable soundtrack · track picker; floating widget in preview.

Every AI-populated field shows: `↻ regenerate · shorter · more traditional · more modern`.

---

## 7. Guest invite `/<slug>` (published, SSR)

```
[Soundtrack ♪ floating]      (themed signature interaction on enter)
HERO  names · "The Wedding Of" · date · city · ⏳ countdown · #hashtag · "You are invited"
INVITATION  blessing · With compliments of / Bride's & Groom's families
EVENTS  cards: icon · name · time · location [Directions ▸] [Add to calendar]
STORY   tags + love story
GALLERY 1/2/4 layout
INFO    Things to Know cards
GIFTS   shagun note · UPI/registry
RSVP    [Joyfully Accept] → interactive popup (name, count, meal, message)
WISHES  wishes wall + leave-a-wish
CONTACT "Questions? WhatsApp us" [chat ▸]
FOOTER  brand · (no ads here)
```

---

## 8. Dashboard `/dashboard`

```
Header: "Welcome back, [names]"  [Open Builder]
Tabs: Overview · Guest List · Wishes · Timeline · Payments · Wedding Report · Write a Review

OVERVIEW
  ▤ Total Views  ▤ RSVPs (✓accept/✗decline)  ▤ Attending  ▤ Wishes
  Publish panel: "Live at <brand>/<slug>" [View][Copy][Share]
  Journey: Signed Up → Designed → Customised → Published
  Recent RSVPs (live)  [View all]
  ⏳ Countdown  [View live invite]
  Quick actions: Builder · Take offline · Manage guests · Wishes

GUEST LIST  search(name/phone) · filters[All|Attending|Declined|With msg] · [Export CSV/XLSX]
            table: name · phone · attending count · message · custom answers
WISHES      moderate-able list
TIMELINE    event schedule
PAYMENTS    order records + Premium status
REPORT      saved AI report
REVIEW      rating + text submit
```

---

## 9. Wedding Report `/wedding-report`

```
Intro → 12-step quiz (chapters):
  Pre: names, city(searchable), date
  Q1..Q12 (venue/budget/guests/families/energy/setting/palette/table/ceremony/scale/budget slider/heart pick-2)
"Reveal my Wedding Report" → generating animation
REPORT /report?s=uuid
  Hero: Days Away · Readiness% (persona) · Wedding DNA
  Tabs: Overview·Readiness·DNA·Budget·Vendors·Watch Out For·Roadmap·Hub·Free Quotes·Share
  Budget intelligence: dream vs actual, split donut, per-guest, scores
  Actions: [WhatsApp][PDF][Save to account][Free Quotes]   (vendor lead-gen surface)
```

---

## 10. Component inventory (shared)

```
Primitives:  Button, Toggle/Switch, Chip, Card, Modal, Drawer, Tooltip, Tabs,
             Accordion, Slider, ProgressRing, Countdown, PhoneFrame, Starfield,
             ShlokaBanner, RevealOnScroll, AudioWidget, MapEmbed, ImageUploader,
             DragList, ConfidenceChip (intake), RegenerateControls, EmptyState
Composite:   SectionForm (per builder tab), LivePreview (renders template),
             RsvpPopup, WishesWall, TestimonialWall, TemplateCard, FilterBar,
             StatCard, GuestTable, ReportTab, BudgetDonut, RadarDNA, CardDropzone
Layout:      MarketingShell, BuilderShell (2-pane), DashboardShell, InviteShell
Theming:     ThemeProvider (reads template tokens → CSS vars), BrandProvider (brand.ts)
```

Accessibility: WCAG 2.1 AA targets — focus-visible gold ring, 44px tap targets, color-contrast checked on dark theme, prefers-reduced-motion disables particle/cinematic motion, RSVP/forms fully keyboard-navigable, alt text on gallery.
