# Texavor Visual Redesign Spec

> Pure design changes only. No new content, no new sections. Just HOW each existing component must look different.
> Reference the design system in `guide/design-system.md` for tokens.

---

## The Visual Goal in One Sentence

Move from **"floating pill nav + centered blob hero + shadow card grid"** → **"flat editorial nav + left-split hero + line-grid bento"**. Every section should feel like it was designed by a newspaper art director, not a SaaS template.

---

## 1. Navigation — `LandingNav.tsx`

### Current (problems)

- Floating pill/capsule nav centered on page (`rounded-full`, `max-w-5xl`, `fixed top-6`)
- Heavy `shadow-xl` + glassmorphism backdrop blur
- "Free Tools" link has an animated ping dot (playful, inconsistent with editorial tone)
- `Get Started` button is `rounded-full` — matches the pill nav

### Target Design

```
[Logo · Texavor]    Features · Pricing · Blog · Docs       Login  [Start Ranking →]
─────────────────────────────────────────────────────────────────────────────────────
```

**Changes:**

- Remove `rounded-full` pill container → full-width flat bar: `w-full`, `border-b border-border`, `bg-background/95 backdrop-blur-sm`
- Remove `shadow-xl` → no shadow on nav, just a `1px` bottom border
- Remove `top-6` offset → flush to top: `top-0`
- Nav links: `text-sm font-medium text-muted-foreground hover:text-foreground` — plain underline-on-hover, no pills
- Remove animated ping dot from "Free Tools" — replace with a simple `(Free)` text suffix or `↗` icon
- CTA button: change `rounded-full` → `rounded-md` + use `variant="brand"` (from design system)
- CTA text: change "Get Started" → "Start Ranking →" or "Try Free →"
- On scroll: add `bg-background/95` backdrop ONLY — no blurring the logo weight

**Token diff:**

```diff
- "fixed top-6 z-50 px-4"  (floating pill)
+ "fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm"

- "rounded-full bg-white shadow-xl max-w-5xl py-3 px-6"
+ "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"

- CTA: rounded-full shadow-lg
+ CTA: rounded-md variant="brand" (inherits glow from design system)
```

---

## 2. Hero — `Hero.tsx`

### Current (problems)

- **Centered layout** (`items-center text-center`) — the #1 generic SaaS pattern
- **3 decorative blobs** (`animate-blob`, `blur-[100px]`, green/emerald fills) — the most overused SaaS decoration
- Top gradient: `bg-gradient-to-b from-white to-gray-50/50` — generic
- Product screenshot is **below the fold** (after CTAs)
- Badge copy: `"Content Decay Engine is live"` — a changelog entry, not positioning
- H1 is 2 lines

### Target Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  [Badge: → THE GEO ERA]                 ╔══════════════════════════╗  │
│                                          ║  [Product UI — right    ║  │
│  Get cited by ChatGPT,                  ║   column, full height,  ║  │
│  Perplexity, and Claude.                ║   macOS chrome frame]   ║  │
│                                          ║                         ║  │
│  [Sub: one paragraph, left-aligned]     ╚══════════════════════════╝  │
│                                                                        │
│  [Primary CTA]  [Secondary CTA]                                        │
│                                                                        │
│  ⭐⭐⭐⭐⭐ 127 teams · 14,300 articles optimized                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Changes:**

**Layout:**

```diff
- className="flex flex-col items-center text-center"
+ className="grid md:grid-cols-2 gap-12 items-center"
  Left column: all text content (left-aligned)
  Right column: product screenshot
```

**Background:**

```diff
- "bg-gradient-to-b from-white to-gray-50/50"
+ "bg-background"  (warm off-white from design system — no gradient)
+ add subtle dot texture: "tx-dot-bg" (new utility to create)
```

**Remove blobs entirely:**

```diff
- <div className="absolute top-40 left-[10%] w-[30rem] bg-green-400/10 animate-blob" />
- <div className="absolute top-20 right-[10%] w-[35rem] bg-emerald-400/10 animate-blob" />
- <div className="absolute top-[40%] left-[30%] bg-primary/5 animate-blob" />
+ {/* No decorative blobs */}
+ optionally: 2 small geometric SVG asterisks near headline, color text-primary/20
```

**Hero badge:**

```diff
- "New · Content Decay Engine is live"
+ "→ THE GEO ERA"   (era statement, like FlipAEO)
  style: border border-primary/20 text-primary bg-primary/5 rounded-md px-3 py-1
  (NOT rounded-full — square pill signals editorial, not startup)
```

**H1:**

```diff
- text-center, 2 lines with <br/>
+ text-left, single line, no <br/>
  font: font-poppins font-bold text-5xl md:text-6xl lg:text-7xl
  tracking-tight leading-[1.05]
```

**Product screenshot (right column):**

- Wrap in macOS-style window frame (red/yellow/green dots + URL bar)
- Keep the existing `<Image src="/screenshots/hero.webp">` — just move it to right column
- Frame: `rounded-2xl border border-border shadow-tx-lg overflow-hidden`
- Browser header: keep existing implementation (already has the dots + URL bar)

**Trust signal below CTA:**

```
Add after the CTA buttons:
<div class="flex items-center gap-2 mt-6 text-sm text-muted-foreground font-inter">
  ⭐⭐⭐⭐⭐
  <span>Trusted by <strong class="text-foreground">127 teams</strong></span>
  <span>·</span>
  <span><strong class="text-foreground">14,300+</strong> articles optimized</span>
</div>
```

---

## 3. Features Section — `Features.tsx` (41KB — major change)

### Current (problems)

- Almost certainly a large icon grid with colored icons, gradient cards, heavy shadows
- Generic SaaS card structure: icon → title → description
- Likely has colored bg fills and `shadow-md`/`shadow-lg` on cards

### Target Design — Bento Layout

```
┌─────────────────────────────┬──────────────────────────────┐
│ [ANALYSIS]                  │ [MONITORING]                 │
│ AI Visibility Score         │ Content Decay Engine         │
│                             │                              │
│ [product screenshot]        │ [product screenshot]         │
│                             │ Learn more →                 │
├─────────────────────────────┼──────────────────────────────┤
│ [RESEARCH]                  │ [OPTIMIZATION]               │
│ Keyword & Topic Gap         │ GEO Score                    │
│                             │                              │
│ [screenshot]                │ [screenshot]                 │
└─────────────────────────────┴──────────────────────────────┘
```

**Visual rules:**

```
Container: grid grid-cols-1 md:grid-cols-2
Cell border: border border-border (1px, no shadow)
Cell bg: bg-card (near-white from design system)
Cell padding: p-8 md:p-10
Cell radius: rounded-none (or rounded-sm — flat, newspaper feel)
Eyebrow: <p class="tx-eyebrow mb-3">ANALYSIS</p>  (from design system)
Title: font-poppins font-bold text-xl text-foreground
Description: font-inter text-muted-foreground text-sm leading-relaxed
Icon: REMOVE colored icons → use no icon, OR monochrome Lucide icon size-4
Screenshot: real product screenshot at bottom of cell, no additional frame needed
```

**What to remove:**

- Gradient backgrounds on feature cards
- Colored icon containers (`bg-primary/10` circles, etc.)
- `shadow-md`, `shadow-lg` on cards
- Hover elevation effects (`hover:shadow-xl`, `hover:-translate-y-1`)

**What to keep:**

- Hover: `hover:bg-muted/30` — subtle fill shift only, no elevation

---

## 4. Testimonials — `Testimonials.tsx`

### Current (problems)

- Standard 3-column grid: quote → name → avatar
- White cards with `shadow-sm hover:shadow-md` — completely generic
- `bg-gray-50` section background
- Author first (most trust-weak ordering)

### Target Design — Stat-First Cards (RankPill pattern)

```
┌──────────────────────────────┐
│ ↑ 312%                       │  ← HUGE outcome (font-bold text-4xl text-primary)
│ AI citations in 8 weeks      │  ← context (text-sm text-muted-foreground)
│                              │
│ "We fixed 3 articles and     │  ← quote (text-sm font-inter text-foreground/80)
│  citations appeared in       │
│  Perplexity within 2 weeks." │
│                              │
│ [●] Sarah K.                 │  ← avatar + name LAST
│     Content Lead, Clearbit   │
└──────────────────────────────┘
```

**Visual changes:**

```diff
- bg-white rounded-2xl shadow-sm hover:shadow-md  (elevated card)
+ border border-border bg-card rounded-lg         (flat, border-only)

- quote at top
+ stat number at top: text-4xl font-bold font-poppins text-primary

- "Success Stories" eyebrow badge with icon
+ plain tx-eyebrow: "RESULTS"  (no icon, no pill bg)

Section bg:
- bg-gray-50 (hardcoded)
+ bg-muted/40  (design system token)
```

---

## 5. CTA Section — `CTA.tsx`

### Current (problems)

- Green filled rounded container (`bg-primary rounded-[40px]`) inside a white section — looks like a floating island
- `"Ready to Supercharge Your Team's Productivity?"` — wrong product (team productivity ≠ GEO)
- Radial gradient overlay: generic
- White button on green background — low contrast editorial feel

### Target Design — Full-Bleed Dark Panel

```
████████████████████████████████████████████████████████████████
  Become the source AI recommends.

  Every article you publish without GEO is traffic
  ChatGPT gives to your competitor.

  [Start Ranking — Free Trial →]
████████████████████████████████████████████████████████████████
```

**Visual changes:**

```diff
- bg-white section wrapping a rounded bg-primary container
+ Full-width section: bg-foreground (deep forest ink — our darkest token)
  No padding wrapper. No rounded container. Edge to edge.

- rounded-[40px] float island
+ w-full, no border-radius, full-bleed dark section

- radial-gradient overlay
+ Remove gradient. Dark bg is the statement.

- "Ready to Supercharge Your Team's Productivity?"
+ "Become the source AI recommends."  (concrete, correct positioning)

CTA button:
- bg-white text-primary on green
+ variant="accent" (amber button on dark bg — maximum contrast)
  "Start Ranking — Free Trial →"
```

---

## 6. Pricing Section — `Pricing.tsx`

### Current (problems)

- `rounded-3xl p-8` cards — very rounded, startup feel
- Recommended card has `md:scale-110` scaling — aggressive pop-out
- `"Most Popular Plan"` green header band — looks like a sticker
- Section bg: `bg-white` — no separation from adjacent sections

### Target Design — Clean Editorial Cards

```
┌──────────────────┐  ┌══════════════════╗  ┌──────────────────┐
│ Starter          │  ║ Pro              ║  │ Team             │
│ $9/mo            │  ║ $29/mo           ║  │ $79/mo           │
│                  │  ║ ← RECOMMENDED    ║  │                  │
│ [features list]  │  ║ [features list]  ║  │ [features list]  │
│ [CTA]            │  ║ [CTA brand]      ║  │ [CTA]            │
└──────────────────┘  ╚══════════════════╝  └──────────────────┘
```

**Visual changes:**

```diff
Card shape:
- rounded-3xl p-8
+ rounded-xl p-8  (less rounding — editorial, not playful)

Recommended card:
- border-2 border-primary md:scale-110 z-10 (floating/scaling)
+ border-2 border-primary (border emphasis only, NO scale)
  add subtle: shadow-tx-glow-primary (design system glow)

"Most Popular" band:
- green filled h-10 div at top of card
+ replace with small amber badge INSIDE the card:
  <span class="tx-eyebrow-accent mb-2">Most Popular</span>
  (amber text, no bg fill) — cleaner

Section background:
- bg-white (same as features — no separation)
+ bg-muted/40 (alternating rhythm)

Monthly/Annual tabs:
- w-[300px] centered tabs
+ left-aligned or centered with less heavy styling — keep as-is, minor
```

---

## 7. Section Headings — All Sections

### Current (problems)

Every section heading has the same pattern:

```
[colored pill icon badge]
<h2> Title </h2>
<p> description </p>
```

The pill badges are all different but follow the same generic template.

### Target Design

Replace pill badges with the `tx-eyebrow` utility class (already in design system):

```diff
- <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border rounded-full text-xs ...">
-   <Icon className="w-3 h-3" />
-   Section Name
- </div>

+ <p className="tx-eyebrow mb-3">SECTION NAME</p>
  (Design system: small-caps or uppercase, text-primary/60, letter-spacing)
  No pill. No icon. No bg. Just the text.
```

**ALL section headings should use `<SectionHeading>` component** (already built):

```tsx
<SectionHeading
  eyebrow="RESULTS"
  heading="Why Teams Choose Texavor"
  description="Real outcomes from real teams."
  align="center"
/>
```

---

## 8. Footer — `Footer.tsx`

### Quick changes (lower priority)

- If using `bg-gray-950` or `bg-zinc-950` → change to `bg-foreground` (design system token)
- Footer links: `text-muted-foreground hover:text-foreground` (consistent token usage)
- No visual overhaul needed — focus on token consistency

---

## Master Visual Diff Summary

| Component        | Remove                                                        | Add                                                                 |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Nav**          | Floating pill, `shadow-xl`, `top-6`, `rounded-full`, ping dot | Full-width border-b, `top-0`, `rounded-md` CTA                      |
| **Hero**         | `text-center`, 3 blobs, bottom gradient, centered layout      | Left-split grid, dot texture, left-aligned, product in right column |
| **Hero badge**   | `"Content Decay Engine is live"` (changelog copy)             | `"→ THE GEO ERA"` (era framing)                                     |
| **Features**     | Icon grid, colored icons, `shadow-md`, gradient cards         | Bento 2-col border grid, eyebrow labels, product screenshots        |
| **Testimonials** | Quote-first, `shadow-sm hover:shadow-md`, `bg-gray-50`        | Stat-first, border-only cards, `bg-muted/40`                        |
| **CTA**          | Rounded island inside white section, wrong copy, gradient     | Full-bleed `bg-foreground`, correct copy, amber button              |
| **Pricing**      | `rounded-3xl`, scale-110 pop-out, green header band           | `rounded-xl`, border emphasis, amber eyebrow badge                  |
| **All headings** | Pill badge with icon                                          | `tx-eyebrow` text only, use `<SectionHeading>` component            |

---

## Global CSS Rules to Add

These apply site-wide — add to `globals.css`:

```css
/* Dot background texture — editorial depth without gradients */
.tx-dot-bg {
  background-image: radial-gradient(
    circle,
    hsl(var(--border)) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

/* Asterisk decoration — for hero flanking elements */
.tx-asterisk::before {
  content: "✳";
  font-size: 1.25rem;
  color: hsl(var(--primary) / 0.25);
  line-height: 1;
}
```

## Typography Rules

| Element           | Current                            | Target                                                                              |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Nav links         | `font-poppins text-sm font-medium` | `font-inter text-sm font-medium` (Inter for UI nav)                                 |
| Section eyebrows  | Pill badge with icon               | `tx-eyebrow` class — `font-inter text-xs uppercase tracking-widest text-primary/60` |
| H2 headings       | `font-poppins font-bold` ✅        | Keep — correct                                                                      |
| Card descriptions | Mixed                              | `font-inter text-sm text-muted-foreground leading-relaxed`                          |
| CTA heading       | `font-poppins` ✅                  | Keep — correct                                                                      |

> ⚠️ Do NOT use `text-gray-*`, `text-zinc-*`, `text-slate-*` anywhere. Use only design system tokens: `text-foreground`, `text-muted-foreground`, `text-primary`, `text-accent-foreground`, `text-card-foreground`.
