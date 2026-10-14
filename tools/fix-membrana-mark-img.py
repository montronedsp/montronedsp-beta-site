"""Rebuild membrana_mark.svg so it renders inside <img> (no <use>/xlink)."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(r"D:\users\Cynic Audio\Downloads\membrana-violet-neon-reduced.svg")
DEST = Path(__file__).resolve().parents[1] / "assets" / "branding" / "membrana_mark.svg"

LAYERS = [
    ("#3A1FA0", "46", "0.06"),
    ("#4727BE", "34", "0.09"),
    ("#5A35DA", "24", "0.14"),
    ("#6F48F0", "16", "0.22"),
    ("#8A63FF", "10", "0.38"),
    ("#9A78FF", "6", "0.58"),
    ("#B49CFF", "3.2", None),
    ("#F0E9FF", "1.1", None),
]


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    text = re.sub(r"<metadata>[\s\S]*?</metadata>", "", text)
    vb_match = re.search(r'viewBox="([^"]+)"', text)
    path_match = re.search(r'<path[^>]*\bid="mbr"[^>]*\bd="([^"]+)"', text)
    if not path_match:
        path_match = re.search(r'<path[^>]*\bd="([^"]+)"[^>]*\bid="mbr"', text)
    if not path_match:
        path_match = re.search(r'<path[^>]*\bd="([^"]+)"', text)
    if not vb_match or not path_match:
        raise SystemExit("viewBox or path not found")

    view_box = vb_match.group(1)
    d = path_match.group(1)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" '
        'shape-rendering="geometricPrecision" role="img" aria-label="Membrana">',
        '<g fill="none" stroke-linejoin="round" stroke-linecap="round">',
    ]
    for color, width, opacity in LAYERS:
        op = f' stroke-opacity="{opacity}"' if opacity else ""
        parts.append(f'<path d="{d}" stroke="{color}" stroke-width="{width}"{op}/>')
    parts.append("</g></svg>\n")
    DEST.write_text("".join(parts), encoding="utf-8", newline="\n")
    print(f"wrote {DEST} ({DEST.stat().st_size} bytes) viewBox={view_box}")


if __name__ == "__main__":
    main()
