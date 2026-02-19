# Phase 1A: Branding & Auth Cleanup

## Status: Partially Complete
Some branding and Clerk setup was already done. This phase completes the migration.

## Current State Analysis
- **Branding**: `chat-header.tsx` already shows "☀️ Solaris Web", `app/layout.tsx` metadata already updated
- **Clerk**: `middleware.ts` uses Clerk, `app/layout.tsx` has `ClerkProvider`, sign-in/sign-up pages use Clerk components, `lib/auth/index.ts` has Clerk-based `getAuth()`
- **Legacy next-auth**: `app/(auth)/auth.ts` still has next-auth code, `app/(auth)/auth.config.ts` has next-auth config, `app/(auth)/actions.ts` has old login/register, `sidebar-user-nav.tsx` uses `next-auth/react`, `app-sidebar.tsx` imports `User` from `next-auth`

## Steps

### 1. Update sidebar branding
- `app-sidebar.tsx` line 74: Change "Chatbot" to "Solaris Web"

### 2. Complete Clerk auth migration
The `lib/auth/index.ts` already has a `getAuth()` function using Clerk. We need to:

a. **Create `ensureUser` in `lib/db/queries.ts`** - The `lib/auth/index.ts` imports `ensureUser` but it doesn't exist. This function should upsert a user by Clerk ID.

b. **Update DB schema** - Change `user.id` from UUID to `text` to accommodate Clerk string IDs (e.g., `user_xxxxx`). Also change `chat.userId` and `document.userId` to `text`. Remove `password` field.

c. **Replace all `import { auth } from "@/app/(auth)/auth"` with `import { getAuth as auth } from "@/lib/auth"`** across:
   - `app/(chat)/api/chat/route.ts`
   - `app/(chat)/layout.tsx`
   - All API routes that use auth

d. **Replace `Session` from `next-auth` with our own `Session` type** from `lib/auth/index.ts` in:
   - `lib/artifacts/server.ts`
   - `lib/ai/tools/create-document.ts`
   - `lib/ai/tools/update-document.ts`

e. **Update `sidebar-user-nav.tsx`** - Replace `next-auth/react` signOut/useSession with Clerk's `useClerk()` and `useUser()`

f. **Update `app-sidebar.tsx`** - Replace `User` from `next-auth` with our own type

g. **Update `entitlements.ts`** - Remove guest type, only keep "regular"

h. **Update `app/(chat)/layout.tsx`** - Use Clerk auth instead of next-auth auth

i. **Remove old auth files** - `app/(auth)/auth.ts`, `app/(auth)/auth.config.ts`, `app/(auth)/actions.ts`, `app/(auth)/login/`, `app/(auth)/register/`

j. **Remove `app/(auth)/api/` route** if it exists (next-auth API route)

### 3. Remove guest login
- Remove guest provider from auth
- Remove `guestRegex` from `lib/constants.ts`
- Remove `DUMMY_PASSWORD` from `lib/constants.ts`
- Update any code referencing guest users

### 4. DB Migration
- Run `pnpm db:generate` then `pnpm db:migrate` after schema changes

## References
- Clerk Next.js docs: https://clerk.com/docs/quickstarts/nextjs
- Clerk middleware: https://clerk.com/docs/references/nextjs/clerk-middleware
- Clerk components: `@clerk/nextjs` provides `<SignIn>`, `<SignUp>`, `<UserButton>`
