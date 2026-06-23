-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NameOrder" AS ENUM ('BRIDE_GROOM', 'GROOM_BRIDE');

-- CreateEnum
CREATE TYPE "RsvpMode" AS ENUM ('WHATSAPP', 'GOOGLEFORM', 'NATIVE');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('PUBLISH_FEE', 'CUSTOM_TEMPLATE', 'ADDON');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('CREATED', 'ACTIVE', 'PAUSED', 'HALTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'EXTRACTED', 'FAILED');

-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('STARTED', 'EXTRACTED', 'DRAFTED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL DEFAULT 'SMS',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "faith" TEXT,
    "region" TEXT,
    "basePrice" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "displayOrder" "NameOrder" NOT NULL DEFAULT 'BRIDE_GROOM',
    "themeSettings" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationContent" (
    "invitationId" TEXT NOT NULL,
    "brideName" TEXT,
    "groomName" TEXT,
    "weddingDate" TIMESTAMP(3),
    "city" TEXT,
    "hashtag" TEXT,
    "openingBlessing" TEXT,
    "brideFather" TEXT,
    "brideMother" TEXT,
    "groomFather" TEXT,
    "groomMother" TEXT,
    "sectionsEnabled" JSONB NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "InvitationContent_pkey" PRIMARY KEY ("invitationId")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "location" TEXT,
    "mapsUrl" TEXT,
    "description" TEXT,
    "datetime" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "calendarEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorySection" (
    "invitationId" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "personalityAnswers" JSONB,
    "generatedTags" TEXT[],
    "storyText" TEXT,

    CONSTRAINT "StorySection_pkey" PRIMARY KEY ("invitationId")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoCard" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InfoCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftDetails" (
    "invitationId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "heading" TEXT,
    "note" TEXT,
    "upiId" TEXT,
    "registryLinks" JSONB,

    CONSTRAINT "GiftDetails_pkey" PRIMARY KEY ("invitationId")
);

-- CreateTable
CREATE TABLE "RsvpConfig" (
    "invitationId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "mode" "RsvpMode" NOT NULL DEFAULT 'NATIVE',
    "heading" TEXT,
    "intro" TEXT,
    "whatsappNumber" TEXT,
    "googleFormUrl" TEXT,
    "customQuestions" JSONB,

    CONSTRAINT "RsvpConfig_pkey" PRIMARY KEY ("invitationId")
);

-- CreateTable
CREATE TABLE "RsvpResponse" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "phone" TEXT,
    "attending" BOOLEAN NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RsvpResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicConfig" (
    "invitationId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "trackId" TEXT,

    CONSTRAINT "MusicConfig_pkey" PRIMARY KEY ("invitationId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "providerRef" TEXT,
    "kind" "PaymentKind" NOT NULL DEFAULT 'PUBLISH_FEE',
    "status" "PaymentState" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "providerRef" TEXT,
    "status" "SubStatus" NOT NULL DEFAULT 'CREATED',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ref" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "shareId" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "generatedJson" JSONB NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardUpload" (
    "invitationId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "OcrStatus" NOT NULL DEFAULT 'UPLOADED',
    "extracted" JSONB,
    "confidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardUpload_pkey" PRIMARY KEY ("invitationId")
);

-- CreateTable
CREATE TABLE "IntakeSession" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT,
    "userId" TEXT,
    "answers" JSONB NOT NULL,
    "aiDraft" JSONB,
    "status" "IntakeStatus" NOT NULL DEFAULT 'STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "OtpChallenge_phone_idx" ON "OtpChallenge"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_slug_key" ON "Invitation"("slug");

-- CreateIndex
CREATE INDEX "Invitation_userId_idx" ON "Invitation"("userId");

-- CreateIndex
CREATE INDEX "Event_invitationId_idx" ON "Event"("invitationId");

-- CreateIndex
CREATE INDEX "GalleryItem_invitationId_idx" ON "GalleryItem"("invitationId");

-- CreateIndex
CREATE INDEX "InfoCard_invitationId_idx" ON "InfoCard"("invitationId");

-- CreateIndex
CREATE INDEX "RsvpResponse_invitationId_idx" ON "RsvpResponse"("invitationId");

-- CreateIndex
CREATE INDEX "Wish_invitationId_idx" ON "Wish"("invitationId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Entitlement_userId_idx" ON "Entitlement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_userId_key_key" ON "Entitlement"("userId", "key");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_invitationId_ts_idx" ON "AnalyticsEvent"("invitationId", "ts");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingReport_shareId_key" ON "WeddingReport"("shareId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationContent" ADD CONSTRAINT "InvitationContent_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySection" ADD CONSTRAINT "StorySection_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoCard" ADD CONSTRAINT "InfoCard_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftDetails" ADD CONSTRAINT "GiftDetails_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpConfig" ADD CONSTRAINT "RsvpConfig_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsvpResponse" ADD CONSTRAINT "RsvpResponse_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wish" ADD CONSTRAINT "Wish_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicConfig" ADD CONSTRAINT "MusicConfig_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingReport" ADD CONSTRAINT "WeddingReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardUpload" ADD CONSTRAINT "CardUpload_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeSession" ADD CONSTRAINT "IntakeSession_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
