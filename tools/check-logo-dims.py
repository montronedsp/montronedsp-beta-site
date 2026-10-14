import re

files = [
    'assets/branding/montrone_dsp_logo_header_m_white.svg',
    'assets/branding/montrone_dsp_logo_header_m_dark_theme_inverted_diamond.svg',
    'assets/branding/montrone_dsp_logo_header_aura.svg',
    'assets/branding/montrone_dsp_logo_header_swara.svg',
]
for f in files:
    with open(f, encoding='utf-8') as fh:
        head = fh.read(400)
    vb = re.search(r'viewBox=["\']([^"\']+)["\']', head)
    print(f.split('/')[-1])
    print('  viewBox:', vb.group(1) if vb else 'NOT FOUND')
