"""Clean and decimate the Membrana neon hero SVG for web use."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(r"D:\users\Cynic Audio\Downloads\membrana_violet_neon_transparent.svg")
DEST = Path(__file__).resolve().parents[1] / "assets" / "branding" / "membrana_mark.svg"

KEEP_EVERY = 6
NUM_RE = re.compile(r"-?\d*\.?\d+(?:e[-+]?\d+)?", re.I)


def fmt(n: float) -> str:
    r = round(float(n), 1)
    if abs(r - int(r)) < 1e-9:
        return str(int(r))
    return f"{r:.1f}"


def tokenize_path(d: str) -> list[str | float]:
    tokens: list[str | float] = []
    i = 0
    while i < len(d):
        ch = d[i]
        if ch.isalpha():
            tokens.append(ch)
            i += 1
            continue
        if ch in ", \t\n\r":
            i += 1
            continue
        m = NUM_RE.match(d, i)
        if not m:
            i += 1
            continue
        tokens.append(float(m.group(0)))
        i = m.end()
    return tokens


def thin_cubics(nums: list[float], keep_every: int) -> list[float]:
    cubics = [nums[j : j + 6] for j in range(0, len(nums) - len(nums) % 6, 6)]
    if len(cubics) < 8:
        return [v for c in cubics for v in c]
    kept = [
        c
        for idx, c in enumerate(cubics)
        if idx == 0 or idx == len(cubics) - 1 or idx % keep_every == 0
    ]
    return [v for c in kept for v in c]


def decimate_path(d: str, keep_every: int = KEEP_EVERY) -> str:
    tokens = tokenize_path(d)
    out: list[str] = []
    i = 0

    while i < len(tokens):
        t = tokens[i]
        if not isinstance(t, str):
            i += 1
            continue

        cmd = t
        i += 1
        nums: list[float] = []
        while i < len(tokens) and not isinstance(tokens[i], str):
            nums.append(float(tokens[i]))  # type: ignore[arg-type]
            i += 1

        # Merge consecutive C commands into one run, then thin.
        if cmd.upper() == "C":
            while i < len(tokens) and isinstance(tokens[i], str) and str(tokens[i]).upper() == "C":
                i += 1
                while i < len(tokens) and not isinstance(tokens[i], str):
                    nums.append(float(tokens[i]))  # type: ignore[arg-type]
                    i += 1
            flat = thin_cubics(nums, keep_every)
            out.append("C" + " ".join(fmt(v) for v in flat))
            continue

        if cmd.upper() == "Z":
            out.append("Z")
            continue

        if nums:
            out.append(cmd + " ".join(fmt(v) for v in nums))
        else:
            out.append(cmd)

    return "".join(out)


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    text = re.sub(r"<metadata>[\s\S]*?</metadata>", "", text)
    text = re.sub(r'\s+xmlns:c2pa="[^"]*"', "", text)
    text = re.sub(r"<defs>[\s\S]*?</defs>", "", text)

    def path_repl(match: re.Match[str]) -> str:
        return f'{match.group(1)}{decimate_path(match.group(2))}{match.group(3)}'

    text = re.sub(r'(<path\b[^>]*\bd=")([^"]+)(")', path_repl, text)
    text = re.sub(r">\s+<", "><", text).strip()
    text = re.sub(
        r"^<svg[^>]*>",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2144 532" '
        'shape-rendering="geometricPrecision" role="img" aria-label="Membrana">',
        text,
        count=1,
    )

    DEST.write_text(text + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {DEST} ({DEST.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
