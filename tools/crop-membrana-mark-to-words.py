"""Crop membrana_mark.svg viewBox to the wordmark bbox (keep nearby scene)."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "assets" / "branding" / "membrana_mark.svg"

# Word paths use translate(~282, ~484) scale(0.138) over glyph box ~55..7444 x -720..136
# Effective word bbox ≈ (290, 385)–(1310, 503). Crop flush-left to words; keep nearby scene.
VB_X, VB_Y, VB_W, VB_H = 285, 375, 1035, 145


def main() -> None:
    text = SVG.read_text(encoding="utf-8")
    text = re.sub(
        r'viewBox="[^"]*"',
        f'viewBox="{VB_X} {VB_Y} {VB_W} {VB_H}"',
        text,
        count=1,
    )
    text = re.sub(
        r'(<clipPath id="c"><rect )[^/]*/>',
        f'\\1x="{VB_X}" y="{VB_Y}" width="{VB_W}" height="{VB_H}"/>',
        text,
        count=1,
    )
    SVG.write_text(text, encoding="utf-8", newline="\n")
    print(f"cropped {SVG} -> viewBox {VB_X} {VB_Y} {VB_W} {VB_H}")


if __name__ == "__main__":
    main()
