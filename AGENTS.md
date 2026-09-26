# AGENTS.md

## Repository overview

This repository is a static website for The Apps Garden. It has no build system, package manifest, test suite, or CI configuration: pages are served directly from the repository.

- `index.html` is the root Spanish landing page.
- `es/`, `en/`, and `cat/` contain Spanish, English, and Catalan page trees.
- Each language tree includes landing, services, products, blog index, product-detail, and blog-article pages where available.
- `*/blog/articles/template_*.html` files are the starting point for new articles.
- Shared assets live in `css/`, `js/`, `img/`, and `ico/`.
- `sitemap.xml`, `robots.txt`, and `CNAME` are deployment/SEO configuration.

## Working conventions

- Use plain HTML, CSS, and JavaScript; do not introduce a framework, build step, or dependency without an explicit request.
- Keep shared styling in `css/production.css` and responsive fixes in `css/responsive-overrides.css`. `production.css` is compiled/minified, so make targeted changes and do not reformat it wholesale.
- Keep `js/production.js` dependency-free. Pages that use reveal animations also load ScrollReveal from its CDN before this script.
- Preserve existing relative-path depth when adding or moving pages. Root pages use `css/` and `js/`; language pages use `../`; article pages normally use `../../../` for shared assets.
- Reuse existing classes, spacing utilities, button styles, and visual patterns rather than adding page-specific inline styling where a shared rule is suitable.
- Maintain the matching localized page when a change is intended to apply across languages. Keep copy and `lang` attributes in the appropriate language.
- For a new blog article, copy the language-specific template, add its card/link to that language's blog index, and add the public URL to `sitemap.xml` when it should be indexed.
- Retain page titles, meta descriptions, Open Graph metadata, image `alt` text, and `rel="noopener"` on externally opened links.

## Validation

There are no repository-provided automated checks. Before submitting HTML changes, inspect the changed page in a browser or local static server, verify navigation and asset paths from that page's directory depth, and check desktop and mobile layouts. For new or renamed public pages, validate the corresponding sitemap entry.

## Git workflow

- This repository's default branch is `master`; use it as the base branch.
- Make task changes on a focused branch, not directly on `master`.
- Do not commit generated OS files such as `.DS_Store` or local configuration/secrets.
