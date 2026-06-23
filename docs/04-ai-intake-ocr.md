# 04 — AI-First Intake + Invitation-Card OCR (the headline new feature)

**Goal:** the couple does ~20% of the work, AI does ~80%. The very first step is **upload your existing invitation card image**; we read it, pre-fill what we can, then guide the rest with low-resistance, tap-first suggestions. Everything stays fully editable.

---

## 1. The flow (end to end)

```
STEP 0  Upload card image (or "I don't have one yet" → skip to Step 1)
          │  drag/drop or camera; jpg/png/heic/pdf/webp
          ▼
STEP 1  AI vision extraction  ──► structured fields + per-field confidence
          │  (Claude vision, server-side, async via queue)
          ▼
STEP 2  Quick confirm of extracted basics (names, date, city, venue, families)
          │  pre-filled chips; user taps to accept or fixes inline
          ▼
STEP 3  Quick intake (taps + a few short answers): faith/region, ceremonies,
          vibe, palette, guest scale, hashtag, 1-line love-story prompt
          │  (reuses the polished Wedding-Report quiz UX)
          ▼
STEP 4  AI draft generation: full invitation draft
          │  template recommendation + all section copy (blessing, event
          │  descriptions, story+tags, info cards, gifts note, RSVP intro,
          │  slug suggestion+availability, soundtrack + gallery layout)
          ▼
STEP 5  Review & refine in the two-pane builder (everything pre-filled)
          │  every AI field has inline: regenerate · shorter · more
          │  traditional · more modern.  Nothing locked.
          ▼
STEP 6  Publish (one-time payment per template, or Premium)
```

If the user has no card, Step 0 is skippable and the flow starts at Step 3 (still AI-assisted, just without extraction seeds).

---

## 2. Why vision-LLM (not classic OCR) for the card

Indian wedding cards are **ornate, multilingual (Hindi/Sanskrit/regional + English), decorative fonts, mixed layouts, and full of cultural context** (ceremony names, family salutations, muhurat times). A vision-language model reads the whole card and reasons about it in one pass — no separate OCR + layout + parser pipeline, and it understands that "श्रीमती व श्री ... के सुपुत्र" means *groom's parents*.

- **Primary:** Claude vision (high-resolution document understanding), behind the server-side AI gateway, returning **structured JSON** constrained by our Zod schema.
- **Fallback / cost control:** Google Document AI custom extractor (fine-tunable on ~10 sample cards) can be added later for high volume; the gateway interface makes this swappable.
- **Never client-side.** Image goes to R2; extraction runs server-side in an Inngest job.

---

## 3. Extraction schema (LLM output contract)

The vision call must return **only** this JSON (validated by Zod; low-confidence fields flagged, never silently guessed):

```jsonc
{
  "couple": {
    "brideName":  { "value": "Praju",  "confidence": 0.93 },
    "groomName":  { "value": "Nikhil", "confidence": 0.95 }
  },
  "families": {
    "brideFather": { "value": "...", "confidence": 0.8 },
    "brideMother": { "value": "...", "confidence": 0.7 },
    "groomFather": { "value": "...", "confidence": 0.8 },
    "groomMother": { "value": "...", "confidence": 0.7 }
  },
  "weddingDate": { "value": "2026-12-04", "confidence": 0.9 },  // ISO; null if absent
  "events": [
    { "type": "haldi",  "title": "Haldi",  "datetime": "2026-12-02T10:00", "venue": "...", "confidence": 0.6 },
    { "type": "pheras", "title": "Wedding","datetime": "2026-12-04T20:30", "venue": "...", "confidence": 0.85 }
  ],
  "venues": [ { "name": "...", "address": "...", "city": "Pune", "confidence": 0.7 } ],
  "hashtag":   { "value": "#PraNik", "confidence": 0.5 },
  "blessing":  { "value": "॥ श्री गणेशाय नमः ॥", "confidence": 0.8 },
  "faithHint":  { "value": "hindu", "confidence": 0.7 },     // inferred from salutations/symbols
  "regionHint": { "value": "maharashtra", "confidence": 0.5 },
  "languagesDetected": ["hi","en"],
  "rawText": "full transcription for fallback/debug"
}
```

**Confidence policy:** ≥0.85 → pre-accepted chip (user can still edit); 0.5–0.85 → shown as "please confirm"; <0.5 → left blank with a hint. Dates are normalized; ambiguous dates ask the user. PII (phones if present) is captured but never auto-published.

### Vision prompt (server-side, abridged)
> You are extracting structured data from an Indian wedding invitation card image. Return ONLY JSON matching the provided schema. Read all languages present (Hindi/Sanskrit/regional + English). Infer faith/region only from explicit salutations or symbols and lower the confidence accordingly. Map relations correctly (e.g. "suputra/son of" → groom's parents). Do not invent values; use null and low confidence when unsure. Normalize dates to ISO 8601.

---

## 4. AI draft generation (Step 4) — output contract

After quick intake, a **text LLM** call produces a complete invitation draft validated against the **same invitation Zod schema** the builder uses (doc 02/03). Output:

```jsonc
{
  "recommendedTemplateId": "punjabi-virsa",
  "templateReasoning": "Sikh + Punjab + bold palette + 400-600 guests",
  "content": {
    "openingBlessing": "…",
    "brideName": "…", "groomName": "…", "displayOrder": "BRIDE_GROOM",
    "city": "…", "weddingDate": "…", "hashtag": "#…",
    "brideFather":"…","brideMother":"…","groomFather":"…","groomMother":"…"
  },
  "events": [ { "type":"haldi","title":"Haldi","description":"…(ritually correct for faith/region)","location":"…","calendarEnabled":true } ],
  "story": { "personalityTags":["Campus Sweethearts","Foodie Partners"], "storyText":"…" },
  "infoCards": [ {"heading":"Dress Code","body":"…"}, {"heading":"Parking","body":"…"} ],
  "gifts": { "heading":"Blessings & Shagun", "note":"…" },
  "rsvp": { "heading":"Will you celebrate with us?", "intro":"…", "suggestedQuestions":[{"label":"Meal preference","type":"select","options":["Veg","Non-veg","Jain"]}] },
  "music": { "trackId":"shehnai-classic" },
  "gallery": { "layout": 4 },
  "slugSuggestions": ["prajuwedsnikhil","pranik2026"]   // availability checked server-side
}
```

### Cultural accuracy guardrails
- **Ritual/faith content** is drawn from a **curated knowledge base per faith/region** (`/content/rituals/<faith>.json`) and passed to the model as grounding — the model phrases, it does not invent ceremonies. This prevents wrong/inappropriate ritual descriptions.
- All event descriptions, blessings, and salutations are validated against the selected faith's allowed vocabulary.
- Output is schema-validated; any invalid field is dropped and left for manual entry rather than shown wrong.

---

## 5. Low-resistance suggestion flow for the remaining sections

Principles that minimize friction across the builder (applied per section):

| Technique | Where | Effect |
|---|---|---|
| **Pre-filled, editable defaults** | every section | Couple edits instead of authors from blank. |
| **Tap-first, type-rarely** | faith, region, vibe, palette, ceremonies, scale | 2×2 visual cards & chips (reuse Wedding-Report UX). |
| **Smart event suggestions** | Events | Recommend the typical ceremony set for the chosen faith/region; one tap to add all, then edit. |
| **Inline regenerate controls** | any AI text field | "↻ regenerate · shorter · more traditional · more modern" — `ai.regenerateField`. |
| **Personality tags from 4 taps** | Story | `ai.personalityTags` turns 4 answers into tags + a starter story. |
| **Slug auto-suggest + live check** | Essentials | Proposes `brideweds groom` style; shows availability instantly. |
| **"Looks good, next" momentum** | section nav | Each section opens already-valid, so Next is always available; progress ring climbs fast. |
| **Optional voice / paste** | intake | "Paste your WhatsApp save-the-date" or speak details → parsed into the same extraction schema. |
| **Confidence-aware nudges** | confirm step | Only ask the user about fields the AI was unsure of; accept the rest silently. |
| **Skip & come back** | all | Sections toggle on/off; nothing blocks publish except payment. |

Result: for a couple with a card, the path to a publishable draft is **upload → confirm a few chips → tap through 6 visual questions → review**. Minutes, not an hour.

---

## 6. Failure & edge handling

- Blurry/low-res card → extraction returns low confidence → graceful fallback to manual quick-intake; offer re-upload.
- Card in a script we partially read → use `rawText` + ask user to confirm names/date only.
- Multiple events/venues → all surfaced; user deselects extras.
- No card → start at Step 3; AI still drafts from quiz answers.
- AI job timeout/failure → retry (Inngest) twice, then drop user into builder with whatever was extracted + manual entry. The flow **never dead-ends**.
- Cost guard → extraction + draft consume `ai_credits` (entitlement); Premium gets more; abuse rate-limited.
