"""Replace <picture data-logo="martello"> blocks with plain <img> on site pages."""
import re

pages = [
    'about.html',
    'contact.html',
    'privacy.html',
    'free.html',
]

# Replacement: single img for full, single img for mobile
FULL_IMG = '<img class="brand-logo brand-logo-variant brand-logo--full is-active" data-logo="martello" src="assets/branding/montrone_dsp_logo_header_m_white.svg" alt="" width="190" height="29" />'
MOBILE_IMG = '<img class="brand-logo brand-logo-variant brand-logo--mobile is-active" data-logo="martello" src="assets/branding/montrone_dsp_logo_header_m_white.svg" alt="" width="120" height="19" aria-hidden="true" />'

# Match <picture ... data-logo="martello"> ... </picture>
PICTURE_RE = re.compile(r'<picture\b[^>]*\bdata-logo="martello"[^>]*>.*?</picture>', re.DOTALL)

for page in pages:
    with open(page, encoding='utf-8') as f:
        content = f.read()

    pictures = PICTURE_RE.findall(content)
    if not pictures:
        print(f'{page}: no picture[data-logo=martello] found')
        continue

    def replace_picture(m):
        pic = m.group(0)
        if 'brand-logo--mobile' in pic:
            return MOBILE_IMG
        else:
            return FULL_IMG

    new_content = PICTURE_RE.sub(replace_picture, content)
    with open(page, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'{page}: replaced {len(pictures)} picture(s)')
