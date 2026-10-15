"""Prepare Membrana Estro ligature mark: strip background plate, keep scene art."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(r"D:\users\Cynic Audio\Downloads\membrana-estro-ligature-capsbest (1).svg")
DEST = Path(__file__).resolve().parents[1] / "assets" / "branding" / "membrana_mark.svg"


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    text = re.sub(r"<metadata>[\s\S]*?</metadata>", "", text)
    text = re.sub(r'\s+xmlns:c2pa="[^"]*"', "", text)

    # Remove opaque background plate only.
    text = re.sub(
        r'<rect\b[^>]*\bfill="url\(#g\)"[^>]*/?>',
        "",
        text,
    )
    # Drop unused radial gradient (background only).
    text = re.sub(
        r'<radialGradient\b[^>]*>[\s\S]*?</radialGradient>\s*',
        "",
        text,
    )

    # Normalize opener for web embedding.
    text = re.sub(
        r"^<svg[^>]*>",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" '
        'shape-rendering="geometricPrecision" role="img" aria-label="Membrana">',
        text,
        count=1,
    )
    text = re.sub(r">\s+<", "><", text).strip() + "\n"

    if 'fill="url(#g)"' in text or 'id="g"' in text:
        raise SystemExit("background gradient leftovers remain")
    if "<g " not in text and "<g>" not in text:
        raise SystemExit("scene group missing")
    if text.count("<path") < 5:
        raise SystemExit("scene paths look incomplete")

    DEST.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {DEST} ({DEST.stat().st_size} bytes)")
    print("paths", text.count("<path"))


if __name__ == "__main__":
    main()
