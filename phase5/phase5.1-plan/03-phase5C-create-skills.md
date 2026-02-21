# Phase 5C — Create Skill Content Files

## Objective
Create the 5 skill markdown files with expert-level content. Each skill follows the progressive disclosure pattern: the agent loads these on-demand via `readSkill` to gain domain expertise without consuming context upfront.

## Skill Content Guidelines
- Each skill should be **1,500–4,000 tokens** (concise but comprehensive)
- Use clear headings, numbered steps, decision trees
- Include concrete examples and patterns
- Focus on actionable instructions, not theory
- Reference actual Solaris tool names and parameters

---

## Skill 1: `lib/ai/skills/agent-browser.md`

**Source research**: vercel-labs/agent-browser repo analysis + DeepWiki documentation

**Content outline**:
```markdown
# Agent Browser Specialist

## Overview
agent-browser is an AI-optimized browser automation tool using Playwright under the hood.
It uses a ref-based system for deterministic element selection.

## Available Tools
- `agentBrowserNavigate` — Navigate to URL, returns accessibility snapshot with refs
- `agentBrowserInteract` — Click, fill, type, hover using refs from snapshot
- `agentBrowserExtract` — Extract text/html/value from page or elements
- `agentBrowserClose` — Close session and free resources

## Core Workflow
1. **Navigate**: `agentBrowserNavigate({ url })` → get snapshot with @refs
2. **Analyze snapshot**: Read the accessibility tree, identify target elements by @ref
3. **Interact**: `agentBrowserInteract({ action, ref, value })` → updated snapshot
4. **Extract if needed**: `agentBrowserExtract({ ref, extractType })` → content
5. **Always close**: `agentBrowserClose()` when done

## The Ref System
- Snapshots assign refs like @e1, @e2 to interactive elements
- Refs are INVALIDATED after any page change (navigation, form submit, dynamic update)
- ALWAYS re-snapshot after interactions that change the page
- Use refs from the MOST RECENT snapshot only

## Search Engine Usage (replacing webSearch)
To search the web:
1. Navigate to a search engine: `agentBrowserNavigate({ url: "https://www.google.com/search?q=YOUR+QUERY" })`
2. Parse the snapshot for search result links
3. Navigate to promising results to read content
4. Extract text from pages using `agentBrowserExtract`

Alternative search URLs:
- Google: `https://www.google.com/search?q=QUERY`
- DuckDuckGo: `https://duckduckgo.com/?q=QUERY`
- Bing: `https://www.bing.com/search?q=QUERY`

## Best Practices
- Always close browser sessions when done (resource cleanup)
- Use `extractType: "text"` for reading page content (less tokens than HTML)
- Use `extractType: "snapshot"` to re-assess page state
- For forms: use `fill` (clears then types) not `type` (appends)
- Wait for page settlement happens automatically (1.5s navigate, 0.8s interact)
- If interaction fails, take a new snapshot and retry with fresh refs

## Common Patterns
### Read an article
1. Navigate → Extract text → Close

### Fill a form
1. Navigate → Identify form fields from snapshot → Fill each field → Click submit → Verify result

### Multi-page research
1. Navigate to search → Parse results → Navigate to each result → Extract → Close

## Troubleshooting
- "Failed to navigate": URL may be invalid or site blocks automated browsers
- "Failed to click": Ref is stale — take new snapshot
- Truncated content: Use `agentBrowserExtract` with specific `ref` for targeted extraction
```

---

## Skill 2: `lib/ai/skills/browserbase.md`

**Source research**: Browserbase documentation (docs.browserbase.com)

**Content outline**:
```markdown
# Browserbase Specialist

## Overview
Browserbase is a cloud browser infrastructure service. The `browseWeb` tool uses Browserbase
to navigate to URLs and extract page text content. It's simpler than agent-browser but
less interactive.

## Available Tool
- `browseWeb({ url })` — Navigate to URL, extract text content (up to 15,000 chars)

## When to Use browseWeb vs agent-browser
| Scenario | Use browseWeb | Use agent-browser |
|----------|:---:|:---:|
| Read article/doc at known URL | ✅ | ❌ |
| Extract text from a page | ✅ | ❌ |
| Fill forms / click buttons | ❌ | ✅ |
| Search engine queries | ❌ | ✅ |
| Multi-step interactions | ❌ | ✅ |
| Dynamic/JS-heavy pages | ⚠️ | ✅ |
| Simple content extraction | ✅ | ❌ |

## How browseWeb Works
1. Creates a Browserbase cloud session
2. Navigates to the URL
3. Extracts text content (strips HTML)
4. Returns up to 15,000 characters
5. Falls back to simple fetch if Browserbase fails

## Best Practices
- Use for **reading known URLs** (articles, docs, blog posts)
- Prefer over agent-browser for simple content reading (fewer tokens, faster)
- For research: use agent-browser to search → get URLs → use browseWeb to read each URL
- Content is truncated at 15,000 chars — for long pages, key info is usually at the top
- If browseWeb fails on a page, try agent-browser as fallback

## Browserbase Features
- **Stealth mode**: Avoids bot detection
- **Proxies**: Handles geo-restricted content
- **Cloud infrastructure**: No local browser needed
- Requires BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID env vars

## Common Patterns
### Read documentation
browseWeb({ url: "https://docs.example.com/api" }) → structured text content

### Follow links from search
1. agent-browser searches Google → finds URLs
2. browseWeb reads each URL for content
3. Synthesize findings
```

---

## Skill 3: `lib/ai/skills/online-research.md`

**Source research**: Tavily best practices, AI research agent patterns, search optimization

**Content outline**:
```markdown
# Online Research Specialist

## Overview
Guidelines for conducting effective online research using Solaris browser tools.
Follow these practices to find accurate, up-to-date information efficiently.

## Research Methodology

### Step 1: Decompose the Question
Break complex queries into focused sub-queries:
- BAD: "What are the competitors, pricing, and market share of Company X?"
- GOOD: Three separate searches:
  1. "Company X competitors 2025"
  2. "Company X pricing plans"
  3. "Company X market share analysis"

### Step 2: Choose Search Strategy
- **Broad topic**: Start with Google search via agent-browser
- **Known URL**: Use browseWeb directly
- **Specific data**: Search with precise terms, then extract from results
- **Current events**: Include year/date in search terms

### Step 3: Construct Effective Search Queries
- Keep queries under 10 words
- Use specific, descriptive terms
- Include relevant qualifiers: year, domain, type
- Use quotes for exact phrases: `"exact phrase"`
- Iterate: refine based on initial results

**Query refinement patterns**:
- Too broad → Add specificity: "python" → "python asyncio tutorial 2025"
- No results → Remove qualifiers, use synonyms
- Wrong domain → Add domain terms: "machine learning" → "machine learning healthcare"
- Outdated → Add year: "react best practices 2025"

### Step 4: Evaluate Sources
- Prefer official documentation, reputable news, academic sources
- Cross-reference claims across multiple sources
- Check publication dates for currency
- Be skeptical of SEO-optimized content with thin substance

### Step 5: Synthesize Findings
- Combine information from multiple sources
- Note contradictions between sources
- Cite source URLs for traceability
- Distinguish facts from opinions

## Tool Selection for Research
1. **Web search**: Use `agentBrowserNavigate` to Google/DuckDuckGo/Bing
2. **Read pages**: Use `browseWeb` for known URLs (faster, simpler)
3. **Interactive pages**: Use `agentBrowserNavigate` + `agentBrowserExtract`
4. **Deep extraction**: Use `agentBrowserExtract({ extractType: "text" })`

## Research Patterns

### Quick Fact Check
1. Search Google for the claim
2. Read 2-3 top results with browseWeb
3. Compare and report findings

### Comprehensive Research
1. Create a plan with research objectives
2. Search with 3-5 different query formulations
3. Read 5-10 sources
4. Cross-reference and synthesize
5. Update plan with findings

### Competitive Analysis
1. Search for "[company] competitors"
2. Search for "[company] vs [alternative]"
3. Read comparison articles and review sites
4. Extract pricing/feature data from official sites

## Common Mistakes to Avoid
- Don't rely on a single source
- Don't use the first search result without verification
- Don't forget to close browser sessions after research
- Don't search with overly long queries (>10 words)
- Don't skip reading the actual content (don't just use snippets)
```

---

## Skill 4: `lib/ai/skills/web-tools.md`

**Content outline**:
```markdown
# Web Tools Specialist

## Overview
Guide for selecting and using the right web tool for each task.
Solaris has two browser automation systems: agent-browser (interactive) and browseWeb (simple).

## Tool Decision Tree

```
Need to browse the web?
├── Do you have a specific URL to read?
│   ├── YES → Is the page static/article-like?
│   │   ├── YES → Use `browseWeb` (fast, simple)
│   │   └── NO (JS-heavy, dynamic) → Use `agentBrowserNavigate`
│   └── NO → Need to search first
│       └── Use `agentBrowserNavigate` to search engine → parse results
├── Do you need to interact with a page? (click, fill, submit)
│   └── YES → Use `agentBrowserNavigate` → `agentBrowserInteract`
├── Do you need to extract specific data?
│   ├── From a known URL → `browseWeb` (text) or `agentBrowserExtract` (structured)
│   └── From current page → `agentBrowserExtract`
└── Done with browsing?
    └── Use `agentBrowserClose` to free resources
```

## Agent Browser Tools (Interactive)
**4 tools for full browser control**:
- `agentBrowserNavigate({ url })` — Go to URL, get snapshot with element refs
- `agentBrowserInteract({ action, ref, value })` — Click/fill/type/hover elements
- `agentBrowserExtract({ ref?, extractType })` — Get text/html/value/snapshot
- `agentBrowserClose()` — Close browser session

**When to use**: Interactive tasks, search, form filling, multi-step workflows

**Key concept**: The ref system (@e1, @e2) from snapshots — always use fresh refs

## Browserbase Tool (Simple)
**1 tool for content extraction**:
- `browseWeb({ url })` — Navigate + extract text (up to 15,000 chars)

**When to use**: Reading articles, documentation, known URLs

## Combining Tools Effectively

### Pattern: Search → Read → Synthesize
1. `agentBrowserNavigate` to Google search
2. Parse snapshot for result URLs
3. `browseWeb` each URL for content (faster than navigating to each)
4. `agentBrowserClose` when done with search
5. Synthesize findings

### Pattern: Navigate → Interact → Extract
1. `agentBrowserNavigate` to target page
2. `agentBrowserInteract` to click/fill as needed
3. `agentBrowserExtract` to get data
4. `agentBrowserClose` when done

### Anti-patterns
- DON'T use agent-browser just to read a static page (use browseWeb)
- DON'T forget to close browser sessions
- DON'T use stale refs (always re-snapshot after page changes)
- DON'T use browseWeb for pages requiring interaction

## Activate Skills for More Detail
- For agent-browser deep-dive: `readSkill("agent-browser")`
- For browserbase deep-dive: `readSkill("browserbase")`
- For research methodology: `readSkill("online-research")`
```

---

## Skill 5: `lib/ai/skills/presentation.md`

**Content outline**:
```markdown
# Presentation Design Specialist

## Overview
Expert guidance for creating beautiful, interactive slide presentations in Solaris.
Presentations use Markdown with `---` separators, rendered as navigable HTML slides.

## Slide Format
Slides are written in Markdown, separated by `---` on its own line:
```
# Title Slide
## Subtitle

---

## Second Slide
- Point 1
- Point 2

---

## Third Slide
Content here
```

## Supported Markdown Features
- **Headings**: # (title), ## (slide title), ### (subsection)
- **Bold**: **text** → <strong>
- **Italic**: *text* → <em>
- **Unordered lists**: - item
- **Ordered lists**: 1. item
- **Blockquotes**: > text (rendered as speaker notes style)
- **Images**: ![alt](url) — use full URLs for images
- **Inline code**: `code`
- **Code blocks**: ```language ... ```

## Theme Directives
Use HTML comments at the top of a slide to set theme:
<!-- theme: dark -->
<!-- theme: corporate -->
<!-- theme: creative -->
<!-- bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%) -->
<!-- color: #ffffff -->

Available themes: default, dark, corporate, creative, minimal

## Design Principles

### Visual Hierarchy
1. **One idea per slide** — don't overcrowd
2. **Title slides**: Use # for big impact titles
3. **Content slides**: Use ## for titles, bullets for key points
4. **6x6 rule**: Max 6 bullets, max 6 words per bullet
5. **Progressive disclosure**: Reveal information across slides, not all at once

### Content Structure
- **Opening**: Hook + agenda (2-3 slides)
- **Body**: Main content, one topic per slide (5-15 slides)
- **Closing**: Summary + call-to-action + Q&A (2-3 slides)

### Formatting Best Practices
- Use **bold** for emphasis on key terms
- Use bullet points for lists (not paragraphs)
- Keep slide titles short (3-5 words)
- Use consistent heading levels across slides
- Add blockquotes for speaker notes: > Note: mention key insight

### Image Usage
- Use `![Description](https://url-to-image)` for images
- Prefer high-quality, relevant images
- Include descriptive alt text
- Images from reliable CDNs (unsplash, pexels URLs)

## Presentation Types

### Business/Corporate
- Clean, professional layout
- Data-driven with key metrics
- Use theme: corporate
- Include agenda slide, executive summary, recommendations

### Educational/Tutorial
- Step-by-step progression
- Code examples where relevant
- Use theme: default
- Include learning objectives and summary

### Creative/Pitch
- Bold visuals and gradients
- Use theme: creative
- Minimal text, maximum impact
- Strong opening hook, clear CTA

## PPTX Download Optimization
Presentations can be downloaded as .pptx via the export button.
For best PPTX output:
- Keep text concise (long paragraphs don't render well in PPTX)
- Avoid complex HTML — stick to markdown
- Images must be full URLs (base64 won't export)
- Simple slides export better than complex ones

## Example: Professional Presentation
```markdown
# Quarterly Business Review
## Q4 2025 Results

---

## Agenda
- Revenue Performance
- Key Metrics
- Customer Growth
- 2026 Outlook

---

## Revenue Performance
- **Total Revenue**: $4.2M (+15% YoY)
- **Recurring Revenue**: $3.1M (+22% YoY)
- **New Business**: $1.1M
- **Churn Rate**: 2.3% (improved from 3.1%)

> Note: Highlight the recurring revenue growth as key success metric

---

## Key Metrics
| Metric | Q3 | Q4 | Change |
|--------|-----|-----|--------|
| MRR | $950K | $1.03M | +8.4% |
| NPS | 72 | 78 | +6 pts |
| DAU | 12.4K | 15.1K | +21.8% |

---

## Thank You
### Questions?
Contact: team@company.com
```
```

---

## Files to Create
1. `lib/ai/skills/agent-browser.md`
2. `lib/ai/skills/browserbase.md`
3. `lib/ai/skills/online-research.md`
4. `lib/ai/skills/web-tools.md`
5. `lib/ai/skills/presentation.md`

## Verification
- Each file is readable via `getSkillContent(skillId)` in the registry
- `readSkill({ skillId: "agent-browser" })` returns content
- `searchSkills({ query: "browser" })` returns relevant skills
- Content is actionable and references actual Solaris tool names
