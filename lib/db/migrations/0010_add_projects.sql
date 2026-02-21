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
