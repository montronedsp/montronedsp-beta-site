import os
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'assets', 'branding'))

with open('montrone_dsp_logo_header_favicon_dark.svg', 'r', encoding='utf-8') as f:
    c = f.read()

# Halo layer: very dark almost-black -> subtle white glow
c = c.replace('fill="#12161c" opacity="0.1"', 'fill="#ffffff" opacity="0.06"')
# Main MONTRONE text (crisp layer)
c = c.replace('fill="#1a222c" opacity="1"', 'fill="#ffffff" opacity="1"')
# DSP halo
c = c.replace('fill="#1a222c" opacity="0.3"', 'fill="#ffffff" opacity="0.22"')
# Inline style fill references (same colours, different format)
c = c.replace('fill:rgb(18, 22, 28)', 'fill:rgb(255, 255, 255)')
c = c.replace('fill:rgb(26, 34, 44)', 'fill:rgb(255, 255, 255)')

with open('montrone_dsp_logo_header_favicon_dark.svg', 'w', encoding='utf-8') as f:
    f.write(c)
print('done')
