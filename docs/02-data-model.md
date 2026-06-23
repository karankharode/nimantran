# 02 — Data Model

PostgreSQL via Prisma. This is a **contract** for Claude Code. The full schema also ships in `scaffold/prisma/schema.prisma`.

---

## 1. Entity overview

```
User ─┬─< Invitation ─┬─< Event
      │               ├── InvitationContent (1:1, JSON + typed fields)
      │               ├── StorySection (1:1)
      │               ├─< GalleryItem
      │               ├─< InfoCard
      │               ├── GiftDetails (1:1)
      │               ├── RsvpConfig (1:1) ─< RsvpResponse
      │               ├─< Wish
      │               ├── MusicConfig (1:1)
      │               ├─< Payment
      │               ├─< AnalyticsEvent
      │               └── CardUpload (1:1, the new OCR source)  ─< IntakeSession
      ├─< WeddingReport
      ├── Subscription (0:1, Premium)
      └─< Entitlement (derived/cached)

Template (catalog, code-defined; DB row for pricing/availability)
```

Design notes:
- **InvitationContent** holds the normalized invitation document as **both** typed columns (for the hot fields the renderer always needs) **and** a `data Json` blob validated by Zod (for flexible/template-specific fields). This balances query-ability with template extensibility.
- **Entitlement** is a cached projection of `Payment` + `Subscription`; the resolver can also compute it on the fly. Persisted for fast guest/builder checks.
- `slug` uniqueness + availability is enforced at DB (unique index) and pre-checked via Redis.

---

## 2. Prisma schema (core)

```prisma
// ---------- Identity ----------
model User {
  id           String   @id @default(cuid())
  phone        String   @unique            // E.164, e.g. +917...725
  name         String?
  email        String?  @unique
  locale       String   @default("en-IN")
  createdAt    DateTime @default(now())
  invitations  Invitation[]
  reports      WeddingReport[]
  subscription Subscription?
  entitlements Entitlement[]
}

model OtpChallenge {
  id        String   @id @default(cuid())
  phone     String
  codeHash  String
  channel   OtpChannel @default(SMS)   // SMS | WHATSAPP
  attempts  Int      @default(0)
  expiresAt DateTime
  consumedAt DateTime?
  createdAt DateTime @default(now())
  @@index([phone])
}
enum OtpChannel { SMS WHATSAPP }

// ---------- Templates (catalog) ----------
// Template definitions live in code (doc 06). This table holds price/availability
// so pricing/lineup can change without redeploy.
model Template {
  id          String  @id                  // e.g. "punjabi-virsa"
  name        String
  faith       String?                      // hindu|muslim|christian|sikh|buddhist|jain|parsi|all
  region      String?                      // maharashtra|punjab|... |all
  basePrice   Int                          // INR, struck-through "original"
  price       Int                          // current INR
  isCustom    Boolean @default(false)
  isActive    Boolean @default(true)
  sortOrder   Int     @default(0)
  invitations Invitation[]
}

// ---------- Invitation (aggregate root) ----------
model Invitation {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  slug          String   @unique
  templateId    String
  template      Template @relation(fields: [templateId], references: [id])
  status        InvitationStatus @default(DRAFT)   // DRAFT | PUBLISHED | OFFLINE
  paymentStatus PaymentStatus    @default(UNPAID)  // UNPAID | PAID | REFUNDED
  displayOrder  NameOrder        @default(BRIDE_GROOM)
  themeSettings Json?            // per-invite overrides on top of template theme
  revision      Int      @default(0)          // bumped on each cloud save (sync guard)
  publishedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  content    InvitationContent?
  events     Event[]
  story      StorySection?
  gallery    GalleryItem[]
  infoCards  InfoCard[]
  gifts      GiftDetails?
  rsvpConfig RsvpConfig?
  rsvps      RsvpResponse[]
  wishes     Wish[]
  music      MusicConfig?
  payments   Payment[]
  views      AnalyticsEvent[]
  cardUpload CardUpload?
  intake     IntakeSession[]
  @@index([userId])
}
enum InvitationStatus { DRAFT PUBLISHED OFFLINE }
enum PaymentStatus    { UNPAID PAID REFUNDED }
enum NameOrder        { BRIDE_GROOM GROOM_BRIDE }

model InvitationContent {
  invitationId String  @id
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  brideName    String?
  groomName    String?
  weddingDate  DateTime?
  city         String?
  hashtag      String?
  openingBlessing String?
  brideFather  String?
  brideMother  String?
  groomFather  String?
  groomMother  String?
  sectionsEnabled Json   // { invitation:true, events:true, story:false, ... }
  data         Json      // flexible/template-specific fields, Zod-validated
}

// ---------- Sections ----------
model Event {
  id           String  @id @default(cuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  type         String   // mehendi|haldi|sagan|cocktail|sangeet|tilak|engagement|baraat|shaadi|pheras|reception|vidaai|custom
  title        String
  icon         String?
  location     String?
  mapsUrl      String?
  description  String?
  datetime     DateTime?
  order        Int      @default(0)
  calendarEnabled Boolean @default(true)
  enabled      Boolean  @default(true)
  @@index([invitationId])
}

model StorySection {
  invitationId      String  @id
  invitation        Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  included          Boolean @default(true)
  personalityAnswers Json?  // the 4 Q&A
  generatedTags     String[]
  storyText         String?
}

model GalleryItem {
  id           String @id @default(cuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  url          String
  slot         Int
  order        Int   @default(0)
  @@index([invitationId])
}
// gallery layout (1|2|4) stored on InvitationContent.data.galleryLayout

model InfoCard {
  id           String @id @default(cuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  heading      String
  body         String?
  order        Int    @default(0)
  enabled      Boolean @default(true)
  @@index([invitationId])
}

model GiftDetails {
  invitationId String @id
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  enabled      Boolean @default(false)
  heading      String?
  note         String?
  upiId        String?
  registryLinks Json?   // [{label,url}]
}

model RsvpConfig {
  invitationId String @id
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  enabled      Boolean @default(true)
  mode         RsvpMode @default(NATIVE)  // WHATSAPP | GOOGLEFORM | NATIVE
  heading      String?
  intro        String?
  whatsappNumber String?
  googleFormUrl  String?
  customQuestions Json?  // [{id,label,type:'select|text|number',options?,required}]
  responses    RsvpResponse[]
}
enum RsvpMode { WHATSAPP GOOGLEFORM NATIVE }

model RsvpResponse {
  id           String @id @default(cuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guestName    String
  phone        String?
  attending    Boolean
  guestCount   Int     @default(1)
  message      String?
  answers      Json?   // answers to customQuestions
  createdAt    DateTime @default(now())
  @@index([invitationId])
}

model Wish {
  id           String @id @default(cuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  name         String
  message      String
  approved     Boolean @default(true)   // optional moderation
  createdAt    DateTime @default(now())
  @@index([invitationId])
}

model MusicConfig {
  invitationId String @id
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  enabled      Boolean @default(false)
  trackId      String?
}

// ---------- Payments & entitlements ----------
model Payment {
  id           String @id @default(cuid())
  invitationId String?
  invitation   Invitation? @relation(fields: [invitationId], references: [id])
  userId       String
  amount       Int                 // INR paise
  currency     String  @default("INR")
  provider     String  @default("razorpay")
  providerRef  String?             // razorpay_order_id / payment_id
  kind         PaymentKind @default(PUBLISH_FEE)
  status       PaymentStatus2 @default(CREATED)
  createdAt    DateTime @default(now())
  @@index([userId])
}
enum PaymentKind   { PUBLISH_FEE CUSTOM_TEMPLATE ADDON }
enum PaymentStatus2 { CREATED AUTHORIZED CAPTURED FAILED REFUNDED }

model Subscription {
  id            String @id @default(cuid())
  userId        String @unique
  user          User   @relation(fields: [userId], references: [id])
  plan          String              // "premium_monthly" | "premium_yearly"
  provider      String @default("razorpay")
  providerRef   String?             // razorpay_subscription_id
  status        SubStatus @default(CREATED) // CREATED|ACTIVE|PAUSED|HALTED|CANCELLED|EXPIRED
  currentPeriodEnd DateTime?
  createdAt     DateTime @default(now())
}
enum SubStatus { CREATED ACTIVE PAUSED HALTED CANCELLED EXPIRED }

// Cached projection of payments + subscription → fast checks
model Entitlement {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  key       String              // "publish:<invitationId>" | "premium" | "remove_ads" | "custom_domain" | "ai_credits"
  value     Json?               // e.g. {credits: 20}
  expiresAt DateTime?
  @@unique([userId, key])
  @@index([userId])
}

// ---------- Analytics ----------
model AnalyticsEvent {
  id           String @id @default(cuid())
  invitationId String
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  type         String   // view | visit | rsvp_open | share_click
  ref          String?  // referrer
  ts           DateTime @default(now())
  @@index([invitationId, ts])
}

// ---------- AI Wedding Report ----------
model WeddingReport {
  id           String @id @default(cuid())
  userId       String?
  user         User?  @relation(fields: [userId], references: [id])
  shareId      String @unique @default(uuid())   // /wedding-report/report?s=<uuid>
  inputs       Json    // the 12 answers + pre-form
  generatedJson Json   // full report (metrics, DNA, budget, roadmap...)
  status       ReportStatus @default(PENDING)
  createdAt    DateTime @default(now())
}
enum ReportStatus { PENDING GENERATING READY FAILED }

// ---------- NEW: invitation-card OCR intake ----------
model CardUpload {
  invitationId String @id
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  fileUrl      String              // R2 object (original)
  status       OcrStatus @default(UPLOADED) // UPLOADED|PROCESSING|EXTRACTED|FAILED
  extracted    Json?               // raw structured extraction (see doc 04)
  confidence   Json?               // per-field confidence
  createdAt    DateTime @default(now())
}
enum OcrStatus { UPLOADED PROCESSING EXTRACTED FAILED }

model IntakeSession {
  id           String @id @default(cuid())
  invitationId String?
  invitation   Invitation? @relation(fields: [invitationId], references: [id])
  userId       String?
  answers      Json    // conversational/quick-intake answers
  aiDraft      Json?   // the full AI-generated invitation draft (pre-confirm)
  status       IntakeStatus @default(STARTED) // STARTED|EXTRACTED|DRAFTED|CONFIRMED
  createdAt    DateTime @default(now())
}
enum IntakeStatus { STARTED EXTRACTED DRAFTED CONFIRMED }
```

---

## 3. Indexing, integrity & privacy

- **Indexes:** `Invitation.slug` (unique), `RsvpResponse.invitationId`, `AnalyticsEvent(invitationId, ts)`, `User.phone` (unique), `Entitlement(userId,key)` unique.
- **Cascade deletes** from `Invitation` to all child sections (set above).
- **PII:** guest phone numbers and couple phones are PII → encrypt at rest (Postgres + app-level for phone), restrict CSV export to the owner, never expose guest phones on the public invite.
- **Soft-delete option:** add `deletedAt` to `Invitation`/`User` if account-deletion + restore is required (GDPR/DPDP-style). Recommended for Phase 4.
- **Revision-based sync guard:** builder sends the `revision` it loaded; server rejects stale writes → triggers the "Unsaved Cloud Changes" modal.
