# Phase 3 Implementation Plan

## Phase 3A: Critical Bug Fixes
**Priority: HIGH**

### Issue 1: Messages Not Going Through
- **Root cause**: In `multimodal-input.tsx:326`, when `status !== "ready"`, messages are blocked with toast "Please wait for the model to finish its response!". If a stream errors or disconnects without properly completing, the status stays stuck at "streaming"/"submitted" and never returns to "ready". OpenRouter shows no activity because the request never reaches it — the client-side check blocks it.
- **Fix**: The `onError` handler in `chat.tsx` doesn't reset status. The AI SDK `useChat` should handle this, but if the stream closes abnormally (network timeout, Vercel function timeout), the status may not reset. We need to add a safety mechanism that detects stuck status and resets it.

### Issue 3: Agent Response Timeout
- **Root cause**: `maxDuration = 60` in `route.ts` means Vercel serverless functions timeout after 60 seconds. Long-running agent tasks with many tool calls (research + create dashboard) easily exceed this.
- **Fix**: Increase `maxDuration` to 300 (5 minutes, max for Vercel Pro). Add better error messaging for timeouts.

### Issue 4: PNG Download SecurityError
- **Root cause**: `html-to-image` tries to read `cssRules` from cross-origin stylesheets (Font Awesome CDN, Google Fonts). Browser CORS blocks this access, causing `SecurityError`.
- **Fix**: Configure `html-to-image` with `fetchRequestInit: { mode: 'cors' }` and `skipFonts: true` option, or catch and suppress the CSS errors gracefully.

## Phase 3B: Webview Rendering & Quality Check
**Priority: HIGH**

### Issue 2: Dashboard Content Not Displaying
- **Root cause**: The webview iframe uses `sandbox="allow-scripts"` which blocks loading external resources (CDN CSS, fonts, images). The HTML content exists (confirmed by download) but can't render properly in the restricted sandbox.
- **Fix**: Add `allow-same-origin` to the sandbox to let the iframe access its own resources. Use `srcdoc` instead of blob URLs. Inline external resources where possible.

### Quality Check Prompt
- Add a mandatory "quality check" step to the agent's system prompt that instructs it to verify artifact content before reporting completion.

## Phase 3C: OpenRouter Config
**Priority: MEDIUM**
- Add `appName: 'Solaris-Web'` and `appUrl: 'https://solaris-app.com'` to the `createOpenRouter()` config in `providers.ts`.

## Phase 3D: UI Improvements
**Priority: HIGH**

### Replace Visibility Dropdown with Artifacts/Plan Panel
- Replace the private/public visibility selector in the chat header with an "Artifacts" / "Plan" dropdown.
- "Artifacts" opens a panel listing all artifacts created in the current chat thread (fetched from DB).
- "Plan" opens the plan artifact in the canvas.
- Users can select artifacts to open in canvas, and delete artifacts from the list.

### Fix Canvas Pushing Chat Off-Screen
- The artifact component uses `fixed` positioning. The chat panel is set to `w-[400px]` but the parent chat div doesn't account for the sidebar width.
- Fix: Adjust the chat panel width calculation to account for sidebar state, and ensure the chat content remains fully visible.

## Phase 3E: Chain of Thought in Messages
**Priority: MEDIUM**
- The `ChainOfThought` component already exists in `components/ai-elements/chain-of-thought.tsx`.
- Wire it into `message.tsx` to render reasoning/thinking parts using the CoT UI instead of raw text.
- This provides better visualization of agent thinking process.

## Phase 3F: Checkpoint & State Management Review
**Priority: MEDIUM**
- Review current `context-manager.ts` implementation against AI SDK best practices.
- Ensure `prepareStep` correctly condenses context at 50k tokens.
- Verify state persistence: chat messages saved to DB, resumable streams working.
- Add instructions to checkpoint message to use tools (readPlan, readDocument) for context recovery.
