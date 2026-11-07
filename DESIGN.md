---
name: The Apps Garden
description: Proposal B's botanical, forest-green site with an intact legacy blog.
colors:
  forest: "#102b25"
  forest-raised: "#153d32"
  green: "#007e68"
  green-deep: "#006b59"
  mint: "#7ce2a6"
  light-green: "#bce2cd"
  sage: "#eaf4ee"
  ink: "#172a25"
  muted: "#51645d"
  line: "#d7e2dc"
  surface: "#f5f8f6"
  cream: "#fff8e9"
  cream-deep: "#f3e8d5"
  white: "#fff"
typography:
  display:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(2.7rem, 5.1vw, 5rem)"
    fontWeight: 340
    lineHeight: 1.05
    letterSpacing: "-.035em"
  headline:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(2.2rem, 4.3vw, 4rem)"
    fontWeight: 340
    lineHeight: 1.05
    letterSpacing: "-.035em"
  title:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-.018em"
  body:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  introduction:
    fontSize: "clamp(1.05rem, 1.35vw, 1.24rem)"
    lineHeight: 1.55
  index:
    fontFamily: '"Space Mono", Monaco, Menlo, Consolas, monospace'
    fontSize: ".82rem"
  reading:
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif'
    fontSize: "1.0625rem"
    lineHeight: 1.75
rounded:
  media: "16px"
  portrait: "14px"
  task: "18px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4.4vw, 64px)"
  actions: "14px"
  card: "22px"
components:
  button-primary:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
    height: "52px"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
    height: "52px"
  button-light-hover:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.forest}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "12px 26px"
    height: "52px"
---

# Design System: The Apps Garden

## Overview

**Creative North Star: "The Apps Garden"**

The user-supplied Proposal B is the visual authority for the root and ES/EN/CA homepages and its 33 interior pages. This supersedes the previous homepage-only Hanken Grotesk direction. The build adopts the proposal's composition, Inter typography, forest fields, tactile artwork, spacious editorial rhythm, botanical story and cream team section.

The original CSS remains in place for the 14 blog/article/template pages that have no equivalent in the proposal. Legacy CSS in both shared stylesheets is enclosed in `@scope (:root) to (.proposal-site)`, excluding the proposal body and its descendants—not merely relying on stronger replacement selectors. This prevents inherited legacy rules from changing unspecified properties such as paragraph sizes, table captions and the Services timeline's display. The new shared layer in `css/production.css` is scoped to `body.site.proposal-site`; native-story and responsive corrections live in `css/responsive-overrides.css`. Do not apply the replacement body class to the legacy blog without reviewing that surface.

**Key Characteristics:**
- Light, tightly tracked Inter headings against forest and white fields.
- Existing tactile artwork, complete portraits, mint accents and restrained pill actions.
- Scroll-linked botanical explanation with native scrolling and complete static fallbacks.
- Shared page system and localized navigation across all supplied interiors.

## Colors

### Primary

Forest owns the hero, method, pricing summary, contact and interior heroes. Raised forest supports the botanical pot and related dark material. Garden Green and Deep Green carry links and solid actions. Mint provides highlights and focus against forest.

### Neutral

White editorial sections alternate with soft surface sections. Ink and muted green distinguish headings and supporting text. Light green is supporting copy on dark fields. Cream and deeper cream support people/portraits. Fine green-tinted lines organize rows and boundaries.

**The Inherited Contrast Rule.** Headings inherit their section's foreground. Legacy global heading colors must not turn text dark on a forest field.

## Typography

Inter is self-hosted as a variable face with Latin and Latin Extended subsets in `fonts/`. Space Mono supplies ordered method indices. Corresponding font licenses ship beside the font files. Hanken Grotesk remains available for older retained assets/layouts but is not the proposal display face.

The frontmatter captures the shared type roles. Interior heroes use `clamp(2.6rem,5.4vw,5rem)`; the method, contact and team have smaller heading clamps from the supplied proposal. Main headings use light (340) weight, while component titles use (400–500). Body copy uses (400), with supporting paragraphs generally constrained to (46–60ch). The hero heading caps at (10.4em), with supporting copy at (48ch).

Legacy blog text retains the previous Inter reading role and its existing heading hierarchy and widths. Do not infer that its older utility sizing is a new site-wide type ramp.

## Layout

The proposal wrapper caps at (1440px), with fluid horizontal padding from the gutter token. Navigation height is (84px), becoming (70px) at (900px). The mobile disclosure replaces desktop links and language controls at that breakpoint; localized language links remain inside the disclosure.

The hero is at least one small viewport high. Below (760px), its image becomes a separate region above the text, with at least (190px) of artwork rather than overlapping readable copy.

Desktop method content is a three-column grid: introduction, centered botanical SVG, and ordered explanations. With motion enabled above (960px) and a viewport at least (640px) high, its section is (360svh) tall with a sticky one-viewport stage. Smaller/shorter screens, no-JS and reduced motion use a static layout with all explanations exposed. Scroll is native; there is no smooth-scroll dependency or wheel interception.

Desktop case panels are flexible columns; the selected example grows to (2.6) relative to the other panels' (1), including static desktop rendering as in the supplied proposal. At (960px), cases stack and expose their full descriptions. Static fallbacks retain all destination links; nonfunctional overlay buttons are removed without JavaScript.

Products use three columns; team portraits use four columns beside introduction copy, then two columns on phones. Interior content, responsive service navigation, training/Radar grids and reading layouts retain the supplied proposal's dedicated widths and breakpoints.

Legacy blog/article layouts retain the established (1200px) shared chrome, (1080px) page content, (850px) blog list and (800px) article measures. Existing links and relative-path depths remain intact.

## Elevation & Depth

The composition is primarily flat: colored fields, thin rules, rounded media and open service rows do the organizing. Tactile depth belongs to the existing artwork rather than invented UI chrome.

The fixed enhanced navigation uses a translucent white or forest backdrop with blur for legibility over changing sections. The mobile menu has a directional soft shadow (`0 24px 60px rgba(16,43,37,.24)`). Interior pricing-card hover uses (`0 20px 48px rgba(16,43,37,.1)`). Without JavaScript, the header is absolute at the top so it cannot float over an incompatible section.

## Shapes

Pill actions contrast with softly rounded media and portraits. Cases and product frames use the media radius, portraits the portrait radius, and illustrated task pairs the task radius. Keep the complete logo mark and wordmark together. Portraits retain their full 4:5 source framing.

## Components

### Buttons

Solid green actions sit on white; white actions sit on forest. Ghost actions use a light outlined boundary. Main actions have at least (52px) height, with a compact (44px) header CTA. Hover uses a small lift and color transition; focus is a visible (3px) mint outline. Small-screen hero actions fill their row.

### Inputs / Fields

The contact form remains the existing native Formspree POST with progressive asynchronous enhancement. Keep explicit labels, required fields, visible sensitive-data warning, optional privacy disclosure, localized status messages, loading/disabled state and preserved answers after an error. Dark fields inherit readable light text and mint caret/focus. No real test submissions are sent.

### Navigation

The proposal's desktop menu and mobile disclosure share About, Services, Products and Use cases. Language links point to the equivalent localized page. Contact leads to that language's homepage form. The existing shared controller retains Escape, outside-click, focus-departure and resize dismissal. Blog routes remain public and retain their existing navigation.

### Method and transformation

The native controller in `js/proposal-motion.js` drops the two logo chevrons into the pot, draws the stem and scales each leaf only after the stem reaches its attachment point. The active method explanation follows the proposal's scroll thresholds. Task connectors, reviewed outputs, manifesto words, media parallax and Services phase progress follow bounded scroll-linked tracks.

Text-reveal coverage follows the supplied `b.js`, including interior section titles, showcase headings, case-library headings and dark closing headings. Prepare word/character spans before viewport entry, not when the heading is already visible. Homepage headings trigger at (86%); interior headings at (88%). Hero titles start after (350ms) on homepages and (250ms) on interiors. Each character uses the reference (9–26ms) beat and the final caret holds for (900ms). Supporting blocks enter at (91%) with a (30px) rise, (850ms) quartic ease-out and (90ms) batch stagger. The Services phase list stays vertical and its rail/circles advance with scroll; it must not inherit the old two-column grid.

Typewriter headings preserve whole words and accessible names; the transient caret is removed on completion, reduced motion and hidden tabs. Localized counters preserve final punctuation and accessible values.

Case expansion buttons remain keyboard-operable and distinct from destination links. Desktop closed-panel links leave the tab order until expanded. Reduced motion exposes all content and immediately completes active text/counters; switching preferences live also removes the pinned story. No-JS does not depend on hidden entrance states.

### Consent

Keep the existing shared consent controller and service IDs. Preferences stay in the footer, with optional services loaded only after consent. The proposal hides Chatbase greeting bubbles, leaving its launcher available. Legal company details and the chat greeting language are external/business follow-ups, not invented content.

## Do's and Don'ts

### Do:
- **Do** keep replacement CSS scoped to proposal-site pages and reuse shared stylesheet paths.
- **Do** preserve the three localized trees, public URLs, hypothetical-results disclaimer and existing service terms.
- **Do** keep native scrolling, visible focus, complete reduced-motion/no-JS content and working contact fallbacks.
- **Do** reuse the existing local artwork unchanged, retaining its provenance.

### Don't:
- **Don't** load the preview's noindex metadata, preview-domain paths or bundled animation libraries in production.
- **Don't** reintroduce fixed desktop scroll choreography on mobile or short screens.
- **Don't** import the old homepage's Hanken/WebGL direction into the approved proposal.
- **Don't** restyle retained blog/article pages accidentally through unscoped replacement selectors.

The supplied proposal contains small uppercase introductory labels and a menu glyph; they are retained for reference fidelity, not promoted as defaults for future unrelated surfaces. The detector also reads superseded legacy selectors, so its static contrast findings require checking computed section foregrounds rather than blindly copying old colors.
