"""Generate website header lockups from approved V3 master geometry."""
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BRANDING = REPO / "assets" / "branding"
V3_MASTER = Path(r"Z:\Typography\montronedsp\variants\v3_premium\v3_montronedsp.svg")

HEADER_TITLE = "MontroneDSP header lockup — V3 wordmark"
HEADER_DESC = (
    "V3 premium identity: forward-leaning outlined lettering, four-facet diamond, "
    "hard shadow and light edge. Website header asset."
)


def load_v3_master() -> str:
    text = V3_MASTER.read_text(encoding="utf-8")
    text = re.sub(r"<metadata>.*?</metadata>\s*", "", text, flags=re.DOTALL)
    text = re.sub(r"<title>.*?</title>", f"<title>{HEADER_TITLE}</title>", text, count=1)
    text = re.sub(r"<desc>.*?</desc>", f"<desc>{HEADER_DESC}</desc>", text, count=1)
    return text


def set_fill_by_id(svg: str, element_id: str, color: str) -> str:
    tag_pattern = rf"<(?:path|g)\b[^>]*\bid=\"{re.escape(element_id)}\"[^>]*/?>"
    match = re.search(tag_pattern, svg)
    if not match:
        raise ValueError(f"element not found: id={element_id}")
    tag = match.group(0)
    if 'fill="' not in tag:
        raise ValueError(f"no fill on id={element_id}")
    new_tag = re.sub(r'fill="[^"]+"', f'fill="{color}"', tag, count=1)
    return svg[: match.start()] + new_tag + svg[match.end() :]


def apply_palette(svg: str, palette: dict[str, str]) -> str:
    out = svg
    for element_id, color in palette.items():
        out = set_fill_by_id(out, element_id, color)
    return out


PALETTES: dict[str, dict[str, str]] = {
    "aura": {
        "facet-upper-right": "#c9a0d9",
        "facet-lower-left": "#9b4f9e",
        "facet-lower-right": "#1a0818",
        "face-montrone": "#f5e9fb",
        "face-dsp": "#9b4f9e",
    },
    "martello": {
        "facet-upper-right": "#e0334f",
        "facet-lower-left": "#c8102e",
        "facet-lower-right": "#1c0408",
        "face-montrone": "#ffffff",
        "face-dsp": "#c8102e",
    },
    "swara": {
        "facet-upper-right": "#c8c8c8",
        "facet-lower-left": "#6a6a6a",
        "facet-lower-right": "#121212",
        "face-montrone": "#ffffff",
        "face-dsp": "#d0d0d0",
    },
    "galleria": {
        "facet-upper-right": "#c9a0d9",
        "facet-lower-left": "#9b4f9e",
        "facet-lower-right": "#1a0818",
        "face-montrone": "#f5e9fb",
        "face-dsp": "#9b4f9e",
    },
}

OUTPUTS: list[tuple[str, str]] = [
    ("montrone_dsp_logo_header_aura.svg", "aura"),
    ("montrone_dsp_logo_header_aura_mobile.svg", "aura"),
    ("montrone_dsp_logo_header_martello.svg", "martello"),
    ("montrone_dsp_logo_header_martello_mobile.svg", "martello"),
    ("montrone_dsp_logo_header_swara.svg", "swara"),
    ("montrone_dsp_logo_header_swara_mobile.svg", "swara"),
    ("montrone_dsp_logo_header_galleria.svg", "galleria"),
    ("montrone_dsp_logo_header_galleria_mobile.svg", "galleria"),
]


def main() -> None:
    if not V3_MASTER.is_file():
        raise SystemExit(f"V3 master not found: {V3_MASTER}")

    base = load_v3_master()
    BRANDING.mkdir(parents=True, exist_ok=True)

    for filename, palette_key in OUTPUTS:
        svg = apply_palette(base, PALETTES[palette_key])
        dest = BRANDING / filename
        dest.write_text(svg, encoding="utf-8", newline="\n")
        print(f"wrote {dest.relative_to(REPO)}")

    # Sanity: V3 forward-leaning geometry marker (not legacy upright path commands).
    sample = (BRANDING / "montrone_dsp_logo_header_aura.svg").read_text(encoding="utf-8")
    if "icon_scale" in sample or "m 27.193359,52.422852" in sample:
        raise SystemExit("Unexpected geometry in aura header output")
    if 'id="face-montrone"' not in sample or "translate(26.60725" not in sample:
        raise SystemExit("V3 structure missing from aura header output")


if __name__ == "__main__":
    main()
