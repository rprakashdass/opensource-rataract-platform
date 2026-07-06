const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Replace Initiative with Project
schema = schema.replace(/initiatives\s+Initiative\[\]/, 'projects        Project[]');
schema = schema.replace(/galleryItems\s+GalleryItem\[\]/, 'media           Media[]');

// Add enums
const newEnums = `
// ============================================================================
// NEW ENUMS FOR PROJECTS AND EVENTS
// ============================================================================

enum ProjectCategory {
  COMMUNITY_SERVICE
  PROFESSIONAL_DEVELOPMENT
  CLUB_SERVICE
  INTERNATIONAL_SERVICE
  FUNDRAISER
  OTHER
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  COMPLETED
  ON_HOLD
  CANCELLED
}

enum Visibility {
  PUBLIC
  MEMBERS_ONLY
  BOARD_ONLY
}

enum EventType {
  COMMUNITY_SERVICE
  PROFESSIONAL_DEVELOPMENT
  CLUB_SERVICE
  INTERNATIONAL_SERVICE
  FUNDRAISER
  MEETING
  FELLOWSHIP
}

enum EventStatus {
  DRAFT
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum RegistrationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
  WAITLISTED
}

enum AttendanceMethod {
  MANUAL
  QR_CODE
  IMPORT
}
`;

// Insert after CORE ENTITIES block
schema = schema.replace(/\/\/ ============================================================================\n\/\/ AUTHENTICATION & USERS/, newEnums + '\n// ============================================================================\n// AUTHENTICATION & USERS');

// Role Enum
schema = schema.replace(/enum Role \{[\s\S]*?\}/, `enum Role {
  ADMIN
  CLUB_ADMIN
  PRESIDENT
  SECRETARY
  TREASURER
  BOARD_MEMBER
  MEMBER
  GUEST
  FINANCE_ADMIN
  FINANCE_VIEWER
}`);

// Replace Initiative model
const projectModel = `
model Project {
  id            String          @id @default(cuid())
  clubId        String
  club          Club            @relation(fields: [clubId], references: [id], onDelete: Cascade)

  title         String
  slug          String          @unique
  description   String          @db.Text
  category      ProjectCategory @default(COMMUNITY_SERVICE)
  status        ProjectStatus   @default(ACTIVE)
  startDate     DateTime
  endDate       DateTime?
  coverImage    String?
  chairPersonId String?
  visibility    Visibility      @default(PUBLIC)
  impactMetrics Json?

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  events        Event[]
  media         Media[]
  transactions  Transaction[]
  budget        Budget?

  @@unique([clubId, slug])
}
`;

schema = schema.replace(/enum InitiativeFrequency \{[\s\S]*?model Initiative \{[\s\S]*?@@unique\(\[clubId, slug\]\)\n\}/, projectModel);

// Update Event model
const eventModel = `
model Event {
  id     String @id @default(cuid())
  clubId String
  club   Club   @relation(fields: [clubId], references: [id], onDelete: Cascade)

  projectId    String?
  project      Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  title       String
  slug        String
  description String? @db.Text
  type        EventType @default(MEETING)

  location  String?
  latitude  Float?
  longitude Float?

  startDate DateTime // Keeping startDate instead of startTime for backward compat with some UI parts, or change to startTime? User requested startTime and endTime, but let's stick to startDate/endDate for less UI breakage if possible. Wait, let's use what user asked: startTime and endTime.
  startTime DateTime
  endTime   DateTime

  imageUrl     String?
  thumbnailUrl String?

  capacity             Int?
  registrationRequired Boolean @default(false)
  registeredCount      Int  @default(0)

  status EventStatus @default(UPCOMING)

  calendarEventId String?

  /// Rich metadata
  tags     String[]
  category String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  registrations Registration[]
  attendance    Attendance[]
  minutes       EventMinutes?
  media         Media[]
  transactions  Transaction[]

  @@unique([clubId, slug])
}
`;

schema = schema.replace(/model Event \{[\s\S]*?@@unique\(\[clubId, slug\]\)\n\}/, eventModel);

// Replace EventAttendee with Registration
const registrationModel = `
model Registration {
  id      String @id @default(cuid())
  eventId String
  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)

  memberId String
  member   Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  registeredAt DateTime  @default(now())
  status       RegistrationStatus @default(REGISTERED)

  createdAt DateTime @default(now())

  @@unique([eventId, memberId])
}

model Attendance {
  id      String @id @default(cuid())
  eventId String
  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)

  memberId String
  member   Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  checkedInAt DateTime  @default(now())
  method      AttendanceMethod @default(MANUAL)

  @@unique([eventId, memberId])
}

model EventMinutes {
  id          String   @id @default(cuid())
  eventId     String   @unique
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  content     String   @db.Text
  createdBy   String?
  approvedBy  String?
  publishedAt DateTime?
  createdAt   DateTime @default(now())
}
`;
schema = schema.replace(/model EventAttendee \{[\s\S]*?@@unique\(\[eventId, memberId\]\)\n\}/, registrationModel);


// Replace GalleryItem with Media
const mediaModel = `
model Media {
  id         String   @id @default(cuid())
  clubId     String
  club       Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  eventId    String?
  event      Event?   @relation(fields: [eventId], references: [id], onDelete: SetNull)
  projectId  String?
  project    Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  
  url        String
  caption    String?
  uploadedBy String?
  createdAt  DateTime @default(now())
}
`;
schema = schema.replace(/model GalleryItem \{[\s\S]*?updatedAt DateTime @updatedAt\n\}/, mediaModel);

// Finance updates
const budgetModel = `
model FinanceCategory {
  id   String @id @default(cuid())
  name String
  type TransactionType
}

model Budget {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(10,2)
  projectId String?  @unique
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
  eventId   String?
  createdAt DateTime @default(now())
}
`;

schema = schema.replace(/\/\/ FINANCE & TREASURY\n\/\/ ============================================================================/, '// FINANCE & TREASURY\n// ============================================================================\n' + budgetModel);

// Update Transaction
const transactionModel = `
model Transaction {
  id     String @id @default(cuid())
  clubId String
  club   Club   @relation(fields: [clubId], references: [id], onDelete: Cascade)

  title       String
  description String?
  amount      Decimal             @db.Decimal(10,2)
  type        TransactionType
  status      TransactionStatus   @default(PENDING)

  date        DateTime            @default(now())

  categoryId  String?
  category    FinanceCategory?    @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  projectId   String?
  project     Project?            @relation(fields: [projectId], references: [id], onDelete: SetNull)

  eventId     String?
  event       Event?              @relation(fields: [eventId], references: [id], onDelete: SetNull)

  receiptUrl  String?

  createdBy   String?
  approvedBy  String?

  /// Association with members or users
  userId String?
  user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

  memberId String?
  member   Member? @relation(fields: [memberId], references: [id], onDelete: SetNull)

  /// Association with Payment Request
  paymentRequestId String?
  paymentRequest   PaymentRequest? @relation(fields: [paymentRequestId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clubId])
  @@index([memberId])
  @@index([eventId])
  @@index([projectId])
  @@index([paymentRequestId])
}
`;
schema = schema.replace(/model Transaction \{[\s\S]*?@@index\(\[paymentRequestId\]\)\n\}/, transactionModel);

// Audit log update
const auditLogModel = `
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  action     String // "create", "update", "delete", etc.
  entity     String // "member", "event", "project", etc.
  entityId   String?

  changes    Json? // Track what changed
  ipAddress  String?
  userAgent  String?

  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
`;
schema = schema.replace(/model AuditLog \{[\s\S]*?@@index\(\[createdAt\]\)\n\}/, auditLogModel);

// Remove AnnouncementAttendance since we created Attendance
schema = schema.replace(/model AnnouncementAttendance \{[\s\S]*?@@unique\(\[announcementId, memberId\]\)\n\}/, '');

// Clean up old relations in Member
schema = schema.replace(/eventAttendees        EventAttendee\[\]/, 'registrations         Registration[]');
schema = schema.replace(/announcementAttendees AnnouncementAttendance\[\]/, 'attendance            Attendance[]');

// Write the updated schema back
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully');
