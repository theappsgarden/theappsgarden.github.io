#!/usr/bin/env python3
"""Read-only static checks. Run from anywhere: python3 scripts/check-site.py.

Uses only the Python standard library; not a build or deployment step.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path, text=None):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.elements = []
        self.feed(path.read_text() if text is None else text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

    handle_startendtag = handle_starttag

    def attrs(self, tag):
        return [attrs for name, attrs in self.elements if name == tag]


pages = {path.resolve(): Page(path) for path in ROOT.rglob('*.html')}
errors = []


def check(condition, page, message):
    if not condition:
        errors.append(f'{page.path.relative_to(ROOT)}: {message}')


def local_target(page, href):
    url = urlsplit(href)
    if url.scheme or url.netloc:
        return None, None
    target = (ROOT / unquote(url.path).lstrip('/') if url.path.startswith('/')
              else page.path.parent / unquote(url.path)).resolve() if url.path else page.path
    if target.is_dir():
        target /= 'index.html'
    return target, unquote(url.fragment)


for page in pages.values():
    ids = [attrs['id'] for _, attrs in page.elements if 'id' in attrs]
    check(not [key for key, count in Counter(ids).items() if count > 1], page, 'duplicate IDs')
    check(len(page.attrs('h1')) == 1, page, 'expected one h1')
    check(bool(page.attrs('html')[0].get('lang')), page, 'missing language')
    stylesheets = [local_target(page, attrs['href'])[0] for attrs in page.attrs('link')
                   if attrs.get('rel') == 'stylesheet']
    check(stylesheets == [ROOT / 'css/production.css', ROOT / 'css/responsive-overrides.css'],
          page, 'shared stylesheets must load in the same order on every page')
    for tag, attrs in page.elements:
        for attr in ('href', 'src'):
            if attr not in attrs:
                continue
            target, fragment = local_target(page, attrs[attr])
            if target is None:
                continue
            check(target.exists(), page, f'missing target: {attrs[attr]}')
            if fragment and target in pages:
                check(any(a.get('id') == fragment for _, a in pages[target].elements),
                      page, f'missing anchor: {attrs[attr]}')
        if attrs.get('target') == '_blank':
            check('noopener' in attrs.get('rel', '').split(), page, 'external tab needs noopener')
        if tag == 'img':
            check('alt' in attrs, page, 'image needs alt')
            if 'team-portrait' in attrs.get('class', '').split():
                check(attrs.get('width') == '400' and attrs.get('height') == '500',
                      page, 'team portraits must keep their full 4:5 framing')

    # Shared chrome is duplicated in HTML; ensure every depth has the same links.
    text = page.path.read_text()
    lang = page.attrs('html')[0]['lang']
    folder = {'es': 'es', 'en': 'en', 'ca': 'cat'}[lang]
    expected = [ROOT / folder / name for name in ('about.html', 'services.html', 'products.html')]
    proposal = 'proposal-site' in page.attrs('body')[0].get('class', '').split()
    nav_pattern = r'<nav class="cab__menu".*?</nav>' if proposal else r'<nav class="desktop-nav".*?</div><details'
    for pattern in (nav_pattern, r'<details class="mobile-menu".*?</details>'):
        match = re.search(pattern, text, re.S)
        check(bool(match), page, 'missing shared navigation')
        if not match:
            continue
        nav = Page(page.path, match.group())
        links = nav.attrs('a')
        actual = [local_target(page, a['href'])[0] for a in links[:3]]
        check(actual == expected, page, 'inconsistent navigation order or destination')
        contact = [a for a in links if {'btn', 'boton'} & set(a.get('class', '').split())]
        # Proposal desktop CTA is a sibling of its navigation.
        if proposal and pattern == nav_pattern:
            contact = [a for a in page.attrs('a') if 'cab__cta' in a.get('class', '').split()]
        check(len(contact) == 1 and local_target(page, contact[0]['href']) ==
              ((page.path if page.path == ROOT / 'index.html' else ROOT / folder / 'index.html'), 'contact'),
              page, 'header contact must lead to the localized landing form')
    footer = text.split('<footer', 1)[1]
    footer_links = Page(page.path, footer).attrs('a')
    check(any(local_target(page, a.get('href', ''))[0] == ROOT / folder / 'about.html'
              for a in footer_links), page, 'footer missing About link')
    if proposal:
        check(not any('noindex' in a.get('content', '') for a in page.attrs('meta')),
              page, 'production pages must be indexable')
        check('/propuesta-b/' not in text, page, 'preview URL left in production page')
        for meta in page.attrs('meta'):
            if meta.get('property') == 'og:image':
                image = urlsplit(meta.get('content', ''))
                check(image.netloc == 'theappsgarden.com' and
                      (ROOT / image.path.lstrip('/')).is_file(),
                      page, 'social preview image must exist on production host')
        canonical = [a for a in page.attrs('link') if a.get('rel') == 'canonical']
        check(len(canonical) == 1 and canonical[0].get('href', '').startswith('https://theappsgarden.com/'),
              page, 'production canonical missing')

    for attrs in page.attrs('input') + page.attrs('textarea') + page.attrs('select'):
        if attrs.get('type') != 'hidden':
            check(any(label.get('for') == attrs.get('id') for label in page.attrs('label')),
                  page, 'form field missing label')
    for form in page.attrs('form'):
        disclosure = re.search(r'<details class="contact-privacy">(.*?)</details>', text, re.S)
        check(bool(disclosure), page, 'privacy notice needs a collapsed native disclosure')
        if disclosure:
            check('<summary ' in disclosure.group(1) and 'id="contact-note"' in disclosure.group(1),
                  page, 'privacy disclosure needs a labeled summary and full notice')
            check('id="contact-data-note"' not in disclosure.group(1),
                  page, 'sensitive-data warning must remain outside the disclosure')
        check(form.get('aria-describedby') == 'contact-data-note',
              page, 'form description should use the visible sensitive-data warning')
        check(form.get('action') == 'https://formspree.io/f/xyeebdyp' and
              form.get('method', '').lower() == 'post' and 'enctype' not in form,
              page, 'contact needs a native Formspree POST fallback')
        check(any(a.get('name') == 'message' and 'required' in a for a in page.attrs('textarea')),
              page, 'contact needs a required message')
        check(any(a.get('name') == 'subject' and a.get('type') == 'hidden' and a.get('value')
                  for a in page.attrs('input')), page, 'contact needs a localized email subject')
        check(any(a.get('name') == 'language' and a.get('value') == lang for a in page.attrs('input')),
              page, 'contact needs a language value')
        check(any(a.get('id') == 'contact-status' and a.get('role') == 'status' and
                  a.get('tabindex') == '-1' for a in page.attrs('p')),
              page, 'contact needs an accessible submission status')

for folder in ('es', 'en', 'cat'):
    landing = pages[ROOT / folder / 'index.html']
    section_ids = [attrs.get('id') for attrs in landing.attrs('section')]
    check(section_ids == [None, None, 'process', 'transforma', 'ejemplos', None,
                          'servicios', 'productos', 'equipo', 'faq', 'contact'],
          landing, 'homepage story sections are missing or out of order')
    for class_name, expected_count in (('numero', 4), ('fila', 5),
                                       ('caso', 4), ('producto', 3)):
        actual_count = sum(class_name in attrs.get('class', '').split()
                           for _, attrs in landing.elements)
        check(actual_count == expected_count, landing, f'expected {expected_count} {class_name} elements')
    check(any(a.get('class') == 'aviso' for a in landing.attrs('p')),
          landing, 'illustrative figures need their visible disclaimer')
    landing_scripts = [local_target(landing, attrs['src'])[0] for attrs in landing.attrs('script')
                       if 'src' in attrs]
    check(ROOT / 'js/proposal-motion.js' in landing_scripts, landing,
          'homepage needs its shared cinematic motion controller')
    check(len(landing.attrs('form')) == 1, landing, 'landing needs contact form')
    check(any(a.get('name') == 'email' and a.get('type') == 'email' and 'required' in a
              for a in landing.attrs('input')), landing, 'contact needs reply email')
    for name in ('about.html', 'services.html'):
        page = pages[ROOT / folder / name]
        check(not page.attrs('form'), page, 'use the shared landing contact flow')
        check(not any('steps' in a.get('class', '').split() for a in page.attrs('ol')),
              page, 'do not repeat the landing method')

# Services share one structural layout; translations may change copy, not formatting.
service_structure = None
for folder in ('es', 'en', 'cat'):
    page = pages[ROOT / folder / 'services.html']
    main_text = page.path.read_text().split('<main', 1)[1].split('</main>', 1)[0]
    main = Page(page.path, '<main' + main_text + '</main>')
    check('services-page' in main.attrs('main')[0].get('class', '').split(),
          page, 'services need their scoped layout')
    structure = [(tag, attrs.get('class', ''), attrs.get('id', ''))
                 for tag, attrs in main.elements]
    if service_structure is None:
        service_structure = structure
    check(structure == service_structure, page, 'localized Services layout drift')
    check(sum('radar-plan' in a.get('class', '').split() for a in main.attrs('article')) == 3,
          page, 'services need three comparable Radar plans')
    check(sum('feature-card' in a.get('class', '').split() for a in main.attrs('article')) == 4,
          page, 'services need four training workshops')
    check(any(a.get('id') == 'process' and 'service-method-link' in a.get('class', '').split()
              for a in main.attrs('p')), page, 'method link needs its shared section layout')

# Root and Spanish landing content must stay in sync, allowing relative-path depth.
root_text = (ROOT / 'index.html').read_text().split('<main', 1)[1].split('</main>')[0]
es_text = (ROOT / 'es/index.html').read_text().split('<main', 1)[1].split('</main>')[0]
check(root_text.replace('href="es/', 'href="') == es_text.replace('../', ''),
      pages[ROOT / 'index.html'], 'Spanish landing content drift')

for location in ET.parse(ROOT / 'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    path = ROOT / urlsplit(location.text).path.lstrip('/')
    if path.is_dir():
        path /= 'index.html'
    if not path.exists():
        errors.append(f'sitemap.xml: missing page: {location.text}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages — navigation, links, anchors, assets, forms, content structure and sitemap.')
