# Presentation Design Specialist

## Overview
Expert guidance for creating beautiful, interactive slide presentations in Solaris. Presentations use Markdown with `---` separators, rendered as navigable HTML slides with theme support.

## Slide Format
Slides are written in Markdown, separated by `---` on its own line:

```markdown
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
- **Headings**: `#` (title), `##` (slide title), `###` (subsection)
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Unordered lists**: `- item`
- **Ordered lists**: `1. item`
- **Blockquotes**: `> text` (rendered as highlighted callout)
- **Images**: `![alt text](https://full-url-to-image)` — always use full URLs
- **Inline code**: `` `code` ``
- **Code blocks**: ` ```language ... ``` ` with syntax-appropriate styling
- **Tables**: `| col | col |` with `|---|---|` separator row
- **Links**: `[text](url)`
- **Horizontal rules**: `***` or `___`

## Theme Directives
Use HTML comments at the top of any slide to set its theme:

```markdown
<!-- theme: dark -->
## Dark Themed Slide
Content with light text on dark background

---

<!-- theme: corporate -->
## Professional Slide
Clean, business-appropriate styling

---

<!-- bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%) -->
<!-- color: #ffffff -->
## Custom Gradient Slide
White text on purple gradient
```

### Available Themes
| Theme | Background | Best For |
|-------|-----------|----------|
| `default` | White | General content |
| `dark` | Dark navy | Tech, dramatic emphasis |
| `corporate` | Light gray | Business, professional |
| `creative` | Purple gradient | Pitches, creative work |
| `minimal` | Off-white | Clean, focused content |

### Custom Directives
- `<!-- bg: COLOR_OR_GRADIENT -->` — Custom background (CSS color or gradient)
- `<!-- color: HEX_COLOR -->` — Custom text color
- `<!-- align: left|center -->` — Content alignment

## Design Principles

### Visual Hierarchy
1. **One idea per slide** — never overcrowd
2. **Title slides**: Use `#` for big impact titles, `##` for subtitle
3. **Content slides**: Use `##` for title, bullets for key points
4. **6×6 rule**: Maximum 6 bullets, maximum 6 words per bullet
5. **Progressive disclosure**: Reveal information across slides, not all at once

### Content Structure
- **Opening** (2-3 slides): Hook + agenda
- **Body** (5-15 slides): Main content, one topic per slide
- **Closing** (2-3 slides): Summary + call-to-action + Q&A

### Formatting Best Practices
- Use `**bold**` for emphasis on key terms
- Use bullet points for lists, not paragraphs
- Keep slide titles short (3-5 words)
- Use consistent heading levels across slides
- Add blockquotes for callouts: `> Key insight here`
- Use tables for comparisons and data
- Include images to break up text-heavy slides

### Image Usage
- Use `![Description](https://full-url-to-image)` syntax
- Always use full HTTPS URLs (not relative paths)
- Include descriptive alt text for accessibility
- Reliable image sources: Unsplash, Pexels, official CDNs
- Place images on their own line for proper rendering

## Presentation Types

### Business / Corporate
```markdown
<!-- theme: corporate -->
# Quarterly Business Review
## Q4 2025 Results

---

<!-- theme: corporate -->
## Agenda
- Revenue Performance
- Key Metrics
- Customer Growth
- 2026 Outlook

---

<!-- theme: corporate -->
## Revenue Highlights
- **Total Revenue**: $4.2M (+15% YoY)
- **Recurring Revenue**: $3.1M (+22% YoY)
- **Churn Rate**: 2.3% (down from 3.1%)

> Key takeaway: Recurring revenue growth is outpacing overall revenue growth
```

### Educational / Tutorial
```markdown
## Learning Objectives
1. Understand the fundamentals
2. Apply key techniques
3. Build a working example

---

## Step 1: Setup
- Install dependencies
- Configure environment
- Verify installation

> Note: Follow along with the code examples

---

## Step 2: Implementation
### Code Example
` `` `python
def hello():
    return "Hello, World!"
` `` `
```

### Creative / Pitch Deck
```markdown
<!-- theme: creative -->
# Revolutionary Product
## Changing the Game

---

<!-- bg: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) -->
<!-- color: #ffffff -->
## The Problem
**80%** of teams waste time on manual processes

---

<!-- bg: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) -->
<!-- color: #ffffff -->
## Our Solution
One platform. Zero friction. Infinite possibilities.
```

## PPTX Download Optimization
Presentations can be downloaded as `.pptx` via the export button. For best PPTX output:
- Keep text concise (long paragraphs don't render well)
- Avoid complex nested HTML — stick to standard markdown
- Images must be full URLs (base64 won't export properly)
- Simple, clean slides export better than complex layouts
- Theme colors are applied to PPTX background and text

## Complete Example

```markdown
<!-- theme: creative -->
# AI in Healthcare
## Transforming Patient Care in 2025

---

## Agenda
- Current Landscape
- Key Technologies
- Case Studies
- Future Outlook

---

<!-- theme: dark -->
## The Challenge
- **1 in 3** diagnoses delayed due to data overload
- **$150B** annual cost of administrative burden
- **67%** of physicians report burnout

---

## Key Technologies
| Technology | Application | Impact |
|-----------|------------|--------|
| NLP | Medical records | 40% faster processing |
| Computer Vision | Radiology | 95% accuracy |
| Predictive AI | Patient risk | 30% fewer readmissions |

---

## Case Study: Hospital X
- Implemented AI triage system
- **Results after 6 months**:
  - 25% reduction in wait times
  - 15% improvement in outcomes
  - $2M annual savings

> "The AI system transformed how we prioritize patient care" — Dr. Smith

---

<!-- theme: creative -->
## Thank You
### Questions?
Contact: team@healthcare-ai.com
```
