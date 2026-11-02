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

    # Shared chrome is duplicated in HTML; ensure every depth has the same links.
    text = page.path.read_text()
    lang = page.attrs('html')[0]['lang']
    folder = {'es': 'es', 'en': 'en', 'ca': 'cat'}[lang]
    expected = [ROOT / folder / name for name in ('about.html', 'services.html', 'products.html')]
    for pattern in (r'<nav class="desktop-nav".*?</div><details', r'<details class="mobile-menu".*?</details>'):
        match = re.search(pattern, text, re.S)
        check(bool(match), page, 'missing shared navigation')
        if not match:
            continue
        nav = Page(page.path, match.group())
        links = nav.attrs('a')
        actual = [local_target(page, a['href'])[0] for a in links[:3]]
        check(actual == expected, page, 'inconsistent navigation order or destination')
        contact = [a for a in links if 'btn' in a.get('class', '').split()]
        check(len(contact) == 1 and local_target(page, contact[0]['href']) ==
              ((page.path if page.path == ROOT / 'index.html' else ROOT / folder / 'index.html'), 'contact'),
              page, 'header contact must lead to the localized landing form')
    footer = text.split('<footer', 1)[1]
    check(f'/{folder}/about.html' in footer or f'"{folder}/about.html' in footer,
          page, 'footer missing About link')

    for attrs in page.attrs('input') + page.attrs('textarea') + page.attrs('select'):
        if attrs.get('type') != 'hidden':
            check(any(label.get('for') == attrs.get('id') for label in page.attrs('label')),
                  page, 'form field missing label')
    for form in page.attrs('form'):
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
    check(section_ids == [None, 'process', 'why-us', 'contact'], landing, 'landing must stay focused')
    check(len(landing.attrs('form')) == 1, landing, 'landing needs contact form')
    check(any(a.get('name') == 'email' and a.get('type') == 'email' and 'required' in a
              for a in landing.attrs('input')), landing, 'contact needs reply email')
    for name in ('about.html', 'services.html'):
        page = pages[ROOT / folder / name]
        check(not page.attrs('form'), page, 'use the shared landing contact flow')
        check(not any('steps' in a.get('class', '').split() for a in page.attrs('ol')),
              page, 'do not repeat the landing method')

# Root and Spanish landing content must stay in sync, allowing relative-path depth.
root_text = (ROOT / 'index.html').read_text().split('<main', 1)[1].split('</main>')[0]
es_text = (ROOT / 'es/index.html').read_text().split('<main', 1)[1].split('</main>')[0]
check(root_text == es_text.replace('../', ''), pages[ROOT / 'index.html'], 'Spanish landing content drift')

for location in ET.parse(ROOT / 'sitemap.xml').getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    path = ROOT / urlsplit(location.text).path.lstrip('/')
    if path.is_dir():
        path /= 'index.html'
    if not path.exists():
        errors.append(f'sitemap.xml: missing page: {location.text}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages — navigation, links, anchors, assets, forms, content structure and sitemap.')
