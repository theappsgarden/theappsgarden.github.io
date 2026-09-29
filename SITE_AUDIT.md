# Website audit (GitHub Pages)

## Architecture

- This is a static site served directly from GitHub Pages with `CNAME` and no server-side runtime. Keep links and assets relative to each page's directory depth; do not depend on rewrites, a backend, or client-side rendering for navigation or content.
- Public pages are in the root, `es/`, `en/`, and `cat/`. Shared presentation lives in `css/production.css` (the existing compact utility layer plus the new shared visual system); breakpoint rules live in `css/responsive-overrides.css`. Pages render without JavaScript; `js/production.js` loads the shared analytics and chatbot integrations.
- The root and `es/index.html` both present the Spanish landing page. `/` is canonical for the root page; each localized page has its own canonical URL. Alternate-language links in metadata exist only for equivalent pages, not for articles that have no translation. The blog is temporarily hidden from navigation; all blog pages are `noindex` and excluded from `sitemap.xml` while their files are retained.
- Header, footer, SEO metadata, and buttons are still duplicated in static HTML by design. When updating shared chrome, update every language and page depth (including blog templates). A static generator or CI could reduce this maintenance burden later, but would add a build/deployment workflow; do not assume GitHub Pages will run one.

## Performance and accessibility changes

- Removed render-blocking Google Fonts and Font Awesome; system fonts and text labels replace them. ScrollReveal and the obsolete Universal Analytics snippet remain removed. A deferred shared script loads the restored Chatbase chatbot and the GA4 tag on every page.
- Images below the fold use `loading="lazy"`; major images have intrinsic dimensions to reduce layout shift. The logo, editorial WebP illustrations, SVG icons, and product art are local. The homepage hero is a CSS animation of localized task cards; supporting images are lazy-loaded.
- Navigation and its mobile disclosure work without JavaScript. The visible skip link on focus, focus outlines, semantic headings, and reduced-motion media query improve keyboard and motion accessibility.
- Product detail pages no longer advertise unsupported numeric 90-day outcome guarantees. The remaining product claims and AI-authored blog content should be reviewed for accuracy by the business owner before promotion.

## Follow-up opportunities

1. **Content review:** the services pages now group the offer into four workflows; add verified client examples or case studies as they become available. Review the dated AI blog articles and their publication dates for factual accuracy.
2. **Asset optimization:** review the remaining legacy product PNG for possible WebP/AVIF replacement if it is reused. The current social preview uses `process-to-progress.webp`; create and test a dedicated social share crop if needed.
3. **Deployment checks:** add a lightweight CI job or local validation script for missing relative assets, language equivalents, sitemap entries and HTML errors before publishing. GitHub Pages does not provide application-level routing or HTML validation by itself.
4. **Measurement:** capture a Lighthouse baseline on the live domain after deployment (mobile and desktop, cold and warm cache). Avoid claiming a numerical speedup without a measured baseline and post-deployment comparison. Caching headers for GitHub Pages are platform-managed; page-level code cannot change them.
