-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('COMMUNITY_SERVICE', 'PROFESSIONAL_DEVELOPMENT', 'CLUB_SERVICE', 'INTERNATIONAL_SERVICE', 'FUNDRAISER', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('CHAIR', 'CO_CHAIR', 'ORGANIZER', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('CHAIR', 'CO_CHAIR', 'ORGANIZER', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'INTERNAL', 'MEMBERS_ONLY', 'BOARD_ONLY');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('COMMUNITY_SERVICE', 'PROFESSIONAL_DEVELOPMENT', 'CLUB_SERVICE', 'INTERNATIONAL_SERVICE', 'FUNDRAISER', 'MEETING', 'FELLOWSHIP');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'PLANNING');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED', 'WAITLISTED');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'REVIEWING', 'CONTACTED', 'CONVERTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('MANUAL', 'QR_CODE', 'IMPORT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO_LINK', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "MediaUsage" AS ENUM ('COVER', 'BANNER', 'POSTER', 'GALLERY', 'ATTACHMENT', 'DOCUMENT_REPORT', 'DOCUMENT_MINUTES');

-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('EVENT_PUBLISHED', 'EVENT_UPDATED', 'EVENT_REMINDER', 'PROJECT_PUBLISHED', 'ANNOUNCEMENT_PUBLISHED', 'ATTENDANCE_CONFIRMED');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('SUPER_ADMIN', 'CLUB_ADMIN', 'FINANCE_ADMIN', 'FINANCE_VIEWER', 'EVENTS_ADMIN', 'CONTENT_ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('DUES', 'EVENT_FEE', 'DONATION', 'SPONSORSHIP', 'CATERING', 'LOGISTICS', 'MARKETING', 'OTHER');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'BOARD_MEETING', 'CLUB_MEETING', 'EVENT_UPDATE', 'FINANCE_NOTICE', 'IMPORTANT_NOTICE');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationTrigger" AS ENUM ('EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_REMINDER', 'MEETING_CREATED', 'MINUTES_PUBLISHED', 'ATTENDANCE_CONFIRMED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('EVENT_IMAGE', 'PROJECT_IMAGE', 'AGENDA', 'MINUTES', 'FINANCE_RECEIPT', 'REPORT', 'CERTIFICATE', 'CLUB_ASSET');

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "district" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "tenureYear" TEXT NOT NULL DEFAULT '2026-27',
    "foundedYear" INTEGER,
    "presidentMessage" TEXT,
    "meetingDay" TEXT,
    "meetingTime" TEXT,
    "meetingVenue" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "description" TEXT,
    "missionStatement" TEXT,
    "visionStatement" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#EC4899',
    "socialMedia" JSONB,
    "upiId" TEXT,
    "paymentQr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteSettings" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "heroHeadline" TEXT,
    "heroSubtitle" TEXT,
    "heroCTA" TEXT,
    "heroImages" JSONB,
    "aboutStory" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "enableHero" BOOLEAN NOT NULL DEFAULT true,
    "enableImpact" BOOLEAN NOT NULL DEFAULT true,
    "enableFeaturedProjects" BOOLEAN NOT NULL DEFAULT true,
    "enableEvents" BOOLEAN NOT NULL DEFAULT true,
    "enableGallery" BOOLEAN NOT NULL DEFAULT true,
    "enableLeadership" BOOLEAN NOT NULL DEFAULT true,
    "enableAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" "EmailTemplateType" NOT NULL,
    "subjectTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledCommunication" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipientRules" JSONB NOT NULL,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'PENDING',
    "eventId" TEXT,
    "projectId" TEXT,
    "announcementId" TEXT,
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "roles" "SystemRole"[] DEFAULT ARRAY['MEMBER']::"SystemRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clubId" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "email" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "profession" TEXT,
    "companyName" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "emergencyContact" TEXT,
    "skills" TEXT[],
    "membershipStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "bloodGroup" TEXT,
    "canDonate" BOOLEAN NOT NULL DEFAULT false,
    "lastDonation" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showOnWebsite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardMember" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "financialYearId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'VOLUNTEER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMember" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "EventRole" NOT NULL DEFAULT 'VOLUNTEER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL DEFAULT 'COMMUNITY_SERVICE',
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "driveFolderId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "impactSummary" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "impactMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "projectId" TEXT,
    "driveFolderId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'MEETING',
    "location" TEXT,
    "meetingLink" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "capacity" INTEGER,
    "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "registeredCount" INTEGER NOT NULL DEFAULT 0,
    "bannerMediaId" TEXT,
    "posterMediaId" TEXT,
    "volunteerHours" INTEGER,
    "fundsRaised" DOUBLE PRECISION,
    "impactMetrics" JSONB,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "isAttendanceLocked" BOOLEAN NOT NULL DEFAULT false,
    "calendarEventId" TEXT,
    "tags" TEXT[],
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipInquiry" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "interestMessage" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "AttendanceMethod" NOT NULL DEFAULT 'MANUAL',
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "volunteerHours" DECIMAL(10,2),
    "markedById" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "checkInCodeHash" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMinutes" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMinutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventId" TEXT,
    "projectId" TEXT,
    "coverMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "eventId" TEXT,
    "projectId" TEXT,
    "albumId" TEXT,
    "driveFileId" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "usage" "MediaUsage" NOT NULL DEFAULT 'GALLERY',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,

    CONSTRAINT "FinanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(10,2) NOT NULL,
    "projectId" TEXT,
    "eventId" TEXT,
    "financialYearId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "TransactionCategory" NOT NULL DEFAULT 'OTHER',
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dismissedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRequestAssignee" (
    "id" TEXT NOT NULL,
    "paymentRequestId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "PaymentRequestAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT,
    "projectId" TEXT,
    "eventId" TEXT,
    "receiptUrl" TEXT,
    "createdBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "referenceNumber" TEXT,
    "accountId" TEXT,
    "financialYearId" TEXT,
    "contributorId" TEXT,
    "userId" TEXT,
    "memberId" TEXT,
    "paymentRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "meetingLink" TEXT,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "agendaContent" TEXT,
    "minutesContent" TEXT,
    "agendaUrl" TEXT,
    "minutesUrl" TEXT,
    "attachments" TEXT[],
    "calendarEventId" TEXT,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "sendInvite" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "deliveryStatus" TEXT,
    "recipientsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "year" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "trigger" "NotificationTrigger" NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipientsCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "eventId" TEXT,
    "announcementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "uploadedBy" TEXT,
    "linkedEntityType" TEXT,
    "linkedEntityId" TEXT,
    "clubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialYear" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "openingBalance" DECIMAL(10,2) NOT NULL,
    "closingBalance" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financialYearId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "type" TEXT NOT NULL,
    "totalContributed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteSettings_clubId_key" ON "WebsiteSettings"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_clubId_type_key" ON "EmailTemplate"("clubId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_memberId_key" ON "BoardMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_clubId_memberId_position_financialYearId_key" ON "BoardMember"("clubId", "memberId", "position", "financialYearId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_memberId_key" ON "ProjectMember"("projectId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_eventId_memberId_key" ON "EventMember"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_clubId_slug_key" ON "Project"("clubId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_clubId_slug_key" ON "Event"("clubId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_eventId_memberId_key" ON "Registration"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_eventId_memberId_key" ON "Attendance"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_tokenHash_key" ON "AttendanceSession"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "EventMinutes_eventId_key" ON "EventMinutes"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_clubId_key" ON "Page"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_projectId_key" ON "Budget"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_eventId_key" ON "Budget"("eventId");

-- CreateIndex
CREATE INDEX "PaymentRequest_clubId_idx" ON "PaymentRequest"("clubId");

-- CreateIndex
CREATE INDEX "PaymentRequestAssignee_memberId_idx" ON "PaymentRequestAssignee"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequestAssignee_paymentRequestId_memberId_key" ON "PaymentRequestAssignee"("paymentRequestId", "memberId");

-- CreateIndex
CREATE INDEX "Transaction_clubId_idx" ON "Transaction"("clubId");

-- CreateIndex
CREATE INDEX "Transaction_memberId_idx" ON "Transaction"("memberId");

-- CreateIndex
CREATE INDEX "Transaction_eventId_idx" ON "Transaction"("eventId");

-- CreateIndex
CREATE INDEX "Transaction_projectId_idx" ON "Transaction"("projectId");

-- CreateIndex
CREATE INDEX "Transaction_paymentRequestId_idx" ON "Transaction"("paymentRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialYear_name_key" ON "FinancialYear"("name");

-- AddForeignKey
ALTER TABLE "WebsiteSettings" ADD CONSTRAINT "WebsiteSettings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledCommunication" ADD CONSTRAINT "ScheduledCommunication_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipInquiry" ADD CONSTRAINT "MembershipInquiry_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMinutes" ADD CONSTRAINT "EventMinutes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequestAssignee" ADD CONSTRAINT "PaymentRequestAssignee_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "PaymentRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequestAssignee" ADD CONSTRAINT "PaymentRequestAssignee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentRequestId_fkey" FOREIGN KEY ("paymentRequestId") REFERENCES "PaymentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialYear" ADD CONSTRAINT "FinancialYear_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
