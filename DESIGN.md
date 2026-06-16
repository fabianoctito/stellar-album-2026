---
name: Stellar Album
description: A playful paper sticker-album dApp that teaches the fungibility spectrum.
colors:
  leaf: "oklch(0.58 0.15 150)"
  leaf-deep: "oklch(0.45 0.13 152)"
  leaf-tint: "oklch(0.93 0.05 150)"
  paper: "oklch(0.975 0.008 95)"
  cream: "oklch(0.945 0.018 92)"
  kraft: "oklch(0.9 0.032 84)"
  edge: "oklch(0.86 0.03 90)"
  ink: "oklch(0.27 0.02 150)"
  ink-soft: "oklch(0.52 0.022 150)"
  rare: "oklch(0.52 0.13 240)"
  rare-tint: "oklch(0.93 0.04 240)"
  gold: "oklch(0.72 0.13 85)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  control: "0.75rem"
  card: "1rem"
  book: "1.75rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.leaf-deep}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "1rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
  nav-pill-active:
    backgroundColor: "{colors.leaf-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.875rem"
  coin-pill:
    backgroundColor: "{colors.leaf-tint}"
    textColor: "{colors.leaf-deep}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  sticker-card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

# Design System: Stellar Album

## 1. Overview

**Creative North Star: "The Schoolyard Sticker Book"**

This is the Panini album you filled at recess, rebuilt for the browser: warm paper, a forest-green cover, foil that catches the light on the rare ones, and the small thrill of pressing a sticker into its slot. The surface is light because the scene is a bright desk in the afternoon, not a trading terminal at 2am. Everything is tactile. Buttons look pressable, empty slots look debossed into the page, packs look like they want to be torn.

The audience is developers, so the craft has to be real, but the feeling is play. The joy of collecting carries a serious lesson about fungibility, and the interface teaches it by contrast rather than by label: a coin reads as a quantity, a sticker reads as an object with a face and a rarity, the album reads as the one unique thing you own. If those three ever look like the same kind of element, the system has failed.

It explicitly rejects the reflexes of its category. It is not a crypto dapp (no neon on black, no glass, no glow). It is not a SaaS dashboard (no identical card grids, no hero-metric tiles, no purple gradients). And it is not childish (playful is the goal, cartoonish is the failure).

**Key Characteristics:**
- Warm paper light theme, every neutral tinted toward the green brand hue.
- One committed accent (forest leaf-green) plus a deliberate three-tier rarity palette.
- Chunky grotesque display voice over a quiet, dependable sans for everything functional.
- Tactile depth: things press in, lift, and stamp; motion is bold at the moments that matter.

## 2. Colors

A committed palette: warm paper neutrals carry the surface, one leaf-green accent carries every action, and rarity is its own small system of meaningful roles.

### Primary
- **Leaf Green** (`oklch(0.58 0.15 150)`): the brand. Active nav, focus rings, progress fill, the coin star, the pack wrapper.
- **Deep Leaf** (`oklch(0.45 0.13 152)`): the pressable green. Primary button backgrounds and their resting state; darker so paper-white text clears AA.
- **Leaf Wash** (`oklch(0.93 0.05 150)`): the quiet brand tint. Coin balance pill, secondary "stick" chips, gentle success notices.

### Secondary
- **Rare Blue** (`oklch(0.52 0.13 240)`): the cool counterpoint reserved for the rare rarity tier, so it pops against the warm field. Never used for chrome or actions.
- **Foil Gold** (`oklch(0.72 0.13 85)`): the legendary base, under a moving holographic sheen. The wax-seal stamp on a completed album page.

### Neutral
- **Paper** (`oklch(0.975 0.008 95)`): the page. Also the text color on green.
- **Cream** (`oklch(0.945 0.018 92)`): panels, the album leaf, sticker faces.
- **Kraft** (`oklch(0.9 0.032 84)`): the counter strip, the book cover, the top bar. The deepest paper layer.
- **Edge** (`oklch(0.86 0.03 90)`): hairline borders and dashed empty-slot outlines.
- **Ink** (`oklch(0.27 0.02 150)`): primary text, tinted green so it never reads as cold black.
- **Soft Ink** (`oklch(0.52 0.022 150)`): secondary text, captions, slot numbers.

### Named Rules
**The Three Kinds Rule.** A coin, a sticker, and the album must never read as the same kind of element. The coin is a number in a tint pill, a sticker is a faced card with a rarity, the album is a bound book. The visual gap between them is the lesson.

**The Rarity-Is-Data Rule.** Rare blue and foil gold belong to stickers only. They are never spent on buttons, chrome, or decoration. If gold appears on a button, it is wrong.

## 3. Typography

**Display Font:** Bricolage Grotesque (with ui-sans-serif fallback)
**Body Font:** Inter (with system-ui fallback)

**Character:** Bricolage is a chunky, characterful grotesque that carries the collectible personality; Inter stays quiet and dependable so labels, data, and controls never compete for attention. The contrast between the two is the hierarchy.

### Hierarchy
- **Display** (800, `clamp(2rem, 5vw, 3rem)`, 1.05, -0.02em): page titles, the wordmark, the reveal headline. Bricolage only.
- **Title** (700, 1.5rem, 1.2): section heads, hero sticker names, the green CTA label. Bricolage.
- **Body** (400, 1rem, 1.6): teaching copy and descriptions. Inter, capped at roughly 65 to 75 characters.
- **Label** (600, 0.75rem, 0.04em, often uppercase): tier names, counters, field labels, page numbers. Inter.

### Named Rules
**The Quiet-Controls Rule.** Display type is for wordmark, titles, and celebratory moments. Buttons, inputs, table data, and form labels stay Inter. A display font in a functional label is forbidden.

## 4. Elevation

Depth is physical, not ambient. This is paper, so things either press into the page or lift off it; there is no decorative glow and no glass. Empty album slots are debossed with an inset shadow (they look stamped into the leaf). Filled stickers and live buttons cast a small drop shadow (they sit on top). The book itself carries the heaviest shadow, because it is the thickest object on the desk.

### Shadow Vocabulary
- **Debossed pocket** (`box-shadow: inset 0 3px 12px oklch(0.5 0.02 150 / 0.12)`): empty hero and supporting slots; reads as pressed into the page.
- **Lifted control** (`box-shadow: 0 4px 6px -1px oklch(0.27 0.02 150 / 0.1)`): primary buttons, filled stickers, nav arrows.
- **Book** (`box-shadow: 0 20px 40px -12px oklch(0.27 0.02 150 / 0.2)`): the bound album cover and the connect-screen pack.

### Named Rules
**The Pressed-Paper Rule.** Empty equals pressed in (inset). Earned or actionable equals lifted out (drop shadow). A flat element with neither is unfinished.

## 5. Components

Components are tactile and playful: they look pressable and stickable, with bold celebratory motion saved for the moments that earn it (a legendary pull, a page completed).

### Buttons
- **Shape:** gently rounded (0.75rem), pill for nav and balance chips.
- **Primary:** Deep Leaf background, Paper text, Title type, `1rem 1.5rem` padding, lifted shadow. This is the one loud action on a screen (rip a pack, connect, start album).
- **Hover / Focus:** background lightens to Leaf Green; `focus-visible` shows a 2px Leaf outline with offset. Transitions are 150 to 250ms, color and transform only.
- **Secondary (counter tiles):** Paper background, Ink text, hairline Edge ring that warms to Leaf on hover. Quiet on purpose; claim and buy sit beside the hero action without competing.

### Chips
- **Coin pill:** Leaf Wash background, Deep Leaf text, pill radius. The fungible balance, shown as a quantity.
- **Stick chip:** Leaf Wash, Deep Leaf, fills to Leaf Green with Paper text on hover. The call to press a sticker in.

### Cards / Containers
- **Corner Style:** Card radius (1rem) for panels, Book radius (1.75rem) for the album cover.
- **Background:** Cream panels on a Paper page; Kraft for the counter and top bar.
- **Shadow Strategy:** see Elevation. Panels are flat with a hairline Edge ring; the book is the only heavily-shadowed surface.
- **Internal Padding:** generous and varied (1.25rem to 2rem); never uniform.

### Inputs / Fields
- **Style:** Paper background, hairline Edge ring, Control radius. Labels are uppercase Inter in Soft Ink above the field.
- **Focus:** 2px Leaf outline.

### Navigation
- **Style:** pill tabs in the Kraft top bar. Inactive is Soft Ink on transparent; active is Paper on Deep Leaf. Routes cross-fade and slide on change.

### The Sticker (signature)
The collectible itself: a 3:4 faced card. Common is Cream with an Edge hairline; Rare is Rare-Tint with a Rare ring; Legendary is Foil Gold under a moving holographic sheen. Each carries a name, a rarity tier in words, and a tier glyph (●/◆/✦) so rarity never relies on color alone. Duplicates stack with an Ink count badge.

### The Album (signature)
A bound book of turnable leaves. Each leaf is headlined by its rarest sticker in a large hero slot, with a supporting grid beside it. Empty slots are debossed pockets; pages turn with a bold 3D flip; sticking a sticker stamps it in, and completing a page drops a foil wax seal. This is the emotional center of the product.

## 6. Do's and Don'ts

### Do:
- **Do** keep the coin a quantity, the sticker an object, the album the one unique thing. The Three Kinds Rule is the whole point.
- **Do** tint every neutral toward the green brand hue (chroma 0.005 to 0.01); never reach for pure black or white.
- **Do** reserve Rare Blue and Foil Gold for stickers only (the Rarity-Is-Data Rule).
- **Do** press empty things in and lift earned things out (the Pressed-Paper Rule).
- **Do** spend the bold motion budget on the moments that matter: the pack rip, the stick, a legendary pull, a completed page. Respect `prefers-reduced-motion` everywhere.
- **Do** keep functional UI in Inter; let Bricolage carry the personality in titles and celebrations.

### Don't:
- **Don't** drift toward generic web3: no neon on black, no glow, no glassmorphism, no "Connect Wallet" as the entire personality.
- **Don't** build a corporate SaaS dashboard: no identical card grids, no hero-metric tiles, no purple gradients, no sidebar-and-topbar app shell.
- **Don't** tip into childish: no Comic Sans energy, no primary-color overload, no balloon buttons. Playful, not cartoonish.
- **Don't** use a `border-left` or `border-right` colored stripe as an accent; use full borders, tints, or a tier glyph.
- **Don't** put a gradient on text or a display font on a functional label.
- **Don't** animate layout properties or use bounce/elastic easing; ease out with exponential curves.
