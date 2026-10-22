# AI consultancy website rollout

Based on both `Pack-web-Consultoria-IA.md` and the matching 16-page PDF (22 October 2026).

## Implemented

- Spanish root and Spanish, English and Catalan home pages: positioning, five services, visible Study pricing, method, team introduction, differentiators, use cases, FAQs and meeting request.
- Localized services pages: scope, exclusions, client inputs, Study deliverables and phases, private questionnaire overview, implementation, Radar billing options and four workshops.
- Localized About pages, language switching, metadata and sitemap entries.
- Shared responsive styles and a dependency-free email-request form. No form data is stored by the form or posted to a server. The visitor must send the prepared email; opening an email client is not confirmation of receipt.
- Existing products, articles, imagery and social links remain available.
- Public contact links, footers, article templates and meeting requests use `team@theappsgarden.com` across all languages. Individual team email addresses are not published.

## Decisions and launch dependencies

- The pack requests Spanish only; the implementation follows the explicit request for all three existing languages.
- Study delivery is consistently stated as 2–3 weeks after the completed questionnaire, following the detailed service specification rather than the conflicting 1–3-week FAQ.
- Study tiers follow the written table: €1,500 up to 50 people, €3,500 for 51–125, €6,000 from 126. Confirm the final threshold: the pack itself flags it as unresolved.
- Confirm workshop prices before publishing them. The proposed €600/€400 amounts are not advertised as agreed prices.
- FUNDAE eligibility and legal training-compliance claims are not advertised without verification.
- Proposed 50/50 payment terms and 30-day post-implementation support are not presented as agreed commitments.
- Supply the booking calendar or a production form endpoint to replace the email handoff. Only a confirmed successful submission should show the proposed receipt/24-business-hour response message.
- Supply approved partner names, roles, photos, quotes and LinkedIn profiles, plus city and legal/privacy text. No invented biographies, location, tool counts or testimonials are published.
- The full Study questionnaire, NDA workflow, interview guide and savings calculations are private delivery materials, not public lead forms. Set up Tally/Typeform separately after selecting the provider, privacy terms and access controls.
- Sample reports, case studies, legal documents, newsletters, directories, sector landing pages, lead tests and other growth ideas need separate content or configuration; the pack describes them as future ideas rather than completed assets.

## Validation

Checked the 10 changed/new public pages in Chromium at 1440, 768, 390 and 320 pixels: no horizontal overflow, visible navigation and working mobile menus. Checked local asset/navigation paths, fragment targets, unique IDs, language links, metadata and new sitemap URLs. Tested required form fields and URL-encoded email handoff. Temporary test tooling lives outside the repository; no runtime dependency or build step was added.
