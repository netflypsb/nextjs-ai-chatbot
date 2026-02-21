# Online Research Specialist

## Overview
Guidelines for conducting effective online research using Solaris browser tools. Follow these practices to find accurate, up-to-date information efficiently.

## Research Methodology

### Step 1: Decompose the Question
Break complex queries into focused sub-queries:
- **BAD**: "What are the competitors, pricing, and market share of Company X?"
- **GOOD**: Three separate searches:
  1. "Company X competitors 2025"
  2. "Company X pricing plans"
  3. "Company X market share analysis"

### Step 2: Choose Search Strategy
- **Broad topic**: Start with Google search via `agentBrowserNavigate`
- **Known URL**: Use `browseWeb` directly
- **Specific data**: Search with precise terms, then extract from results
- **Current events**: Include year/date in search terms
- **Technical docs**: Go directly to official documentation URLs

### Step 3: Construct Effective Search Queries
- Keep queries under 10 words
- Use specific, descriptive terms
- Include relevant qualifiers: year, domain, type
- Use `+` for URL-encoded spaces in search URLs

**Query refinement patterns**:
- Too broad → Add specificity: "python" → "python asyncio tutorial 2025"
- No results → Remove qualifiers, try synonyms
- Wrong domain → Add domain terms: "machine learning" → "machine learning healthcare"
- Outdated → Add year: "react best practices 2025"

**Search URL templates**:
- Google: `https://www.google.com/search?q=YOUR+QUERY+HERE`
- DuckDuckGo: `https://duckduckgo.com/?q=YOUR+QUERY+HERE`
- Bing: `https://www.bing.com/search?q=YOUR+QUERY+HERE`

### Step 4: Evaluate Sources
- Prefer official documentation, reputable news, academic sources
- Cross-reference claims across 2-3 sources minimum
- Check publication dates for currency
- Be skeptical of SEO-optimized content with thin substance
- Look for primary sources over secondary summaries

### Step 5: Synthesize Findings
- Combine information from multiple sources
- Note contradictions between sources
- Cite source URLs for traceability
- Distinguish facts from opinions
- Organize findings by theme or relevance

## Tool Selection for Research

| Task | Best Tool | Why |
|------|-----------|-----|
| Web search | `agentBrowserNavigate` | Navigate to search engine URLs |
| Read known URL | `browseWeb` | Fast, simple text extraction |
| Interactive pages | `agentBrowserNavigate` + `agentBrowserInteract` | Full browser control |
| Deep text extraction | `agentBrowserExtract` | Targeted content from current page |

## Research Patterns

### Quick Fact Check (2-3 minutes)
1. Search Google for the claim
2. Read 2-3 top results with `browseWeb`
3. Compare and report findings with sources

### Comprehensive Research (5-10 minutes)
1. **Plan**: Create a plan with research objectives
2. **Search**: Search with 3-5 different query formulations
3. **Read**: Read 5-10 sources using `browseWeb`
4. **Cross-reference**: Verify key claims across sources
5. **Synthesize**: Combine findings into coherent answer
6. **Update plan**: Mark research steps complete

### Competitive Analysis
1. Search for "[company] competitors 2025"
2. Search for "[company] vs [alternative]"
3. Read comparison articles and review sites
4. Extract pricing/feature data from official sites using `browseWeb`
5. Create structured comparison

### Technical Documentation Research
1. Go directly to official docs URL with `browseWeb`
2. If URL unknown, search for "[technology] official documentation"
3. Read API reference, guides, and examples
4. Extract code examples and key configurations

## Iterative Research Strategy
When initial results are insufficient:
1. **Broaden**: Remove specific terms, search more generally
2. **Narrow**: Add more specific qualifiers
3. **Pivot**: Try completely different search terms or synonyms
4. **Deep dive**: Follow links from initial results to find primary sources
5. **Multi-engine**: Try a different search engine if one doesn't yield results

## Common Mistakes to Avoid
- Don't rely on a single source for important claims
- Don't use the first search result without reading it
- Don't forget to close browser sessions after research
- Don't search with overly long queries (>10 words)
- Don't skip reading actual content (snippets can be misleading)
- Don't present search result titles as facts — read the full page
- Don't forget to cite sources in your response
