---
name: The Apps Garden
description: Clear, calm, approachable, and professional.
colors:
  green: "#007e68"
  green-deep: "#006b59"
  green-hover: "#005344"
  ink: "#172a25"
  muted: "#51645d"
  line: "#d7e2dc"
  surface: "#f5f8f6"
  white: "#fff"
  dark: "#102b25"
  sage: "#eaf4ee"
  light-button: "#dcf3e9"
  outline: "#b8cac0"
  error: "#923525"
typography:
  display:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(2.8rem, 4.6vw, 4.5rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-.035em"
  page-title:
    fontSize: "clamp(2.5rem, 4.8vw, 4.5rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-.035em"
  headline:
    fontSize: "clamp(1.875rem, 3.2vw, 2.5rem)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-.035em"
  title:
    fontSize: "clamp(1.2rem, 2vw, 1.6rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-.035em"
  body:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontSize: "16px"
    lineHeight: 1.55
  label:
    fontSize: ".72rem"
    fontWeight: 700
    letterSpacing: ".11em"
  introduction:
    fontSize: "1.125rem"
    lineHeight: 1.7
  reading:
    fontSize: "1.0625rem"
    lineHeight: 1.75
  utility:
    fontSize: ".8125rem"
  index:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: ".8rem"
    fontWeight: 600
rounded:
  field: "8px"
  menu: "16px"
  card: "18px"
  service: "20px"
  showcase: "22px"
  hero: "26px"
  pill: "999px"
spacing:
  small: "12px"
  grid: "16px"
  fields: "24px"
  card: "28px"
  section: "72px"
  section-mobile: "52px"
components:
  button-primary:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: ".65rem 1.45rem"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
    textColor: "{colors.white}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: ".65rem 1.45rem"
  button-light:
    backgroundColor: "{colors.light-button}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: ".65rem 1.45rem"
  feature-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "28px"
  field:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.field}"
    padding: "12px"
---

# Design System: The Apps Garden

## Overview

**Creative North Star: "The Apps Garden"**

Clear, calm, approachable, and professional. Generous space, green accents, and readable typography give practical information room to breathe. Components are approachable and restrained: pill buttons, softly rounded cards, and clear outlined fields.

This records the incumbent implementation, not a redesign. Sources are the shared visual-system layer in `css/production.css` and the later overrides in `css/responsive-overrides.css`. Legacy article utilities are not a second design direction. The site-wide refinement was browser-checked at mobile, intermediate, and desktop widths, including localized interactions and reduced motion.

**Key Characteristics:**
- Green accents on white and pale-green surfaces.
- Spacious layouts with strong typographic hierarchy.
- Mostly flat surfaces, with selective visual and navigation shadows.

## Colors

### Primary

**Garden Green** (`green`) carries links, labels, focus outlines, and active navigation. **Deep Evergreen** (`green-deep`) fills primary buttons; `green-hover` supplies their darker hover state.

### Neutral

**Soft Sage** (`sage`) supports pale-green panels and outline-button hover. White is the main canvas; `surface` distinguishes soft sections. `ink` and `muted` separate primary and supporting text; `line` defines boundaries. `dark` provides deep-green sections and image frames. The light-button tone provides actions on dark sections. `error` marks invalid form fields and submission errors.

## Typography

Inter with Helvetica Neue, Arial, and sans-serif fallbacks is the shared family. Headings use semibold weight and tight tracking; body text stays open and readable. Monospace accents are limited to indices and small technical labels.

Frontmatter display values describe the current homepage hero. Secondary page titles use the shared page-title role; section headings use the headline role. Article subheadings retain their smaller reading hierarchy. The root size is consistently (16px), isolated from the legacy utility layer. Homepage introductions use the introduction role, falling to (1.0625rem) on small screens; other page introductions retain (1.18rem). Article text uses the reading role and is constrained to (800px). Redundant brand/category eyebrows in secondary-page heroes are hidden. Existing contextual labels elsewhere remain uppercase.

## Layout

Shared header/footer containers and the homepage hero cap at (1200px). Secondary-page heroes and section content cap at (1080px), except the four-column team grid which retains (1200px). Article bodies retain (800px), and the blog list retains (850px). Total horizontal gutters are (64px), reduced to (36px) at the (640px) breakpoint. Sections use the frontmatter spacing values. The homepage hero pairs copy with a visual; product showcases use two columns. Balanced feature grids use two columns; process steps use four.

At (900px), navigation switches to a disclosure menu, split layouts stack, and steps use two columns. At (640px), feature grids and steps stack, action buttons fill their row, and forms use one column. Team grids use additional (1000px) and (640px) breakpoints. Preserve page-specific reading widths and the existing responsive overrides.

## Elevation & Depth

Mostly flat: borders and tonal sections provide structure. Prominent hero visuals use `0 24px 70px rgba(16,43,37,.14)`; floating mobile navigation uses `0 18px 40px rgba(16,43,37,.12)`. The animated workflow contains its own stronger card shadows; these are illustration effects, not default card styling.

## Shapes

Pill actions contrast with softly rounded rectangular cards and media frames. Fields use the smaller field radius. Borders are generally (1px). Product showcases clip imagery within their rounded frame; service pricing highlights use a (2px) green border.

## Components

### Buttons

Primary, outline, and light variants share centered text, semibold weight, a minimum height of (48px), and pill corners. Primary hover darkens; outline hover gains a sage background and green border; light hover becomes white. Color transitions last (.18s). Links and button elements receive a (3px) green focus outline with (4px) offset.

### Cards / Containers

Feature cards use white, a subtle border, and the frontmatter card radius and padding. Mobile padding becomes (24px). Service and pricing cards use the service radius. Do not apply illustration shadows to ordinary information cards.

### Inputs / Fields

White fields have a subtle border, a minimum height of (48px), and inherited typography. Focus uses a (3px) green outline with (3px) offset. Invalid fields use the error color; disabled submission buttons use reduced opacity and a waiting cursor.

### Navigation

Desktop navigation uses semibold, unadorned links; active and hovered items turn green. Mobile navigation is a native disclosure with a bordered pill summary and floating white panel. Touch links and the summary have at least (44px) height. JavaScript adds Escape, outside-click, focus-departure, and desktop-resize dismissal without replacing native disclosure behavior. Preserve the logo mark and wordmark together.

### Process and media

Numbered steps use top borders and green monospace indices. Product imagery fills showcase panels. Product headings and dark-section headings use a (20px) gap before supporting text; feature-card titles use (16px). Existing media hovers move icons or gently scale images; the hero workflow animates inputs into reviewed outcomes. A localized pause/resume button controls the homepage workflow. Reduced-motion overrides remove movement, hide the pause control, and present workflow outcomes statically. Cookie preferences live in the footer rather than covering page content; the consent dialog returns focus without scrolling the page.

## Do's and Don'ts

### Do:
- **Do** reuse the shared green roles, typography, and responsive spacing.
- **Do** retain visible keyboard focus and reduced-motion behavior.
- **Do** preserve rounded image clipping and the logo/wordmark relationship.

### Don't:
- **Don't** turn illustration-specific colors, gradients, or shadows into default component styling.
- **Don't** override the responsive layer with desktop-only assumptions.
- **Don't** treat legacy utility styles as a new visual direction.
