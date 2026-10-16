"""Prepare Membrana Estro ligature mark: strip background plate, keep scene art."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(r"D:\MontroneDSP_Studio\media\marks\membranafinal\membrana-estro-ligature-capsbest.svg")
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

    # Drop top sphere ornament and bottom tagline (keep word + orbital scene).
    for transform in (
        r"translate\(57\.5 74\.3\) scale\(0\.0140\)",
        r"translate\(570\.8 821\.1\) scale\(0\.0178\)",
    ):
        text, n = re.subn(
            rf'<path\b[^>]*\btransform="{transform}"[^>]*/?>',
            "",
            text,
        )
        if n != 1:
            raise SystemExit(f"expected 1 path for {transform}, got {n}")

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
    # Capsbest-v3 is path-only (no scene <g>); earlier marks keep a clipped scene group.
    if text.count("<path") < 4:
        raise SystemExit("wordmark paths look incomplete")

    DEST.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {DEST} ({DEST.stat().st_size} bytes)")
    print("paths", text.count("<path"))


if __name__ == "__main__":
    main()
