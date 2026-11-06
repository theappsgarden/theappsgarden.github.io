---
name: The Apps Garden
description: A cinematic botanical homepage alongside a calm shared site system.
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
  home-forest: "#102e25"
  home-ink: "#172c25"
  home-muted: "#53665e"
  home-line: "#dbe3dc"
  home-cream: "#f2ead7"
  home-mint: "#9bd9b8"
  home-light-text: "#e8f2eb"
  home-muted-light: "#c3d9ca"
  home-footer: "#0b211b"
  task-paper: "#f7f3e7"
  task-ink: "#596050"
  task-sage: "#d8ebde"
  task-result: "#173f2c"
  home-field-line: "#6f8d7e"
  home-field-fill: "#ffffff08"
  home-error: "#ffd0ba"
typography:
  display:
    fontFamily: '"Hanken Grotesk", "Helvetica Neue", sans-serif'
    fontSize: "clamp(3.25rem, 5.3vw, 5.65rem)"
    fontWeight: 400
    lineHeight: 1.055
    letterSpacing: "-.035em"
  home-headline:
    fontFamily: '"Hanken Grotesk", "Helvetica Neue", sans-serif'
    fontSize: "clamp(2.25rem, 3.7vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-.035em"
  home-body:
    fontFamily: '"Hanken Grotesk", "Helvetica Neue", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  home-title:
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-.02em"
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
  home-field: "3px"
  task-mobile: "7px"
  home-media: "10px"
  home-case: "12px"
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
  home-section: "120px"
  home-section-tablet: "88px"
  home-section-mobile: "64px"
components:
  home-button:
    backgroundColor: "{colors.white}"
    textColor: "{colors.home-forest}"
    rounded: "{rounded.pill}"
    padding: "13px 23px"
    height: "48px"
  home-field:
    backgroundColor: "{colors.home-field-fill}"
    textColor: "{colors.white}"
    rounded: "{rounded.home-field}"
    padding: "12px"
  task-input:
    backgroundColor: "{colors.task-paper}"
    textColor: "{colors.task-ink}"
    rounded: "{rounded.home-media}"
    padding: "16px 18px"
  task-output:
    backgroundColor: "{colors.task-sage}"
    textColor: "{colors.task-result}"
    rounded: "{rounded.home-media}"
    padding: "16px 18px"
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

The homepages now use the user-approved botanical demo: full-width forest-green fields, tactile editorial artwork, lighter grotesk headings and a warm cream team section. This is a homepage-only rollout; secondary pages keep the established shared system. New homepage tokens are explicitly prefixed so the two scopes are not accidentally mixed.

Sources are the shared visual-system layer and scoped homepage layer in `css/production.css`, followed by `css/responsive-overrides.css`. The root and ES/EN/CA homepages were browser-checked at 320, 390, 768, 1024 and 1440px, with native navigation, mocked contact submission, reduced motion and no JavaScript. Legacy article utilities are not a separate design direction.

**Key Characteristics:**
- Green accents on white and pale-green surfaces; forest-green fields and cream on the homepages.
- Spacious layouts with strong typographic hierarchy, lighter Hanken Grotesk on the homepages.
- Mostly flat surfaces, with selective visual and navigation shadows.
- Existing tactile artwork and complete portraits, not generic decorative UI.

## Colors

### Primary

**Garden Green** (`green`) carries links, labels, focus outlines, and active navigation. **Deep Evergreen** (`green-deep`) fills primary buttons; `green-hover` supplies their darker hover state.

### Neutral

**Soft Sage** (`sage`) supports pale-green panels and outline-button hover. White is the main canvas; `surface` distinguishes soft sections. `ink` and `muted` separate primary and supporting text; `line` defines boundaries. `dark` provides deep-green sections and image frames. The light-button tone provides actions on dark sections. `error` marks invalid form fields and submission errors.

### Homepage palette

Forest, green ink, muted text and borders have their own homepage roles. Cream is reserved for the team field; mint supports focus and the botanical illustration. Task-paper inputs lead to task-sage outputs with dark result text. Dark sections use light, green-tinted text. The deeper footer anchors the page. Fields use the home field line for a visible boundary and the lighter home error tone on dark surfaces.

## Typography

The homepage display, headline and body roles use self-hosted Hanken Grotesk, licensed under SIL OFL 1.1 in `fonts/hanken-grotesk/`. Display and section headings use (400), titles (500), and prices (600). Homepage hero copy uses (1rem/1.65), reduced to (.9375rem) on phones. Mobile display uses `clamp(2.65rem,10.8vw,4rem)`; section headings become (2.25rem). Headings stay light and open rather than semibold. Ordered method indices use the same family, not monospace.

Inter with Helvetica Neue, Arial, and sans-serif fallbacks is the shared family. Headings use semibold weight and tight tracking; body text stays open and readable. Monospace accents are limited to indices and small technical labels.

Frontmatter display values describe the redesigned homepage hero. Secondary page titles use the shared page-title role; their section headings use the headline role. Article subheadings retain their smaller reading hierarchy. The root size is consistently (16px), isolated from the legacy utility layer. The introduction role remains available to legacy layouts; secondary-page introductions retain (1.18rem). Article text uses the reading role and is constrained to (800px). Redundant brand/category eyebrows in secondary-page heroes are hidden. Existing contextual labels elsewhere remain uppercase.

## Layout

Homepages cap all content, navigation and team containers at (1440px), with total horizontal gutters of (112px), then (80px) at 1200px, (64px) at 900px and (40px) at 640px. Their sections use (120px), then (88px) and (64px) vertical padding. The hero artwork fills its section rather than sitting inside a card. Desktop service rows are open four-column lists; use cases use four columns, products three, and team portraits four beside introductory copy. Cases become two columns at 1000px and one at 640px; products become one at 640px. Team copy moves above portraits at 1200px; portraits become two columns on phones. Contact content stacks on phones.

Above (1100px), enhanced use cases become expanding panels: the active example takes (2.4fr), the others (1fr), interpolated over (.7s). Separate native buttons expand; the original links still navigate. Below that width, without JavaScript, or with reduced motion, the original complete grid remains. Selecting with keyboard focus also opens the example and restores its link to the tab order.

Homepage navigation becomes fixed only after progressive enhancement. The desktop method stage is sticky with (210svh) scroll distance only above 900px and 680px height, without reduced motion. Smaller screens, short windows, reduced motion and no-JS use static content with all explanations initially open. Never impose fixed desktop scroll choreography on phones.

Shared secondary-page header/footer containers cap at (1200px). Secondary-page heroes and section content cap at (1080px), except the four-column team grid which retains (1200px). Article bodies retain (800px), and the blog list retains (850px). Total horizontal gutters are (64px), reduced to (36px) at the (640px) breakpoint. Sections use the frontmatter spacing values. Secondary-page product showcases use two columns. Balanced feature grids use two columns; process steps use four.

At (900px), navigation switches to a disclosure menu, split layouts stack, and steps use two columns. At (640px), feature grids and steps stack, action buttons fill their row, and forms use one column. Team grids use additional (1000px) and (640px) breakpoints. Preserve page-specific reading widths and the existing responsive overrides.

## Elevation & Depth

Mostly flat: borders and tonal sections provide structure. Homepage content sits directly on its field; hero depth comes from the existing illustration, not invented card chrome. Use-case hover adds `0 10px 28px #102e250d`. Scrolled navigation uses a translucent forest/white surface with (14px) backdrop blur to maintain legibility, not as a general decoration. Prominent hero visuals use `0 24px 70px rgba(16,43,37,.14)`; floating mobile navigation uses `0 18px 40px rgba(16,43,37,.12)`. The animated workflow contains its own stronger card shadows; these are illustration effects, not default card styling.

## Shapes

Homepages use tighter image corners (10px), use-case containers (12px), task rows (10px, 7px on phones) and dark form fields (3px). Pill actions remain common to both scopes. Secondary-page pill actions contrast with softly rounded rectangular cards and media frames. Fields use the smaller field radius. Borders are generally (1px). Product showcases clip imagery within their rounded frame; service pricing highlights use a (2px) green border.

## Components

### Buttons

Homepage primary actions on forest fields are white with forest text, (500) weight, (48px) minimum height and (13px 23px) padding. The secondary hero action is transparent with a light border. Their hover states keep readable foregrounds; mobile menu primary actions explicitly retain white text on dark green.

Shared secondary-page primary, outline, and light variants use centered text, semibold weight, a minimum height of (48px), and pill corners. Primary hover darkens; outline hover gains a sage background and green border; light hover becomes white. Color transitions last (.18s). Links and button elements receive a (3px) green focus outline with (4px) offset.

### Cards / Containers

Feature cards use white, a subtle border, and the frontmatter card radius and padding. Mobile padding becomes (24px). Service and pricing cards use the service radius. Do not apply illustration shadows to ordinary information cards.

### Inputs / Fields

Homepage fields sit on forest with a faint light fill, a visible home-field-line border, white text, mint focus and warm light error text. Labels and privacy disclosures remain readable; success/error status is still announced. Fields retain the (48px) minimum height and native controls.

Shared white fields have a subtle border, a minimum height of (48px), and inherited typography. Focus uses a (3px) green outline with (3px) offset. Invalid fields use the error color; disabled submission buttons use reduced opacity and a waiting cursor.

### Navigation

Homepage navigation uses regular-weight links and a compact wordmark. Its initial white-on-forest treatment switches to green ink on white over light sections. Language links remain available on desktop and inside the mobile disclosure. Without JavaScript the header stays at the top, rather than floating with the wrong contrast.

Secondary-page desktop navigation uses semibold, unadorned links; active and hovered items turn green. Mobile navigation is a native disclosure with a bordered pill summary and floating white panel. Touch links and the summary have at least (44px) height. JavaScript adds Escape, outside-click, focus-departure, and desktop-resize dismissal without replacing native disclosure behavior. Preserve the logo mark and wordmark together.

### Process and media

The homepage's numbered method uses native disclosures and an original botanical SVG. On desktop, the illustration is vertically centered with the surrounding text and steps. Scrolling first drops the logo's two chevrons into the pot, then draws the stem and scales leaves outward from their actual attachment points; it does not crop a static image to imitate growth. Manual selection takes priority until the visitor leaves the section. Five task pairs resolve as one staged sequence: inputs settle, connecting arrows extend, results move into place and checks appear, staggered by (150ms). Text remains available to assistive technology throughout.

Headings type on entry, keeping whole words together and a stable accessible heading name. Character beats cap at (32ms), with a maximum total of (1450ms). Each heading owns one real travelling caret, positioned from the characters' CSS animation clock rather than a separate pseudo-cursor on every letter. The caret is removed on completion, cancellation, reduced motion or a hidden tab; per-letter cursors must not be reintroduced. Supporting hero copy arrives in three beats; images use their own (950ms) downward, soft-focus entrance. Figures count over (1500ms), preserving the original localized punctuation and final-width slots; screen readers retain the final values rather than announcing each frame.

Forest fields and the hero carry an original, pointer-responsive procedural WebGL current. One shared context draws only visible fields, at no more than (30fps) and (640 × 480px) per surface. Initialization waits until the initial type sequence has had first paint. No background pause/resume buttons are shown in the hero or footer. Rendering stops offscreen or in hidden tabs and respects reduced-motion preferences. No WebGL means the original forest fields, not broken content. This is the only nonessential looping motion.

Reduced-motion changes immediately complete text, figures and method explanations, cancel spatial sequences, remove the ambient fields and restore the complete case grid. Both homepage controllers share the preference transition. No-JS content, native disclosures, links, form and existing image assets remain the fallback.

Legacy numbered steps use top borders and green monospace indices. Product imagery fills showcase panels. Product headings and dark-section headings use a (20px) gap before supporting text; feature-card titles use (16px). Existing media hovers move icons or gently scale images; the retained legacy workflow component animates inputs into reviewed outcomes and has a localized pause/resume control. It is no longer the homepage hero. Reduced-motion overrides remove movement, hide the pause control, and present workflow outcomes statically. Cookie preferences live in the footer rather than covering page content; the consent dialog returns focus without scrolling the page.

## Do's and Don'ts

### Do:
- **Do** reuse the shared green roles, typography, and responsive spacing.
- **Do** retain visible keyboard focus and reduced-motion behavior.
- **Do** preserve rounded image clipping and the logo/wordmark relationship.
- **Do** keep the homepage rollout scoped; secondary pages are not silently restyled.
- **Do** keep all text and controls usable without motion or JavaScript.

### Don't:
- **Don't** turn illustration-specific colors, gradients, or shadows into default component styling.
- **Don't** override the responsive layer with desktop-only assumptions.
- **Don't** treat legacy utility styles as a new visual direction.
