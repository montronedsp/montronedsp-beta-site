import os, re

DARK  = "assets/branding/montrone_dsp_logo_header_m_white.svg"
LIGHT = "assets/branding/montrone_dsp_logo_header_m_dark_theme_inverted_diamond.svg"

def picture(classes, data_logo, w, h, aria=""):
    aria_attr = ' aria-hidden="true"' if aria else ""
    return (
        f'<picture class="{classes}" data-logo="{data_logo}">'
        f'<source srcset="{LIGHT}" media="(prefers-color-scheme: light)" type="image/svg+xml" />'
        f'<img src="{DARK}" alt="" width="{w}" height="{h}"{aria_attr} />'
        f'</picture>'
    )

# --- index.html replacements ---
INDEX_REPLACEMENTS = [
    # martello full
    (
        '<img class="brand-logo brand-logo-variant brand-logo--full is-active" data-logo="martello" src="assets/branding/montrone_dsp_logo_header_martello.svg" alt="" width="190" height="29" />',
        picture("brand-logo brand-logo-variant brand-logo--full is-active", "martello", 190, 29)
    ),
    # martello mobile
    (
        '<img class="brand-logo brand-logo-variant brand-logo--mobile is-active" data-logo="martello" src="assets/branding/montrone_dsp_logo_header_martello_mobile.svg" alt="" width="120" height="19" aria-hidden="true" />',
        picture("brand-logo brand-logo-variant brand-logo--mobile is-active", "martello", 120, 19, aria=True)
    ),
    # membrana
    (
        '<img class="brand-logo brand-logo-variant" data-logo="membrana" src="assets/branding/montronedsp-logo-membrana.svg" alt="" width="168" height="28" aria-hidden="true" />',
        picture("brand-logo brand-logo-variant", "membrana", 168, 28, aria=True)
    ),
    # galleria full
    (
        '<img class="brand-logo brand-logo-variant brand-logo--full" data-logo="galleria" src="assets/branding/montrone_dsp_logo_header_galleria.svg" alt="" width="190" height="29" aria-hidden="true" />',
        picture("brand-logo brand-logo-variant brand-logo--full", "galleria", 190, 29, aria=True)
    ),
    # galleria mobile
    (
        '<img class="brand-logo brand-logo-variant brand-logo--mobile" data-logo="galleria" src="assets/branding/montrone_dsp_logo_header_galleria.svg" alt="" width="120" height="19" aria-hidden="true" />',
        picture("brand-logo brand-logo-variant brand-logo--mobile", "galleria", 120, 19, aria=True)
    ),
]

# --- static pages: only martello full + mobile ---
STATIC_FULL = (
    '<img class="brand-logo brand-logo-variant brand-logo--full is-active" data-logo="martello" src="assets/branding/montrone_dsp_logo_header_martello.svg" alt="" width="190" height="29" />',
    picture("brand-logo brand-logo-variant brand-logo--full is-active", "martello", 190, 29)
)
STATIC_MOBILE = (
    '<img class="brand-logo brand-logo-variant brand-logo--mobile is-active" data-logo="martello" src="assets/branding/montrone_dsp_logo_header_martello_mobile.svg" alt="" width="120" height="19" aria-hidden="true" />',
    picture("brand-logo brand-logo-variant brand-logo--mobile is-active", "martello", 120, 19, aria=True)
)

static_pages = ['about.html', 'contact.html', 'privacy.html', 'dawless.html', 'free.html']

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
for old, new in INDEX_REPLACEMENTS:
    if old in content:
        content = content.replace(old, new)
        print(f'replaced in index.html: {old[:60]}...')
    else:
        print(f'NOT FOUND in index.html: {old[:60]}...')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Update static pages
for page in static_pages:
    if not os.path.exists(page):
        print('skip', page); continue
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    changed = False
    for old, new in [STATIC_FULL, STATIC_MOBILE]:
        if old in content:
            content = content.replace(old, new)
            changed = True
    if changed:
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print('updated', page)
    else:
        print('no match in', page)
