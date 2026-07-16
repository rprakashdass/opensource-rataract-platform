-- Re-associate all records to the default club to complete the transition to a single-club architecture
DO $$
DECLARE
    default_club_id TEXT;
BEGIN
    -- Get the ID of the club that actually has data (roles/members)
    SELECT id INTO default_club_id FROM "Club" ORDER BY (SELECT COUNT(*) FROM "ClubRole" WHERE "clubId" = "Club".id) DESC LIMIT 1;
    
    IF default_club_id IS NOT NULL THEN
        -- Delete duplicate unique settings/pages for non-default clubs to prevent constraint violations
        DELETE FROM "WebsiteSettings" WHERE "clubId" <> default_club_id;
        DELETE FROM "Page" WHERE "clubId" <> default_club_id;

        UPDATE "Member" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "BoardMember" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "ClubRole" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Portfolio" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "FinancialYear" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Account" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Transaction" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Budget" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Transfer" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Sponsor" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "WebsiteSettings" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "MembershipInquiry" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Announcement" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Initiative" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Project" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;
        UPDATE "Event" SET "clubId" = default_club_id WHERE "clubId" <> default_club_id OR "clubId" IS NULL;

        -- Delete the other clubs to leave exactly one club in the database
        DELETE FROM "Club" WHERE id <> default_club_id;
    END IF;
END $$;
