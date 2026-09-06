import re
for fname in [
    'assets/branding/montrone_dsp_logo_header_m_dark_theme_inverted_diamond.svg',
    'assets/branding/montrone_dsp_logo_header_m_white.svg',
]:
    with open(fname, encoding='utf-8') as f:
        content = f.read(3000)
    fills = re.findall(r'fill=["\']([^"\']+)["\']', content)
    print(fname.split('/')[-1])
    print('  fills:', fills[:8])
