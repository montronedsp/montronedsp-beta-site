"""Rebuild membrana_mark.svg so it renders inside <img> (no <use>/xlink)."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(r"D:\MontroneDSP_Studio\media\marks\membrana-violet-neon.min.svg")
DEST = Path(__file__).resolve().parents[1] / "assets" / "branding" / "membrana_mark.svg"

LAYERS = [
    ('#3A1FA0', '46', '0.06'),
    ('#4727BE', '34', '0.09'),
    ('#5A35DA', '24', '0.14'),
    ('#6F48F0', '16', '0.22'),
    ('#8A63FF', '10', '0.38'),
    ('#9A78FF', '6', '0.58'),
    ('#B49CFF', '3.2', None),
    ('#F0E9FF', '1.1', None),
]


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    text = re.sub(r"<metadata>[\s\S]*?</metadata>", "", text)
    m = re.search(r'<path id="mbr" d="([^"]+)"', text)
    if not m:
        raise SystemExit("path#mbr not found")
    d = m.group(1)
    vb = "37 52 2083 427"
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
        'shape-rendering="geometricPrecision" role="img" aria-label="Membrana">',
        '<g fill="none" stroke-linejoin="round" stroke-linecap="round">',
    ]
    for color, width, opacity in LAYERS:
        op = f' stroke-opacity="{opacity}"' if opacity else ""
        parts.append(
            f'<path d="{d}" stroke="{color}" stroke-width="{width}"{op}/>'
        )
    parts.append("</g></svg>\n")
    DEST.write_text("".join(parts), encoding="utf-8", newline="\n")
    print(f"wrote {DEST} ({DEST.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
