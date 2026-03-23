-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('value_owner', 'aida', 'aqa', 'architect', 'delivery_lead', 'builder');

-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('draft', 'baseline_in_progress', 'ready_for_tg1', 'active');

-- CreateEnum
CREATE TYPE "EpicStatus" AS ENUM ('draft', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "StoryType" AS ENUM ('outcome_delivery', 'governance', 'enablement');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('draft', 'definition_blocked', 'ready_for_handoff', 'in_progress');

-- CreateEnum
CREATE TYPE "TollgateEntityType" AS ENUM ('outcome', 'story');

-- CreateEnum
CREATE TYPE "TollgateType" AS ENUM ('tg1_baseline', 'story_readiness');

-- CreateEnum
CREATE TYPE "TollgateStatus" AS ENUM ('blocked', 'ready', 'approved');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('organization', 'outcome', 'epic', 'story', 'tollgate');

-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('demo_seeded', 'outcome_created', 'outcome_updated', 'story_created', 'story_updated', 'tollgate_recorded');

-- CreateEnum
CREATE TYPE "RiskProfile" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "AiAccelerationLevel" AS ENUM ('level_2');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemStatement" TEXT,
    "outcomeStatement" TEXT,
    "baselineDefinition" TEXT,
    "baselineSource" TEXT,
    "timeframe" TEXT,
    "valueOwnerId" TEXT,
    "riskProfile" "RiskProfile" NOT NULL DEFAULT 'medium',
    "aiAccelerationLevel" "AiAccelerationLevel" NOT NULL DEFAULT 'level_2',
    "status" "OutcomeStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Epic" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "EpicStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "epicId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storyType" "StoryType" NOT NULL,
    "valueIntent" TEXT NOT NULL,
    "acceptanceCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiUsageScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiAccelerationLevel" "AiAccelerationLevel" NOT NULL DEFAULT 'level_2',
    "testDefinition" TEXT,
    "definitionOfDone" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "StoryStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tollgate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "entityType" "TollgateEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "tollgateType" "TollgateType" NOT NULL,
    "status" "TollgateStatus" NOT NULL DEFAULT 'blocked',
    "blockers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approverRoles" "MembershipRole"[] DEFAULT ARRAY[]::"MembershipRole"[],
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tollgate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" "ActivityEventType" NOT NULL,
    "actorId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_organizationId_userId_key" ON "Membership"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Outcome_organizationId_key_key" ON "Outcome"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Epic_organizationId_key_key" ON "Epic"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Story_organizationId_key_key" ON "Story"("organizationId", "key");

-- CreateIndex
CREATE INDEX "Tollgate_organizationId_entityType_entityId_idx" ON "Tollgate"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Tollgate_organizationId_entityType_entityId_tollgateType_key" ON "Tollgate"("organizationId", "entityType", "entityId", "tollgateType");

-- CreateIndex
CREATE INDEX "ActivityEvent_organizationId_entityType_entityId_idx" ON "ActivityEvent"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityEvent_organizationId_createdAt_idx" ON "ActivityEvent"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_valueOwnerId_fkey" FOREIGN KEY ("valueOwnerId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tollgate" ADD CONSTRAINT "Tollgate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tollgate" ADD CONSTRAINT "Tollgate_decidedBy_fkey" FOREIGN KEY ("decidedBy") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

