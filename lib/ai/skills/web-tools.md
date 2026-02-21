# Web Tools Specialist

## Overview
Guide for selecting and using the right web tool for each task. Solaris has two browser automation systems: agent-browser (interactive, ref-based) and browseWeb (simple content extraction via Browserbase).

## Tool Decision Tree

```
Need to browse the web?
├── Do you have a specific URL to read?
│   ├── YES → Is the page static/article-like?
│   │   ├── YES → Use `browseWeb` (fast, simple)
│   │   └── NO (JS-heavy, dynamic) → Use `agentBrowserNavigate`
│   └── NO → Need to search first
│       └── Use `agentBrowserNavigate` to search engine URL
├── Do you need to interact with a page? (click, fill, submit)
│   └── YES → Use `agentBrowserNavigate` → `agentBrowserInteract`
├── Do you need to extract specific data?
│   ├── From a known URL → `browseWeb` (text) or `agentBrowserExtract` (structured)
│   └── From current browser page → `agentBrowserExtract`
└── Done with browsing?
    └── Use `agentBrowserClose` to free resources
```

## Agent Browser Tools (Interactive — 4 tools)

Full browser control with AI-optimized snapshot/ref system:

- `agentBrowserNavigate({ url })` — Go to URL, get accessibility snapshot with element refs
- `agentBrowserInteract({ action, ref, value })` — Click/fill/type/hover elements by ref
- `agentBrowserExtract({ ref?, extractType })` — Get text/html/value/snapshot
- `agentBrowserClose()` — Close browser session (ALWAYS call when done)

**When to use**: Search queries, interactive tasks, form filling, multi-step workflows, dynamic pages

**Key concept**: The ref system (`@e1`, `@e2`) from snapshots — always use fresh refs from the most recent snapshot.

## Browserbase Tool (Simple — 1 tool)

Simple URL-to-text extraction via cloud browser:

- `browseWeb({ url })` — Navigate + extract text (up to 15,000 chars)

**When to use**: Reading articles, documentation, blog posts, known URLs

**Advantages**: Faster, fewer tokens, no session management needed

## Combining Tools Effectively

### Pattern: Search → Read → Synthesize
1. `agentBrowserNavigate({ url: "https://www.google.com/search?q=topic" })` → search results snapshot
2. Identify result URLs from snapshot
3. `agentBrowserClose()` — close the search session
4. `browseWeb({ url: "https://result1.com" })` → read each result (faster than navigating)
5. `browseWeb({ url: "https://result2.com" })` → read next result
6. Synthesize findings from extracted content

### Pattern: Navigate → Interact → Extract
1. `agentBrowserNavigate({ url: "https://example.com/form" })` → page snapshot
2. `agentBrowserInteract({ action: "fill", ref: "@e3", value: "data" })` → fill form
3. `agentBrowserInteract({ action: "click", ref: "@e7" })` → submit
4. `agentBrowserExtract({ extractType: "text" })` → get result text
5. `agentBrowserClose()` — always close when done

### Pattern: Quick Content Read
1. `browseWeb({ url: "https://docs.example.com/api" })` → get text content
2. Done — no session to close

## Anti-patterns (Avoid These)
- **DON'T** use agent-browser just to read a static page → use `browseWeb` instead
- **DON'T** forget to call `agentBrowserClose()` → resources leak
- **DON'T** reuse old refs after page changes → always re-snapshot
- **DON'T** use `browseWeb` for pages requiring clicks/form filling → use agent-browser
- **DON'T** keep a browser session open across many unrelated tasks → close and reopen

## Performance Tips
- `browseWeb` is ~2x faster than agent-browser for simple reads
- Minimize the number of agent-browser interactions per session
- Close browser sessions as soon as possible
- For reading multiple URLs: `browseWeb` is better than navigating to each with agent-browser
- Use `extractType: "text"` instead of "html" to reduce token count

## Load More Detail
- For agent-browser deep-dive: `readSkill("agent-browser")`
- For browserbase deep-dive: `readSkill("browserbase")`
- For research methodology: `readSkill("online-research")`
