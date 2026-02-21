# Phase 4.1 Implementation Plan

## Part 1: Completion of Phase 4

### 1A: Review Phase 4 Completeness
**Status: Phase 4 is implemented. Gaps identified below.**
- 4A ✅ Thinking models use tools
- 4B ✅ browse-web lazy init + agent-browser tool
- 4C ✅ Tool selection settings (localStorage + API)
- 4D ✅ Projects system (DB schema, CRUD, API, sidebar switcher)
- 4E ✅ Artifact selector shows project-level artifacts
- 4F ✅ Build passes
- **Gap**: projectId is nullable - chats/artifacts not mandatory in projects
- **Gap**: Document tools not scoped to active project
- **Gap**: No "Default Project" for orphan chats/artifacts

### 1B: Mandatory Project Association
**Priority: HIGH | Complexity: MEDIUM**
- Create `getOrCreateDefaultProject(userId)` query that ensures a "Default Project" exists per user
- Update `saveChat` flow in route.ts to always assign a projectId (from request or default)
- Update `createDocument` tool to always set projectId
- Update migration to assign orphan chats/documents to a default project
- Pass `selectedProjectId` from client to API in chat request schema

**Files:**
- `lib/db/queries.ts` - add `getOrCreateDefaultProject`
- `app/(chat)/api/chat/schema.ts` - add `selectedProjectId`
- `app/(chat)/api/chat/route.ts` - use projectId when saving chat
- `components/chat.tsx` - pass activeProject.id in request
- `lib/ai/tools/create-document.ts` - accept and set projectId

### 1C: Scope Document Tools to Active Project
**Priority: HIGH | Complexity: MEDIUM**
- Add optional `projectId` param to `getDocumentsByUserId` and `searchDocumentsByUser` queries
- When projectId is provided, filter documents by project
- Pass projectId from route.ts into tool factory functions
- Update `listDocuments`, `searchDocuments`, `readDocument`, `createDocument` tools

**Files:**
- `lib/db/queries.ts` - add projectId filter to document queries
- `lib/ai/tools/list-documents.ts` - accept projectId
- `lib/ai/tools/search-documents.ts` - accept projectId
- `lib/ai/tools/create-document.ts` - set projectId on new documents
- `app/(chat)/api/chat/route.ts` - pass projectId to tool factories

### 1D: Update Migration
- Update `0010_add_projects.sql` to include default project creation + orphan assignment SQL

## Part 2: Checkpoint & State Management

### 2A: Fix Stream Resume GET Endpoint
**Priority: HIGH | Complexity: MEDIUM**
- Current GET at `/api/chat/[id]/stream` returns 204 always (stub)
- Implement proper stream lookup: query `Stream` table for latest streamId by chatId
- Use `resumable-stream` to resume existing stream if found
- Return 204 if no active stream

**Files:**
- `app/(chat)/api/chat/[id]/stream/route.ts` - implement proper GET handler
- `lib/db/queries.ts` - add `getLatestStreamIdByChatId` query

### 2B: Checkpoint UI Integration
**Priority: HIGH | Complexity: MEDIUM**
- Checkpoint component already exists at `components/ai-elements/checkpoint.tsx`
- Auto-create checkpoints when context trimming happens (every ~50k tokens)
- Store checkpoint markers in message metadata or as special data parts
- Render checkpoint UI between messages in the chat
- Enable restore-to-checkpoint functionality (trim messages after checkpoint)

**Files:**
- `components/messages.tsx` - render checkpoint markers between messages
- `components/chat.tsx` - add checkpoint state management
- `app/(chat)/api/chat/route.ts` - emit checkpoint data parts when context trimming occurs

### 2C: Build Verification & Report
- Run `next build` to verify all changes compile
- Report completion status across Phase 1-4
