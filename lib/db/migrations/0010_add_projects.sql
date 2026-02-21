-- Create Project table
CREATE TABLE IF NOT EXISTS "Project" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "userId" text NOT NULL REFERENCES "User"("id"),
  "createdAt" timestamp NOT NULL,
  "updatedAt" timestamp NOT NULL
);

-- Add projectId to Chat table
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "projectId" uuid REFERENCES "Project"("id");

-- Add projectId to Document table
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "projectId" uuid REFERENCES "Project"("id");

-- Create a "Default Project" for each existing user
INSERT INTO "Project" ("id", "name", "description", "userId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Default Project', 'Default project for chats and artifacts', "id", NOW(), NOW()
FROM "User"
WHERE NOT EXISTS (
  SELECT 1 FROM "Project" WHERE "Project"."userId" = "User"."id" AND "Project"."name" = 'Default Project'
);

-- Assign orphan chats (no projectId) to their user's Default Project
UPDATE "Chat"
SET "projectId" = (
  SELECT "Project"."id" FROM "Project"
  WHERE "Project"."userId" = "Chat"."userId"
    AND "Project"."name" = 'Default Project'
  LIMIT 1
)
WHERE "Chat"."projectId" IS NULL;

-- Assign orphan documents (no projectId) to their user's Default Project
UPDATE "Document"
SET "projectId" = (
  SELECT "Project"."id" FROM "Project"
  WHERE "Project"."userId" = "Document"."userId"
    AND "Project"."name" = 'Default Project'
  LIMIT 1
)
WHERE "Document"."projectId" IS NULL;
