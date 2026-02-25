# Texavor Design System Guide

> **⚠️ AI RULE**: Read this entire file before generating ANY UI component or editing ANY landing page file in this project. Every decision here is intentional and non-negotiable.

---

## 1. Design Direction

**"Editorial Precision × Organic Depth"**

Texavor is a serious research tool for content professionals — not a generic SaaS. The design must feel like it was crafted by someone with taste, not auto-generated.

**Non-negotiables:**

- Never use pure white (`#fff`) as a background — use `bg-background` which is warm off-white
- Never use `text-gray-*` — use `text-foreground`, `text-muted-foreground`
- Never hardcode hex or rgb/rgba colors inline — always use CSS token classes
- Never use generic stock gradients (blue-purple, etc.) — use the brand palette only

---

## 2. Color Token Reference

All colors live in `app/globals.css` as HSL variables. Use Tailwind token classes — never hardcode values.

| Token class              | Role                              | Use when                                 |
| ------------------------ | --------------------------------- | ---------------------------------------- |
| `bg-background`          | Warm off-white / Deep forest dark | Page base, section default               |
| `bg-card`                | Card surface                      | Cards, panels, modals                    |
| `bg-muted`               | Subtle fill                       | Hover states, muted sections             |
| `bg-primary`             | Deep forest green                 | Primary buttons, strong CTAs             |
| `bg-accent`              | **Amber**                         | Accent badges, contrast CTAs, highlights |
| `text-foreground`        | Near-black / Near-white           | Main body text, headings                 |
| `text-muted-foreground`  | Secondary text                    | Descriptions, captions                   |
| `text-primary`           | Forest green                      | Links, icons, labels                     |
| `text-accent-foreground` | Dark on amber                     | Text on amber bg                         |
| `border-border`          | Subtle border                     | Cards, dividers, inputs                  |
| `ring-ring`              | Focus ring                        | Focus states                             |

### Amber Accent Usage Rules

The amber accent (`bg-accent`, `text-accent`) is the **visual tension** color. Use it:

- ✅ In eyebrow labels on sections with green backgrounds
- ✅ For badge/pill callouts ("New", "Live", highlighted stats)
- ✅ For secondary CTA buttons that appear alongside a green primary CTA
- ❌ Never as a background for large areas
- ❌ Never more than once per fold/viewport

---

## 3. Typography System

| Font variable | Tailwind class                   | Role                        | RULE                  |
| ------------- | -------------------------------- | --------------------------- | --------------------- |
| Poppins       | `font-poppins` or `font-display` | Display headlines, h1/h2/h3 | **Only for headings** |
| Inter         | `font-inter` or `font-body`      | Body copy, UI labels, nav   | **All body text**     |
| Geist Mono    | `font-mono` or `font-data`       | Metrics, stats, code, data  | **Numbers/data only** |

### Type Scale

```
Hero h1:      text-5xl md:text-6xl lg:text-7xl   font-poppins font-bold   leading-[1.05]  tracking-tight
Section h2:   text-3xl sm:text-4xl md:text-5xl   font-poppins font-bold   leading-[1.1]   tracking-tight
Sub-section:  text-2xl md:text-3xl               font-poppins font-semibold
Card title:   text-xl md:text-2xl                font-poppins font-semibold
Body large:   text-lg md:text-xl                 font-inter   font-normal  leading-relaxed
Body:         text-base                          font-inter   font-normal  leading-relaxed
Body small:   text-sm                            font-inter   font-normal
Eyebrow:      text-xs font-semibold uppercase tracking-widest  font-inter
Mono/data:    text-sm font-mono                  (metrics, numbers in cards)
```

### ❌ Anti-patterns

- `font-bold text-2xl text-gray-900` ← wrong font token, wrong color token
- `className="text-4xl font-black"` without `font-poppins` ← no font specified
- Body text in Poppins ← headings only

---

## 4. Component Rules

### Buttons

**Always use the `<Button>` component with a named variant. Never write custom button classes.**

| Variant       | Use case                                                |
| ------------- | ------------------------------------------------------- |
| `brand`       | Hero CTA, section primary CTA — strongest visual weight |
| `accent`      | Secondary CTA on a green/dark section for contrast      |
| `outline`     | Secondary action alongside a primary button             |
| `ghost-brand` | Soft action in nav, cards, low-emphasis links           |
| `secondary`   | Tertiary/muted actions                                  |
| `destructive` | Delete, cancel, dangerous actions only                  |

**Sizes:** `sm` / `default` / `lg` / `xl`

### Sections

**Always use `<SectionWrapper>` — never ad-hoc `<section className="py-24 ...">`.**

```tsx
// ✅ Correct
<SectionWrapper size="md" background="muted" withGrid>
  <div className="tx-container">...</div>
</SectionWrapper>

// ❌ Wrong
<section className="py-24 px-4 bg-gray-50">...</section>
```

### Headings

**Always use `<SectionHeading>` for section h2 blocks — never raw h2 tags.**

```tsx
// ✅ Correct
<SectionHeading
  eyebrow="How It Works"
  heading="Write once. Rank everywhere."
  description="Texavor handles the research..."
/>

// ❌ Wrong
<h2 className="text-4xl font-bold">How It Works</h2>
```

### Cards

Use the `tx-card` CSS class on the wrapper div, or use `<Card>` from shadcn:

```tsx
<div className="tx-card">...</div>
// or
<Card className="shadow-tx-sm hover:shadow-tx-md transition-shadow">...</Card>
```

---

## 5. Layout & Spacing System

### Section Wrapper Sizes

| Size           | Classes          |
| -------------- | ---------------- |
| `sm`           | `py-14 md:py-20` |
| `md` (default) | `py-20 md:py-28` |
| `lg`           | `py-28 md:py-36` |

### Container Widths

| Class                 | Max width   | Use for                |
| --------------------- | ----------- | ---------------------- |
| `tx-container`        | `max-w-7xl` | Standard content areas |
| `tx-container-narrow` | `max-w-4xl` | Centered text content  |

**Rule:** Always add `px-4` on the section, `mx-auto` on the container inside it.

---

## 6. Shadows

Never write raw `box-shadow` values. Use these Tailwind shadow tokens:

| Class                    | Use                              |
| ------------------------ | -------------------------------- |
| `shadow-tx-sm`           | Cards, inputs, subtle elevation  |
| `shadow-tx-md`           | Hover state, raised elements     |
| `shadow-tx-lg`           | Modals, dropdowns, popovers      |
| `shadow-tx-glow-primary` | Primary buttons, featured cards  |
| `shadow-tx-glow-accent`  | Accent buttons, amber highlights |

---

## 7. Dark Mode Rules

- Always test both modes — every component must look intentional in dark mode
- Never rely on `dark:text-white` or `dark:bg-black` — use token classes
- Dark bg is `hsl(160, 18%, 5%)` — a very dark forest, NOT blue-black
- Primary in dark is brighter green (`hsl(148, 55%, 50%)`) — adjust contrast accordingly

---

## 8. Special Utilities

| Class               | Effect                                                  |
| ------------------- | ------------------------------------------------------- |
| `tx-eyebrow`        | Green uppercase tracking label (above section headings) |
| `tx-eyebrow-accent` | Amber uppercase tracking label                          |
| `tx-gradient-text`  | Green→Amber gradient text — use sparingly, hero only    |
| `tx-accent-text`    | Amber colored text for inline emphasis                  |
| `tx-grid-bg`        | Subtle dot grid background texture                      |
| `tx-glow-primary`   | Green glow via box-shadow                               |
| `tx-glow-accent`    | Amber glow via box-shadow                               |

---

## 9. Visual Anti-Pattern Checklist

Before submitting any UI code, verify:

- [ ] No `text-gray-*` or `text-zinc-*` — use `text-foreground` / `text-muted-foreground`
- [ ] No `bg-white` or `bg-black` — use `bg-background` / `bg-card`
- [ ] No `bg-gray-*` — use `bg-muted` or `bg-secondary`
- [ ] No hardcoded `#hex` or `rgb()` in className — use token classes
- [ ] No raw `<section className="py-24">` — use `<SectionWrapper>`
- [ ] No raw `<h2 className="text-4xl">` — use `<SectionHeading>`
- [ ] Buttons use named variants, not ad-hoc className colors
- [ ] Headings use `font-poppins`, body uses `font-inter`, data uses `font-mono`
- [ ] Copy is on-brand: about AI search, GEO, content ranking — NOT "team productivity"

---

## 10. Brand Voice (Copy Rules)

Texavor helps writers and content teams **rank in AI search engines** (ChatGPT, Perplexity, Claude). This is the value prop.

**Use this language:**

- "Rank in AI search" / "AI visibility" / "GEO (Generative Engine Optimization)"
- "Content decay" / "Share of Voice" / "AI citations"
- "Research-first" / "Citation-ready content"

**Never use:**

- "Team productivity" ← wrong entirely
- "Supercharge your workflow" ← generic
- "AI-powered writing assistant" ← that's not what this is
- "Rank on Google" ← wrong channel focus
