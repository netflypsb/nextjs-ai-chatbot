Solaris Web - Phase 1 Implementation
Tasks
1. Branding & UI
 Replace "Deploy with Vercel" button in 
chat-header.tsx
 with "Solaris Web" branding
 Update metadata in 
app/layout.tsx
 (title, description)
2. Auth: Replace next-auth with Clerk
 Install @clerk/nextjs
 Remove next-auth and bcrypt-ts dependencies
 Create Clerk middleware for route protection
 Replace SessionProvider with ClerkProvider in 
app/layout.tsx
 Replace login/register pages with Clerk sign-in/sign-up
 Remove guest login provider
 Update 
auth()
 calls across codebase to use Clerk 
auth()
 Update User schema/queries for Clerk user IDs
 Update 
app-sidebar.tsx
, 
sidebar-user-nav.tsx
 for Clerk auth
 Update 
entitlements.ts
 to remove guest type
3. Document System: Add "plan" type
 Add "plan" to document kind enum in 
lib/db/schema.ts
 Add "plan" to artifactKinds in 
lib/artifacts/server.ts
 Create artifacts/plan/server.ts (document handler)
 Create artifacts/plan/client.tsx (artifact UI component)
 Register plan handler in 
lib/artifacts/server.ts
 Register plan artifact in 
components/artifact.tsx
 Add planDelta to 
CustomUIDataTypes
 in 
lib/types.ts
 Run DB migration for schema change
4. New Document Management Tools
 Create lib/ai/tools/search-documents.ts
 Create lib/ai/tools/list-documents.ts
 Create lib/ai/tools/read-document.ts
 Add corresponding DB queries in 
lib/db/queries.ts
 Register tools in chat API route
5. Plan Management Tools (wrapper around document tools)
 Create lib/ai/tools/create-plan.ts
 Create lib/ai/tools/update-plan.ts
 Create lib/ai/tools/read-plan.ts
 Register plan tools in chat API route
6. ReACT Loop & Agent Behavior
 Increase stepCountIs from 5 to 1000 in chat route
 Add prepareStep for context management
 Update system prompt for ReACT planning behavior
 Add plan-first instruction to system prompt
7. Context Management / Memory
 Implement prepareStep with token-aware context windowing
 Create checkpoint/state summary logic
 Inject state context into new steps when context grows large
8. Verification
 Verify app builds without errors
 Manual: Test Clerk login flow
 Manual: Test plan document creation/update via chat
 Manual: Test document management tools via chat
 Manual: Test agent ReACT loop with multi-step task