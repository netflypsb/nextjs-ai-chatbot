# Browserbase Specialist

## Overview
Browserbase is a cloud browser infrastructure service. The `browseWeb` tool uses Browserbase to navigate to URLs and extract page text content. It's simpler and faster than agent-browser but non-interactive.

## Available Tool
- `browseWeb({ url })` — Navigate to URL, extract text content (up to 15,000 chars)

## When to Use browseWeb vs agent-browser

| Scenario | browseWeb | agent-browser |
|----------|:---------:|:-------------:|
| Read article/doc at known URL | ✅ Best | ⚠️ Overkill |
| Extract text from a page | ✅ Best | ⚠️ Overkill |
| Fill forms / click buttons | ❌ Can't | ✅ Required |
| Search engine queries | ❌ Can't | ✅ Required |
| Multi-step interactions | ❌ Can't | ✅ Required |
| Dynamic/JS-heavy pages | ⚠️ May work | ✅ Reliable |
| Simple content extraction | ✅ Best | ⚠️ Overkill |
| Reading multiple URLs | ✅ Best | ⚠️ Slow |

**Rule of thumb**: If you have a URL and just need the text → `browseWeb`. If you need to interact → agent-browser.

## How browseWeb Works
1. Creates a Browserbase cloud browser session
2. Navigates to the provided URL
3. Waits for page to load (handles JavaScript rendering)
4. Extracts all visible text content (strips HTML)
5. Returns up to 15,000 characters of text
6. Falls back to simple HTTP fetch if Browserbase is unavailable

## Best Practices
- **Use for reading known URLs**: articles, documentation, blog posts, product pages
- **Prefer over agent-browser** for simple content reading — fewer tokens, faster execution
- **For research workflows**: Use agent-browser to search → get URLs → use browseWeb to read each URL
- **Content truncation**: Text is truncated at 15,000 chars — key info is usually at the top of pages
- **Fallback behavior**: If Browserbase fails, it automatically tries a simple HTTP fetch

## Browserbase Features
- **Stealth mode**: Avoids bot detection and CAPTCHAs
- **Cloud infrastructure**: No local browser needed, runs on Browserbase servers
- **JavaScript rendering**: Handles SPAs and dynamic content
- **Proxies**: Can handle geo-restricted content
- Requires `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` environment variables

## Common Patterns

### Read documentation
```
browseWeb({ url: "https://docs.example.com/api/reference" })
→ Returns: structured text content of the documentation page
```

### Read an article
```
browseWeb({ url: "https://blog.example.com/interesting-article" })
→ Returns: full article text, stripped of HTML
```

### Research workflow (combined with agent-browser)
1. `agentBrowserNavigate` to Google search → find URLs
2. `browseWeb` each promising URL → extract content quickly
3. `agentBrowserClose` when done with search
4. Synthesize findings from all extracted content

### Read multiple pages
Call `browseWeb` sequentially for each URL — each call is independent:
1. `browseWeb({ url: "https://source1.com/article" })` → content 1
2. `browseWeb({ url: "https://source2.com/article" })` → content 2
3. Compare and synthesize

## Limitations
- **No interaction**: Cannot click buttons, fill forms, or navigate within a page
- **No search**: Cannot perform search queries — use agent-browser for that
- **Text only**: Returns plain text, not HTML or structured data
- **Truncation**: Content limited to ~15,000 characters
- **Single page**: Each call reads one URL — no link following
