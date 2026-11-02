# Website audit (GitHub Pages)

## Architecture

- This is a static site served directly from GitHub Pages with `CNAME` and no server-side runtime. Keep links and assets relative to each page's directory depth; do not depend on rewrites, a backend, or client-side rendering for navigation or content.
- Public pages are in the root, `es/`, `en/`, and `cat/`. Shared presentation lives in `css/production.css`; layout and breakpoint rules live in `css/responsive-overrides.css`. Content and navigation render without JavaScript. `js/production.js` loads analytics and chat only after the relevant consent.
- The root and `es/index.html` both present the Spanish landing page. `/` is canonical for the root page; each localized page has its own canonical URL. Alternate-language links in metadata exist only for equivalent pages, not for articles that have no translation. The blog is temporarily hidden from navigation; all blog pages are `noindex` and excluded from `sitemap.xml` while their files are retained.
- Header, footer, SEO metadata, and buttons are still duplicated in static HTML by design. When updating shared chrome, update every language and page depth (including blog templates). A static generator or CI could reduce this maintenance burden later, but would add a build/deployment workflow; do not assume GitHub Pages will run one.

## Performance and accessibility changes

- Removed render-blocking Google Fonts and Font Awesome; system fonts and text labels replace them. ScrollReveal and the obsolete Universal Analytics snippet remain removed. The deferred shared script manages consent for Chatbase and GA4 on every page.
- Images below the fold use `loading="lazy"`; major images have intrinsic dimensions to reduce layout shift. The logo, editorial WebP illustrations, SVG icons, and product art are local. The homepage hero is a CSS animation of localized task cards; supporting images are lazy-loaded.
- Navigation and its mobile disclosure work without JavaScript. The visible skip link on focus, focus outlines, semantic headings, and reduced-motion media query improve keyboard and motion accessibility.
- Product detail pages no longer advertise unsupported numeric 90-day outcome guarantees. The remaining product claims and AI-authored blog content should be reviewed for accuracy by the business owner before promotion.

## Content and contact review

- **Landing:** outcome-led introduction, four-step method, four reasons to work with us, and contact. Removed the About teaser, service catalogue, pricing, sector catalogue and duplicated FAQs. The root mirrors the Spanish landing; English and Catalan have equivalent content.
- **Services:** owns the Study, pricing, scope, delivery phases, implementation, Radar and training. A compact section index replaces the repeated service-card catalogue; the general method links back to the landing. FAQs no longer repeat the pricing and timing sections.
- **About:** owns the origin story and team biographies, not another copy of the method or sales arguments.
- **Products:** short audience/use-case summaries help visitors choose. Detail pages explain preparation and editorial boundaries as well as their specific workflow, rather than repeating the summaries.
- **Navigation:** About, Services and Products appear in the same order on desktop and mobile, including retained blog pages and templates. Header contact buttons lead to the localized landing form. Footers include About too. Existing URLs and section anchors remain available.
- **Contact delivery:** the root and all three localized landing forms POST to the owner-provided public endpoint `https://formspree.io/f/xyeebdyp`. `js/meeting-request.js` uses native `fetch`/`FormData` with `Accept: application/json`; no SDK, framework, private key or build step is needed. Required fields are name, reply email and message; company is optional. Hidden `subject` and `language` fields identify the localized enquiry. The HTML action/method also submit without JavaScript, using Formspree’s response page.
- **Contact states and privacy:** localized sending/success/error feedback is accessible and keyboard-focusable. Submission locks the fields/button, ignores duplicate clicks, and resets only after a successful JSON response. Field validation errors are localized and marked; other errors preserve the answers and show the direct email alternative. Requests time out after 30 seconds and are never automatically retried, since a connection failure may occur after acceptance. No form data is persisted in browser storage or logged by this code. The form now discloses Formspree processing, possible transfers outside the EU and its privacy policy; this is not a substitute for the owner’s full privacy notice and processor/retention review.
- **Layout fixes:** form controls use border-box sizing, as does the mobile dropdown so it stays inside a 320px viewport. Four-card feature grids use a balanced two-column desktop layout and a single mobile column.

## Validation

- Run `python3 scripts/check-site.py` for dependency-free checks across all 36 HTML pages: shared navigation, local links/assets/anchors, labels, duplicate IDs, external-link safety, landing structure, Spanish/root parity and sitemap targets.
- Run `node --check js/meeting-request.js`, `node --test scripts/test-meeting-request.cjs` and `git diff --check`. The dependency-free Node suite covers localized states, request payload, whitespace validation, duplicate submits, server field validation, rate limits, network/server failures, malformed responses, timeout, retained values and unsupported-browser fallback.
- An isolated HTML5 parser check passed for all 36 pages; corrected three pre-existing unescaped ampersands in two retained articles without changing their visible text or link destinations.
- Browser validation: Chromium, all 36 pages at 1440, 1024, 768, 390 and 320px; no horizontal overflow or JavaScript errors. Earlier layout checks covered mobile dropdown bounds, navigation, reduced motion, consent rejection and all image decoding. Formspree-specific checks covered all four forms at desktop/mobile sizes: required/email/whitespace validation, Unicode payload, optional company, localized subjects/language, pending/duplicate submission handling, success/reset/focus, field/quota/server/network/malformed-response errors, retained answers and native POST without JavaScript. Desktop/mobile screenshots were inspected locally. All Formspree requests in these tests were intercepted; they did not use submission quota or send email. Actual endpoint acceptance and inbox delivery remain to be verified by the owner.

## Formspree dashboard checks before publishing

- Confirm the endpoint is active and email notifications go to the verified address `team@theappsgarden.com`. The destination is configured in Formspree, not in client-side JavaScript.
- Keep spam protection enabled. If using domain restrictions, allow the production hostname(s) you serve. All four landing pages share one endpoint and its quota.
- Review Formspree’s processing/retention settings and your own privacy notice. Once deployed, submit one controlled enquiry and check both the dashboard and inbox/spam folder; an API success is not proof of inbox delivery.

## Follow-up opportunities

1. **Content review:** add verified client examples or case studies as they become available. Review the retained, noindexed AI blog articles and their publication dates for factual accuracy; this pass changed their navigation, not their historical editorial content.
2. **Asset optimization:** review the remaining legacy product PNG for possible WebP/AVIF replacement if it is reused. The current social preview uses `process-to-progress.webp`; create and test a dedicated social share crop if needed.
3. **Deployment checks:** optionally run `scripts/check-site.py` in CI and supplement it with full HTML validation. GitHub Pages does not provide application-level routing or HTML validation by itself.
4. **Measurement:** capture a Lighthouse baseline on the live domain after deployment (mobile and desktop, cold and warm cache). Avoid claiming a numerical speedup without a measured baseline and post-deployment comparison. Caching headers for GitHub Pages are platform-managed; page-level code cannot change them.
