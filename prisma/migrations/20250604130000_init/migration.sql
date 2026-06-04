-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AGENT', 'OFFICE', 'ADMIN');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('BRANDING', 'MAINTENANCE', 'CLEANING', 'TECHNICIAN', 'GENERAL');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('DAMAGED_BRANDING', 'RUST', 'DAMAGED_PANEL', 'MISSING_PRICE_LABEL', 'MISSING_PRODUCT_LABEL', 'DIRTY', 'BROKEN_GLASS', 'SCREEN_OFF', 'DOOR_OPEN', 'VANDALISM', 'GENERAL_ISSUE');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImageAngle" AS ENUM ('FRONT', 'PANEL', 'SIDE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DONE');

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResolutionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team" "TeamType" NOT NULL,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResolutionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueTemplateMapping" (
    "id" TEXT NOT NULL,
    "issueType" "IssueType" NOT NULL,
    "location" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "IssueTemplateMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "aiRawOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "angle" "ImageAngle" NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkTask" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "issueType" "IssueType" NOT NULL,
    "location" TEXT,
    "templateId" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "officeNote" TEXT,
    "decidedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IssueTemplateMapping_issueType_location_key" ON "IssueTemplateMapping"("issueType", "location");

-- AddForeignKey
ALTER TABLE "IssueTemplateMapping" ADD CONSTRAINT "IssueTemplateMapping_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResolutionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTask" ADD CONSTRAINT "WorkTask_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTask" ADD CONSTRAINT "WorkTask_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTask" ADD CONSTRAINT "WorkTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResolutionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
