# Proposal B integration

## Source and scope

Reference: `~/Downloads/propuesta-b-the-apps-garden/`, including its `web/` implementation and `documentacion/propuesta-b.txt`.

Applied the supplied Spanish, English and Catalan homepages and 33 interiors (37 pages including the root Spanish homepage). Preserved all 51 existing HTML paths, including the blog, articles and templates outside the proposal. No deployment or GitHub publication is performed by these changes.

## Implementation

- Imported the proposal's page structure, localized copy, navigation, imagery references and interior layouts.
- Appended its shared CSS to `css/production.css`, scoped to `body.site.proposal-site` so retained blog pages keep their existing styles. Legacy sections of both shared stylesheets are also enclosed in `@scope (:root) to (.proposal-site)` to prevent older unspecified properties leaking into the proposal. Responsive and native-animation corrections are in `css/responsive-overrides.css`.
- Self-hosted the proposal's Inter and Space Mono fonts with their supplied licenses.
- Implemented the botanical scroll story and dependency-free motion in `js/proposal-motion.js`. Following user fidelity feedback, restored source coverage and timing for interior heading reveals, supporting-block batch entrances, hero sequencing, manifesto word highlighting, scroll-linked task transformations, image parallax and Services phase progression. Heading spans are prepared before entry, with the proposal's trigger positions, typing delays/beat, final caret hold and supporting-block stagger. The proposal's GSAP/ScrollTrigger/Lenis files are not imported; native scrolling and interpolation are not claimed as a frame-for-frame reproduction of those libraries.
- Preserved `js/production.js` and `js/meeting-request.js` for existing consent, optional services, menu interactions and contact behavior.
- Removed preview-only noindex/nofollow metadata and `/propuesta-b/` URLs. Added production canonical and localized alternate links; social previews reference the existing local `process-to-progress.webp` rather than the preview-only image filename.
- Existing proposal illustration and portrait files match the repository's local assets; no new shipping raster was created. Existing asset provenance remains unchanged.
- Complete static fallbacks: no hidden initial content without JavaScript; all method explanations and case links exposed without motion; live reduced-motion changes immediately complete active text/counting and remove the sticky story.
- Updated `DESIGN.md`, `.impeccable/design.json` and the surface brief to describe this approved replacement instead of the previous homepage-only direction.

## Validation

From the repository root:

```sh
python3 scripts/check-site.py
node --test scripts/test-meeting-request.cjs scripts/test-homepage.cjs scripts/test-site-interactions.cjs
node --check js/proposal-motion.js
git diff --check
```

The static check covers all 51 pages, relative assets/links/anchors, localized navigation, contact/privacy structure, homepage content, service structure, production metadata and sitemap destinations. The 32 existing unit tests pass; the old homepage unit tests cover retained legacy controller code, not the new proposal controller.

For the proposal controller, start a local server and run the optional browser regression script with an externally installed Playwright:

```sh
python3 -m http.server 8765
PLAYWRIGHT_PATH=/path/to/playwright node scripts/check-proposal-browser.cjs
```

Browser verification uses desktop Chrome:

- All 37 pages in desktop, mobile, reduced-motion and no-JavaScript modes: 148 page/mode checks.
- Missing local resources, broken images, horizontal overflow, hidden headings and production/preview metadata.
- All three languages: keyboard case expansion, botanical step progression, mocked successful contact POST, live reduced-motion transition, mobile menu/Escape, and 320px overflow.
- Initial visual evidence: `.impeccable/review/proposal-b/`. The subsequent fidelity pass directly compared the reference/current Services in desktop/mobile and active typewriter/phase states, plus homepage, Products and About. Paired screenshots are in `.impeccable/review/proposal-b-fidelity/`; these are local review evidence, not deployment assets.
- Reference regression: serve the proposal's `web/` folder on port 8766, then run `PLAYWRIGHT_PATH=/path/to/playwright node scripts/check-proposal-fidelity.cjs`. This checks all 37 routes at 1440px and 390px against the real proposal (74 reference/current pairs), comparing main DOM copy, computed typography/layout and element geometry. Eight representative routes additionally compare the prepared heading sets and verify animation completion and live reduced-motion transitions. The documented static-accessibility exceptions (fully exposed method descriptions, hidden nonfunctional overlay buttons) and decorative scroll indicator are excluded from geometric comparison.
- One Impeccable detector pass. Static findings include legacy styles and reference-supplied patterns; actual section heading foregrounds were verified in the browser and corrected. These checks do not constitute an independent accessibility certification.

## Remaining external/business follow-ups

As noted in the supplied proposal documentation:

- Company legal, privacy and cookie pages require real business details; none are invented here.
- Chatbase's initial greeting language is configured in its dashboard, outside this repository.
- Questionnaire timing should be reconciled with the service description by the business owner.
- Safari and real iPhone hardware have not been tested.
- Form submissions were intercepted; no real enquiries were sent. Analytics reporting and a real chat conversation were not tested.
