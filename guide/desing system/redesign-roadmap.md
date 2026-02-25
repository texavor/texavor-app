# Texavor Landing Page — Phase-Wise Redesign Roadmap

> **Priority order of feedback sources:**
>
> 1. 🔴 Reddit feedback (real buyers, highest signal)
> 2. 🟠 RankPill design patterns
> 3. 🟡 PromptMonitor design patterns
> 4. 🔵 Marclou's SaaS critique
> 5. ⚪ FlipAEO (new entrant, lower weight)

---

## Current State Diagnosis

### What the site currently has

- **Hero**: Centered layout, `"The Research-First CMS for the GEO Era."` (2 lines), product screenshot below the fold, green blobs decorations, two CTA buttons
- **Pricing**: 3 tiers from `PRICING_TIERS` config, 14-day trial badge, 3-column grid
- **Testimonials**: Standard quote → name structure
- **Features**: `Features.tsx` (41KB — large, likely icon grid)
- **No**: self-proof section, use case scenarios, trust signal above h1, pain education section

### Core problems diagnosed

| Pain Source             | Problem                                                                                | Severity    |
| ----------------------- | -------------------------------------------------------------------------------------- | ----------- |
| Reddit (Old_Lab1576)    | "rank in AI search still feels abstract" — 0% conversion because VALUE is not concrete | 🔴 Critical |
| Reddit (Hungry_Age5375) | "0 sales screams trust deficit" — no social proof visible above fold                   | 🔴 Critical |
| Current Hero.tsx        | Centered, 2-line h1, no credibility above the fold                                     | 🟠 High     |
| Current Hero.tsx        | Product screenshot is hidden BELOW the fold (after CTAs)                               | 🟠 High     |
| Reddit (Old_Lab1576)    | "Show one real case: before GEO / after GEO / traffic change"                          | 🟠 High     |
| Current Pricing.tsx     | 3 tiers — no popcorn anchor, no psychological pricing                                  | 🟡 Medium   |
| Current Features        | Likely icon grid — too generic, no real proof                                          | 🟡 Medium   |

---

## Phase 1 — Trust & Clarity (Do This First, Highest ROI)

> **Driven by**: 🔴 Reddit (priority 1) — fixes 0% conversion issue

**The core insight from Reddit**: People don't understand the urgency. "GEO" is abstract. They wake up wanting traffic, not "AI citation scores." Fix the value communication before anything visual.

### 1.1 — Rewrite the Hero H1 (one concrete line)

**Current**: `"The Research-First CMS for the GEO Era."`

- Multi-line
- "Research-First CMS" = jargon
- "GEO Era" = unknown acronym to most

**Target**: One line, concrete outcome noun

```
Get cited by ChatGPT, Perplexity, and Claude.
```

or

```
Become the source AI recommends to your customers.
```

or

```
Rank in AI search — not just Google.
```

**Rules** (Marclou):

- Single line maximum
- Replace "momentum" / "CMS" / "GEO Era" with what they WANT: traffic, citations, customers
- The AI tools' brand names IN the headline (they are the trust signal)

**File**: `components/Hero.tsx` line 24-27

---

### 1.2 — Add Trust Signal ABOVE the H1

**Reddit**: "Slap a X companies paying banner on top. Watch conversion double."
**RankPill**: Credibility badge BEFORE the headline

```
[⭐⭐⭐⭐⭐] Trusted by 120+ content teams  ← above h1
or
[Users avatars] 3,400+ articles optimized this month
```

Currently the badge above h1 says `"Content Decay Engine is live"` — this is a feature announcement, not a trust signal. Replace it with real social proof numbers.

**File**: `components/Hero.tsx` line 16-21

---

### 1.3 — Embed AI Brand Icons in Hero Sub-copy

**PromptMonitor** and **Marclou**: Don't just name the AI tools — show their icons inline.

Current subheadline: ` "Monitor visibility, fix content decay, and rank in ChatGPT, Perplexity, and Claude."`

New version:

```
Monitor visibility, fix content decay, and rank in
[ChatGPT icon] ChatGPT  [Perplexity icon] Perplexity  [Claude icon] Claude  [Gemini icon] Gemini
```

Makes the product concrete before reading a feature.

**File**: `components/Hero.tsx` line 30-37

---

### 1.4 — Before/After Proof Section (replaces or augments "HowItWorks")

**Highest-priority Reddit feedback (Old_Lab1576 — score 3)**:

> "Show one real case: Article before GEO / Article after GEO / Traffic change or AI citations. Make the value concrete not conceptual."

Create a new section **immediately after the hero** (or replace HowItWorks):

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE TEXAVOR                   │  AFTER TEXAVOR          │
│                                   │                         │
│  Article on "Best SEO Tools"      │  Same article           │
│  - 0 AI citations                 │  - Cited by Perplexity  │
│  - 340 monthly visits             │  - 2,100 monthly visits │
│  - Missing: topical authority     │  - Authority score: 94% │
│                                   │  [Actual screenshot]    │
└─────────────────────────────────────────────────────────────┘
         ↑ real data, real screenshot, not "our platform helps..."
```

**New file**: `components/BeforeAfterProof.tsx`

---

### 1.5 — Add "X Companies Paying" / Live Social Proof Banner

Near top of page or right below hero CTA:

```
🟢 127 content teams active right now  ·  14,300+ articles optimized
```

Static numbers are fine — doesn't need to be real-time.

---

## Phase 2 — Hero Visual Redesign

> **Driven by**: 🟠 RankPill (priority 2) + 🔵 Marclou (priority 4)

### 2.1 — Move Product Into First Viewport

**Marclou**: "Show how it works in the first 100% viewport. Left: input. Right: output."
**RankPill**: Product screenshots are the illustration — no abstract icons.

Currently the product screenshot is BELOW the CTA buttons — users must scroll before seeing the product. Instead:

```
┌──────────────────────┬─────────────────────────┐
│                      │                         │
│  [Trust badge]       │  [ChatGPT response      │
│  [H1 — one line]     │   showing Texavor       │
│  [Subheadline with   │   content cited]        │
│   AI brand icons]    │         OR              │
│  [CTA buttons]       │  [GEO Score: 87/100     │
│  [stat trust signal] │   dashboard view]       │
│                      │                         │
└──────────────────────┴─────────────────────────┘
```

Left = text. Right = product working (visible without scroll).

**Approach**: Convert Hero.tsx from column layout to a left/right split grid for `md:` and above.

---

### 2.2 — Left-Align Hero Text

**RankPill** (and editorial design canon): Left alignment reads as confident and authoritative.

Current: `items-center text-center` on the container.
Target: Left-aligned text, right side gets the product visual.

This is automatically achieved if we do 2.1 (split layout).

---

### 2.3 — Remove Generic Blob Decorations

Current Hero.tsx lines 72-77 have three animated green blob divs. These are the most generic SaaS decoration possible.

Replace with (FlipAEO-inspired):

- Subtle dot texture on the section bg (`tx-dot-bg` utility)
- 1-2 small geometric asterisk SVG marks near the headline

---

### 2.4 — Hero Badge Copy Change

Change from: `"New · Content Decay Engine is live"` (feature announcement)
To: `"+ THE GEO ERA"` or `"→ AI search is the new SEO"` (era-framing, like FlipAEO)

Or a trust signal: `"⭐ 4.9 · 127 teams ranking in AI"`

One clear job: hook OR trust. Not "we shipped a feature."

---

## Phase 3 — Pricing Overhaul

> **Driven by**: 🔵 Marclou (priority 4) — pricing psychology

### 3.1 — Psychological Pricing (below round numbers)

**Marclou**: "$9, not $10. Never round numbers for the entry tier."

Current pricing is in `lib/pricing.ts` — check but highly likely round numbers ($19, $49, $99 or similar). Change to:

- Entry: **$9/mo**
- Mid: **$29/mo** (real target)
- Pro: **$79/mo**

### 3.2 — Add Popcorn Anchor Tier

**Marclou**: Add an expensive tier to make the middle look reasonable.

New tier structure:

```
$9/mo      Starter     — entry anchor (solo writer)
$29/mo     Pro         ← MOST POPULAR (actual conversion target)
$79/mo     Team        — makes $29 look cheap
$199/mo    Agency      ← anchor (exists to reframe everything below)
```

### 3.3 — Remove "Free Forever" if it Exists

Replace with 14-day trial messaging only. Free users don't convert, just churn the platform.

The current Pricing.tsx already has `"Start with a 14-day free trial"` — this is correct. Just make sure there's no permanent free tier in `lib/pricing.ts`.

---

## Phase 4 — Feature Section Overhaul

> **Driven by**: 🟠 RankPill + 🟡 PromptMonitor

### 4.1 — Replace Icon Grid with Bento or Use-Case Layout

**Both RankPill and PromptMonitor**: Feature sections with real product screenshots inside cells, not icons.

Current `Features.tsx` is 41KB — likely a large icon grid. Replace with a **bento layout**:

```
┌─────────────────────────────┬──────────────────────┐
│ [Eyebrow: ANALYSIS]         │ [Eyebrow: MONITORING] │
│ AI Visibility Score         │ Content Decay Engine  │
│ Track how often ChatGPT,    │ Know which articles   │
│ Claude, Perplexity cite      │ are losing AI         │
│ your content.               │ authority — before    │
│                             │ rankings drop.        │
│ [GEO Score dashboard shot]  │ [Decay chart shot]    │
├─────────────────────────────┴──────────────────────┤
│ [Eyebrow: STRATEGY]         [Eyebrow: RESEARCH]     │
│  ...                         ...                    │
└────────────────────────────────────────────────────┘
```

PromptMonitor approach: thin `1px` border dividers, no card shadows, white bg throughout.

### 4.2 — 3 Use-Case Scenarios (Marclou: "don't tell, show")

New section to replace or complement "Why Texavor?":

```
USE CASE 1: Content writer trying to rank in AI search
LEFT: Before — article with 0 citations, no GEO strategy
RIGHT: After — Perplexity cites the article in top 3 results

USE CASE 2: Agency monitoring client AI visibility
LEFT: Dashboard showing competitor at 78%, client at 23%
RIGHT: Gap identified → content plan → 2 months later: 61%

USE CASE 3: Founder checking content decay
LEFT: Article published 6 months ago — decay alert triggered
RIGHT: Updated with GEO fixes → AI citations recovered
```

Each scenario: numbered (01, 02, 03 — FlipAEO pattern), concrete person, concrete situation, concrete before/after.

---

## Phase 5 — Social Proof Redesign

> **Driven by**: 🟠 RankPill (stat-first testimonials)

### 5.1 — Flip Testimonial Card Structure

Current (assumed): `quote → name → company`

New (RankPill):

```
↑ 312% AI citations         ← HUGE outcome number
in 8 weeks                  ← context

"Texavor showed us exactly which articles were being
ignored by AI. We fixed three pages and citations
started appearing in Perplexity within 2 weeks."

[avatar] Sarah K., Content Lead at Clearbit
```

The outcome number is the headline. The quote validates it. The person is last.

**File to modify**: `components/Testimonials.tsx`

### 5.2 — Add a "We Use Texavor on Texavor.com" Section

**FlipAEO's "We Drink Our Own Champagne"** + **Marclou's "ship in public"** principle:

Show Texavor's OWN data:

```
"We built Texavor. We use it on texavor.com."

[3 screenshots side by side]
- Texavor's AI Visibility Score: 87/100
- ChatGPT citing texavor.com in a response about GEO tools
- Content Decay dashboard: 0 decayed articles

[CREDIBILITY]          [AI CITED]           [HEALTH]
Visibility: 87/100     Cited by 3 AI tools  0 decayed pieces
```

New section or part of updated Testimonials section.

---

## Phase 6 — Pain Education Section

> **Driven by**: 🟡 PromptMonitor + ⚪ FlipAEO

### 6.1 — Market Shift Data Section

Before the features, add a section that educates visitors on WHY this matters with hard data (PromptMonitor pattern):

**LEFT panel** (white bg):

```
"AI is now answering 40% of all search queries."

[Bar chart]
ChatGPT users: 600M
Perplexity: 400M
Google AI Overview: 3.5B queries/mo
```

**RIGHT panel** (dark bg, `bg-foreground`):

```
"Your customers are asking AI —
not Google — where to buy."
```

> **Note**: FlipAEO does this with "Ghosting Your Brand" 3-column pain section. PromptMonitor does it with data. Use the data approach (PromptMonitor — higher priority).

### 6.2 — Name the Pain Points Directly (Direct, not abstract)

FlipAEO names competitor weaknesses directly. We should name the reader's current broken approach:

```
3 columns:

"Tracking rankings won't get you AI citations"
Knowing your Google rank doesn't tell you why ChatGPT
ignores your content. One is position data — the other
is authority data. They're not the same thing.

"Publishing more doesn't help if AI ignores it"
AI models don't rank by volume. They cite sources
with topical authority, structure, and trustworthiness.
More articles with the same problems just scales the problem.

"Generic AI-written content gets filtered out"
LLMs recognize their own voice. Content written by AI
without real expertise signals scores low on authority
and gets skipped in citations.
```

---

## Phase 7 — Design System Polishing

> **Driven by**: Design consistency (applies all phases)

### 7.1 — Section Background Rhythm (RankPill)

Use alternating `bg-background` and `bg-muted/40` across sections instead of pure white throughout or arbitrary colored sections.

Suggested order:

```
Hero:               bg-background (warm off-white)
After-hero proof:   bg-muted/40 (light gray)
Pain education:     bg-background → bg-foreground (dark split)
Features bento:     bg-background
Use cases:          bg-muted/40
Pricing:            bg-background
Testimonials:       bg-muted/40
CTA:                bg-foreground (dark)
```

### 7.2 — Feature Cards: Border Only, No Shadow

**RankPill + PromptMonitor**: Feature cells are `border border-border` only. No `shadow-*`.

Audit all card components and remove drop shadows from feature presentation cards. Keep shadows only for interactive elements (buttons, modals).

### 7.3 — Color Discipline

**RankPill**: Green is for trust signals and success states ONLY.

Audit: remove green from decorative backgrounds (blobs, gradients). Green should appear on:

- Checkmarks
- "Live" / "Active" indicators
- Positive metric numbers
- Primary CTA button
- Inline emphasis of key outcome phrases

Amber accent: use for badges, eyebrow labels, highlight pills.

---

## Master Checklist (Ordered by Phase)

### Phase 1 — Trust & Clarity ✅ Do first

- [ ] Rewrite h1 to one concrete line (outcomes, not jargon)
- [ ] Change hero badge from feature announcement to trust signal
- [ ] Add social proof numbers above the fold ("127 teams active")
- [ ] Embed AI brand icons (ChatGPT, Claude, Perplexity) inline in sub-copy
- [ ] Build Before/After proof section (article → AI citation, real data)

### Phase 2 — Hero Visual

- [ ] Restructure Hero.tsx to left/right split layout
- [ ] Move product visual INTO first viewport (right column)
- [ ] Remove animated green blobs → subtle dot texture + asterisk decorations
- [ ] Change hero badge copy to era-defining statement

### Phase 3 — Pricing

- [ ] Audit `lib/pricing.ts` — adjust prices to $9/$29/$79
- [ ] Add Agency/Enterprise anchor tier ($199/mo)
- [ ] Verify no permanent free tier — trial only

### Phase 4 — Features

- [ ] Rebuild Features section as bento grid (1px dividers, no shadow)
- [ ] Add product screenshots inside feature cells (real data visible)
- [ ] Number feature cards (01, 02, 03)
- [ ] Add eyebrow labels per feature cell (ANALYSIS, MONITORING, etc.)
- [ ] Build 3 Use-Case scenario blocks (left: context, right: outcome)

### Phase 5 — Social Proof

- [ ] Flip Testimonials structure: stat → quote → person
- [ ] Add "We use Texavor on texavor.com" self-proof section
- [ ] Show real AI citation screenshot of texavor.com

### Phase 6 — Pain Education

- [ ] Add market data section (AI search growth bar chart)
- [ ] Add split dark panel with consequence statement
- [ ] Add 3-column pain point section naming broken alternatives

### Phase 7 — Design System

- [ ] Implement alternating section backgrounds
- [ ] Remove drop shadows from feature cards
- [ ] Audit green usage — trust signals only
- [ ] Use amber for eyebrow labels and badges

---

## Psychology Principles Underlying This Roadmap

| Principle                      | Applied via                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| **Urgency before solution**    | Pain section before features. Market data before product pitch.         |
| **Proof before pitch**         | Self-proof section, before/after case, stat-first testimonials          |
| **Concrete over abstract**     | "ChatGPT cites you" not "GEO optimization platform"                     |
| **Anchor pricing**             | Expensive tier makes mid tier feel reasonable (popcorn effect)          |
| **Recognition over recall**    | Show the actual AI tools' brand icons — users recognize them instantly  |
| **Pattern interrupt**          | Left-aligned hero, no blobs, bento grid = nothing looks like other SaaS |
| **Trust deficit before value** | No trust = no conversion regardless of price (Reddit insight)           |
| **Specificity = credibility**  | "127 teams" beats "many teams". "87/100 score" beats "high visibility"  |
