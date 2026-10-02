#!/usr/bin/env python3
"""Constructed Frutiger diamond + original header wordmark (pre-68 BCI)."""
from pathlib import Path

OUT = Path("assets/branding")
MONTRONE_D = Path("_wm_montrone.txt").read_text(encoding="utf-8").strip()
DSP_D = Path("_wm_dsp.txt").read_text(encoding="utf-8").strip()

# Optical centre of the original header diamond (pre translate -160.05)
CX, CY = 261.43, 175.55
# Slightly taller than wide: a rhombus reads squat otherwise
RX, RY = 58.0, 63.0
# Tip crop — slight blunt so points hold at 16px without becoming an octagon
TIP = 3.4
# Inner lozenge scale (the 'o' counter of the mark)
INNER = 0.38

PALETTES = {
    "master": {
        "title": "MontroneDSP header lockup — constructed diamond + original wordmark",
        "desc": "Constructed lozenge (flat facets, open counter) with original header wordmark. No glow.",
        "nw": "#ffffff",
        "ne": "#9a9a9a",
        "sw": "#5a5a5a",
        "se": "#141414",
        "montrone": "#ffffff",
        "dsp": "#c8c8c8",
    },
    "aura": {
        "title": "MontroneDSP Aura header lockup — constructed diamond + original wordmark",
        "desc": "Constructed lozenge in Aura planes; original header wordmark. No glow.",
        "nw": "#ffffff",
        "ne": "#c9a0d9",
        "sw": "#9b4f9e",
        "se": "#1a0818",
        "montrone": "#f5e9fb",
        "dsp": "#9b4f9e",
    },
    "martello": {
        "title": "MontroneDSP Martello header lockup — constructed diamond + original wordmark",
        "desc": "Constructed lozenge in MX2 crimson planes; original header wordmark. No glow.",
        "nw": "#ffffff",
        "ne": "#e0334f",
        "sw": "#c8102e",
        "se": "#1c0408",
        "montrone": "#ffffff",
        "dsp": "#c8102e",
    },
    "mono": {
        "title": "MontroneDSP mono header lockup — constructed diamond + original wordmark",
        "desc": "Constructed monochrome lozenge for Swara/site; original header wordmark. No glow.",
        "nw": "#ffffff",
        "ne": "#c8c8c8",
        "sw": "#6a6a6a",
        "se": "#121212",
        "montrone": "#ffffff",
        "dsp": "#d0d0d0",
    },
}


def pt(x, y):
    return f"{x:.3f},{y:.3f}"


def constructed_mark():
    """Four flat planes of a truncated lozenge with an open inner rhombus."""
    cx, cy, rx, ry, t = CX, CY, RX, RY, TIP
    ox = t * rx / ry
    oy = t * ry / rx

    n_w = (cx - ox, cy - ry + t)
    n_e = (cx + ox, cy - ry + t)
    e_n = (cx + rx - t, cy - oy)
    e_s = (cx + rx - t, cy + oy)
    s_e = (cx + ox, cy + ry - t)
    s_w = (cx - ox, cy + ry - t)
    w_s = (cx - rx + t, cy + oy)
    w_n = (cx - rx + t, cy - oy)
    n_c = (cx, cy - ry + t)
    e_c = (cx + rx - t, cy)
    s_c = (cx, cy + ry - t)
    w_c = (cx - rx + t, cy)

    k = INNER
    i_n = (cx, cy - ry * k)
    i_e = (cx + rx * k, cy)
    i_s = (cx, cy + ry * k)
    i_w = (cx - rx * k, cy)

    def P(*pts):
        return "M " + " L ".join(pt(*p) for p in pts) + " Z"

    return {
        "nw": P(n_c, n_w, w_n, w_c, i_w, i_n),
        "ne": P(n_c, n_e, e_n, e_c, i_e, i_n),
        "se": P(s_c, s_e, e_s, e_c, i_e, i_s),
        "sw": P(s_c, s_w, w_s, w_c, i_w, i_s),
    }


def facet_group(palette, mark):
    return f'''    <g id="icon-diamond">
      <path d="{mark["nw"]}" fill="{palette["nw"]}"/>
      <path d="{mark["ne"]}" fill="{palette["ne"]}"/>
      <path d="{mark["sw"]}" fill="{palette["sw"]}"/>
      <path d="{mark["se"]}" fill="{palette["se"]}"/>
    </g>'''


def build_lockup(palette, mark):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 15 1000 310" shape-rendering="geometricPrecision">
  <title>{palette["title"]}</title>
  <desc>{palette["desc"]}</desc>
  <g transform="translate(-160.05, 0)">
{facet_group(palette, mark)}
    <g id="wordmark" transform="translate(360.947,120.947) scale(1.36842)">
      <path id="montrone-wordmark" fill="{palette["montrone"]}" d="{MONTRONE_D}"/>
      <path id="dsp-mark" fill="{palette["dsp"]}" d="{DSP_D}"/>
    </g>
  </g>
</svg>
'''


def build_favicon(palette, mark):
    pad = 14
    x = CX - RX - 160.05 - pad
    y = CY - RY - pad
    w = 2 * RX + 2 * pad
    h = 2 * RY + 2 * pad
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" shape-rendering="geometricPrecision">
  <g transform="translate(-160.05, 0)">
{facet_group(palette, mark)}
  </g>
</svg>
'''


def main():
    mark = constructed_mark()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "montrone_dsp_logo_header_master.svg").write_text(
        build_lockup(PALETTES["master"], mark), encoding="utf-8", newline="\n"
    )
    mapping = {
        "aura": [
            "montrone_dsp_logo_header_aura.svg",
            "montrone_dsp_logo_header_aura_mobile.svg",
            "montrone_dsp_logo_header_galleria.svg",
            "montrone_dsp_logo_header_galleria_mobile.svg",
        ],
        "martello": [
            "montrone_dsp_logo_header_martello.svg",
            "montrone_dsp_logo_header_martello_mobile.svg",
        ],
        "mono": [
            "montrone_dsp_logo_header_mono.svg",
            "montrone_dsp_logo_header_mono_mobile.svg",
            "montrone_dsp_logo_header_swara.svg",
            "montrone_dsp_logo_header_swara_mobile.svg",
        ],
    }
    for key, files in mapping.items():
        svg = build_lockup(PALETTES[key], mark)
        for name in files:
            (OUT / name).write_text(svg, encoding="utf-8", newline="\n")
            print("wrote", name)
    Path("favicon.svg").write_text(build_favicon(PALETTES["aura"], mark), encoding="utf-8", newline="\n")
    print("wrote favicon.svg + master")


if __name__ == "__main__":
    main()
