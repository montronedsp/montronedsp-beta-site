"""Replace the Demo nav link with Privacy on all HTML pages."""
import os, re

OLD = '<a class="nav-link" href="martello-demo.html" data-i18n="nav.demo">Demo</a>'
NEW = '<a class="nav-link" href="privacy.html" data-i18n="nav.privacy">Privacy</a>'

pages = [f for f in os.listdir('.') if f.endswith('.html')]
for page in pages:
    with open(page, encoding='utf-8') as f:
        content = f.read()
    if OLD in content:
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content.replace(OLD, NEW))
        print(f'Fixed: {page}')
    else:
        print(f'Skip:  {page}')
