---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["es/index.html", "en/index.html", "cat/index.html", "es/about.html", "en/about.html", "cat/about.html", "es/services.html", "en/services.html", "cat/services.html", "es/products.html", "en/products.html", "cat/products.html"]
---

# Proposal B rollout

Mode: Persuade for homepages; Read/Persuade for the supplied interiors.
Authority: the user's supplied `~/Downloads/propuesta-b-the-apps-garden/web/` and accompanying proposal documentation. The request explicitly replaces the previous homepage-only demo direction and extends the supplied system to all 37 proposal pages. Existing blog routes are retained outside this rollout.

## Direction contract

THESIS: Put the supplied Proposal B into the actual static site, not into a separate preview folder. Preserve the independent consultancy's product truth, service terms, languages, and existing URLs.

OWN-WORLD: Inter variable display at 340 weight, forest fields, mint accents, white editorial sections, cream team section, local tactile images and complete portraits. Shared rules remain in production.css; responsive/native-story fixes in responsive-overrides.css. Scope the replacement to proposal-site bodies so blog layouts remain intact.

STORY: Explain the practical value of AI, show the independent method and task transformations, label hypothetical use cases, present services/products/people, and offer the existing introductory-call form.

FIRST VIEWPORT: Full-viewport forest artwork, white compact navigation, a large left-aligned light heading and two pill actions. On mobile, the artwork sits above text rather than behind it.

FORM: User-pinned complete HTML/CSS proposal; seed: none (user-pinned). Native scroll grows the botanical SVG after its two logo seeds descend, advances four method explanations, and resolves tasks. Case panels expand independently from their navigation links. No new dependencies, build step, wheel interception or scroll hijacking. Reduced motion and no-JS expose all explanations and links. Remove the preview's noindex and preview URLs; preserve contact/consent code and existing imagery.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Verification

- Static validation covers 51 retained pages, links, assets, forms and sitemap.
- Browser coverage: all 37 supplied pages in desktop, mobile, reduced-motion and no-JS modes; localized mocked contact submissions, case expansion, live preference changes, mobile menu, and 320px overflow.
- Original rollout evidence: `.impeccable/review/proposal-b/`.
- Fidelity correction after user feedback: `.impeccable/review/proposal-b-fidelity/` includes paired proposal/current Services desktop/mobile captures, live typewriter and phase-progress states, homepage, Products and About.
- `scripts/check-proposal-fidelity.cjs` compares all 37 pages against the served proposal at desktop/mobile sizes (74 pairs): main DOM copy, computed type/layout and element geometry. Eight representative routes also compare animated heading coverage and verify completion/reduced-motion transitions.
- Legacy styles are excluded from proposal bodies through CSS scope boundaries, not just overwritten piecemeal. Restore all source text-reveal selectors, preparation-before-entry, trigger positions, delay, final caret hold, supporting-block stagger and Services rail progression.
- No new shipping raster: proposal images match the existing local assets byte-for-byte; prior provenance is retained.
- Known external follow-ups from the proposal documentation: company legal/privacy/cookie pages need real business details; the Chatbase greeting language is configured externally; questionnaire timing needs business review. None is silently invented here.
