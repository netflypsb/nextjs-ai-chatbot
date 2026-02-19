# Phase 1C: Document Management Tools

## Overview
Create new tools for searching, listing, and reading documents. These tools give the agent fine-grained access to all artifact types (text, code, sheet, image, plan).

## Tools to Create

### 1. `searchDocuments` (`lib/ai/tools/search-documents.ts`)
Search existing documents by title, content, kind, date range, or chat association.

**Input Schema:**
```typescript
z.object({
  query: z.string().optional().describe("Search term to match against title or content"),
  kind: z.enum(artifactKinds).optional().describe("Filter by document kind"),
  limit: z.number().optional().default(10).describe("Max results to return"),
})
```

**Implementation:**
- Add `searchDocuments` query to `lib/db/queries.ts`
- Use `ilike` for title/content search with Drizzle
- Filter by kind if provided
- Return documents ordered by most recent `createdAt`
- Only return documents belonging to current user

### 2. `listDocuments` (`lib/ai/tools/list-documents.ts`)
List user's documents with optional filtering.

**Input Schema:**
```typescript
z.object({
  kind: z.enum(artifactKinds).optional().describe("Filter by document kind"),
  limit: z.number().optional().default(20).describe("Max results"),
})
```

**Implementation:**
- Add `getDocumentsByUserId` query to `lib/db/queries.ts`
- Use `DISTINCT ON (id)` or equivalent to get latest version of each document
- Return id, title, kind, createdAt for each document
- Order by most recently created

### 3. `readDocument` (`lib/ai/tools/read-document.ts`)
Read full document content by ID.

**Input Schema:**
```typescript
z.object({
  id: z.string().describe("The document ID to read"),
})
```

**Implementation:**
- Reuse existing `getDocumentById` query
- Return full content, title, kind, createdAt
- Verify document belongs to current user

## DB Queries to Add (`lib/db/queries.ts`)

### `searchDocumentsByUser`
```typescript
export async function searchDocumentsByUser({
  userId, query, kind, limit
}: {
  userId: string;
  query?: string;
  kind?: string;
  limit: number;
}) {
  // Use subquery to get latest version of each document
  // Filter by userId, optional kind, optional text search
  // Use ilike for case-insensitive search on title and content
}
```

### `getDocumentsByUserId`
```typescript
export async function getDocumentsByUserId({
  userId, kind, limit
}: {
  userId: string;
  kind?: string;
  limit: number;
}) {
  // Get latest version of each document for the user
  // Optional kind filter
  // Return summary info (id, title, kind, createdAt)
}
```

## Registration
All three tools must be registered in:
1. `app/(chat)/api/chat/route.ts` - in the `tools` object
2. `experimental_activeTools` array (for non-reasoning models)
3. `lib/types.ts` - add tool types to `ChatTools`

## Tool Design Principles
- All tools verify `session.user.id` ownership
- Return structured JSON that the agent can reason about
- Keep return values concise (don't return full content in list/search unless needed)
- Error handling: return `{ error: "message" }` instead of throwing
