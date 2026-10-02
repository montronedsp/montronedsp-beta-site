#!/usr/bin/env python3
"""Wordmark motion research — separate files only. Does not touch live lockups.

Sources:
  1) Live Aura header wordmark outlines (split subpaths, transform for motion)
  2) Roboto Variable (site face) — condensed bold + shear for italic energy
"""
from __future__ import annotations

import math
import re
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from fontTools.varLib.instancer import instantiateVariableFont

PY = Path(__file__).resolve().parents[1]
OUT = PY / "assets" / "branding"
LIVE = OUT / "montrone_dsp_logo_header_aura.svg"
ROBOTO = PY / "assets" / "fonts" / "roboto" / "Roboto-Variable.ttf"

BASELINE = 68.0
CAP = 55.5
DSP_RATIO = 0.70

CX, CY, RX, RY, TIP, INNER = 261.43, 175.55, 58.0, 63.0, 3.4, 0.38

PALETTES = {
    "aura": {"montrone": "#f5e9fb", "dsp": "#9b4f9e",
             "nw": "#ffffff", "ne": "#c9a0d9", "sw": "#9b4f9e", "se": "#1a0818"},
    "martello": {"montrone": "#ffffff", "dsp": "#c8102e",
                 "nw": "#ffffff", "ne": "#e0334f", "sw": "#c8102e", "se": "#1c0408"},
    "mono": {"montrone": "#ffffff", "dsp": "#d0d0d0",
             "nw": "#ffffff", "ne": "#c8c8c8", "sw": "#6a6a6a", "se": "#121212"},
}


def pt(x, y):
    return f"{x:.3f},{y:.3f}"


def constructed_mark():
    cx, cy, rx, ry, t = CX, CY, RX, RY, TIP
    ox = t * rx / ry
    oy = t * ry / rx
    n_w, n_e = (cx - ox, cy - ry + t), (cx + ox, cy - ry + t)
    e_n, e_s = (cx + rx - t, cy - oy), (cx + rx - t, cy + oy)
    s_e, s_w = (cx + ox, cy + ry - t), (cx - ox, cy + ry - t)
    w_s, w_n = (cx - rx + t, cy + oy), (cx - rx + t, cy - oy)
    n_c, e_c = (cx, cy - ry + t), (cx + rx - t, cy)
    s_c, w_c = (cx, cy + ry - t), (cx - rx + t, cy)
    k = INNER
    i_n, i_e = (cx, cy - ry * k), (cx + rx * k, cy)
    i_s, i_w = (cx, cy + ry * k), (cx - rx * k, cy)

    def P(*pts):
        return "M " + " L ".join(pt(*p) for p in pts) + " Z"

    return {
        "nw": P(n_c, n_w, w_n, w_c, i_w, i_n),
        "ne": P(n_c, n_e, e_n, e_c, i_e, i_n),
        "se": P(s_c, s_e, e_s, e_c, i_e, i_s),
        "sw": P(s_c, s_w, w_s, w_c, i_w, i_s),
    }


def facet_group(pal):
    m = constructed_mark()
    # Soft outer stroke so the near-black SE facet still reads on dark headers.
    outline = (
        'M 258.300,115.950 L 264.560,115.950 L 316.030,171.857 L 316.030,179.243 '
        'L 264.560,235.150 L 258.300,235.150 L 206.830,179.243 L 206.830,171.857 Z'
    )
    return f'''    <g id="icon-diamond">
      <path id="icon-outline" d="{outline}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3" stroke-linejoin="miter"/>
      <path d="{m["nw"]}" fill="{pal["nw"]}"/>
      <path d="{m["ne"]}" fill="{pal["ne"]}"/>
      <path d="{m["sw"]}" fill="{pal["sw"]}"/>
      <path d="{m["se"]}" fill="{pal["se"]}"/>
    </g>'''


# --- live outline parsing -------------------------------------------------

def load_live_paths():
    svg = LIVE.read_text(encoding="utf-8")
    mon = re.search(r'id="montrone-wordmark"[^>]*\sd="([^"]+)"', svg).group(1)
    dsp = re.search(r'id="dsp-mark"[^>]*\sd="([^"]+)"', svg).group(1)
    return mon, dsp


def path_tokens(d: str):
    return re.findall(r"[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?", d)


def path_to_absolute(d: str) -> str:
    """Convert SVG path to absolute commands (needed before splitting subpaths)."""
    tokens = path_tokens(d)
    out = []
    i = 0
    cx = cy = sx = sy = 0.0
    last_c = None

    def num():
        nonlocal i
        v = float(tokens[i])
        i += 1
        return v

    while i < len(tokens):
        t = tokens[i]
        if re.match(r"^[A-Za-z]$", t):
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
                cx, cy = sx, sy
                last_c = cmd
                continue
            abs_cmd = cmd.upper()
            if cmd in "Mm":
                first = True
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    if cmd == "M":
                        cx, cy = num(), num()
                    else:
                        # First moveto of entire path: SVG treats 'm' as absolute.
                        # After that (incl. after Z), 'm' is relative to current point.
                        if last_c is None and first:
                            cx, cy = num(), num()
                        else:
                            cx += num()
                            cy += num()
                    if first:
                        out.append(f"M{cx:.5f},{cy:.5f}")
                        sx, sy = cx, cy
                        first = False
                    else:
                        out.append(f"L{cx:.5f},{cy:.5f}")
                last_c = "M"
            elif cmd in "Ll":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    if cmd == "L":
                        cx, cy = num(), num()
                    else:
                        cx += num()
                        cy += num()
                    out.append(f"L{cx:.5f},{cy:.5f}")
                last_c = "L"
            elif cmd in "Hh":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    cx = num() if cmd == "H" else cx + num()
                    out.append(f"L{cx:.5f},{cy:.5f}")
                last_c = "L"
            elif cmd in "Vv":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    cy = num() if cmd == "V" else cy + num()
                    out.append(f"L{cx:.5f},{cy:.5f}")
                last_c = "L"
            elif cmd in "Qq":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    if cmd == "Q":
                        x1, y1 = num(), num()
                        cx, cy = num(), num()
                    else:
                        x1, y1 = cx + num(), cy + num()
                        cx, cy = cx + num(), cy + num()
                    out.append(f"Q{x1:.5f},{y1:.5f} {cx:.5f},{cy:.5f}")
                last_c = "Q"
            elif cmd in "Cc":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    if cmd == "C":
                        x1, y1 = num(), num()
                        x2, y2 = num(), num()
                        cx, cy = num(), num()
                    else:
                        x1, y1 = cx + num(), cy + num()
                        x2, y2 = cx + num(), cy + num()
                        cx, cy = cx + num(), cy + num()
                    out.append(f"C{x1:.5f},{y1:.5f} {x2:.5f},{y2:.5f} {cx:.5f},{cy:.5f}")
                last_c = "C"
            elif cmd in "Tt":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    if cmd == "T":
                        cx, cy = num(), num()
                    else:
                        cx += num()
                        cy += num()
                    out.append(f"T{cx:.5f},{cy:.5f}")
                last_c = "T"
            elif cmd in "Ss":
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    if cmd == "S":
                        x2, y2 = num(), num()
                        cx, cy = num(), num()
                    else:
                        x2, y2 = cx + num(), cy + num()
                        cx, cy = cx + num(), cy + num()
                    out.append(f"S{x2:.5f},{y2:.5f} {cx:.5f},{cy:.5f}")
                last_c = "S"
            else:
                while i < len(tokens) and not re.match(r"^[A-Za-z]$", tokens[i]):
                    i += 1
                last_c = abs_cmd
        else:
            i += 1
    return "".join(out)


def split_subpaths_abs(d: str) -> list[str]:
    abs_d = path_to_absolute(d)
    parts = re.split(r"(?=M)", abs_d)
    return [p for p in parts if p.strip()]


def cluster_letter_groups(paths: list[str], center_gap: float = 15.0) -> list[list[str]]:
    """Group subpaths into letters by x-center so counters share one transform.

    Live outlines touch/overlap in x, so edge-gap clustering fails; center jumps
    separate letters while keeping outer+hole pairs together.
    """
    items = []
    for p in paths:
        x0, y0, x1, y1 = path_bbox(p)
        items.append(((x0 + x1) * 0.5, p))
    items.sort(key=lambda t: t[0])
    groups: list[list[str]] = []
    for cx, p in items:
        if not groups or (cx - items_prev_cx) > center_gap:
            groups.append([p])
        else:
            groups[-1].append(p)
        items_prev_cx = cx
    return groups


def live_subpaths_motion(kind: str) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    """Return (mon_parts, dsp_parts) as list of (svg_transform, path_d)."""
    mon_d, dsp_d = load_live_paths()

    def shear_matrix(k, pivot_y=BASELINE):
        # SVG matrix(a b c d e f): x' = a*x + c*y + e
        # italic: x' = x + k*(pivot_y - y) => c = -k, e = k*pivot_y
        return f"matrix(1 0 {-k:.5f} 1 {k * pivot_y:.4f} 0)"

    def xf(dx=0.0, dy=0.0, k=0.0, sx=1.0, sy=1.0, pivot_x=None):
        parts = []
        if abs(sx - 1.0) > 1e-6 or abs(sy - 1.0) > 1e-6:
            px = pivot_x if pivot_x is not None else 0.0
            parts.append(f"translate({px:.3f} {BASELINE:.3f}) scale({sx:.4f} {sy:.4f}) translate({-px:.3f} {-BASELINE:.3f})")
        if abs(dx) > 1e-6 or abs(dy) > 1e-6:
            parts.append(f"translate({dx:.3f} {dy:.3f})")
        if abs(k) > 1e-6:
            parts.append(shear_matrix(k))
        return " ".join(parts) if parts else ""

    # Whole-path transforms (safe): shear / rush / lift
    if kind in ("live_shear", "live_rush", "live_lift_dsp"):
        if kind == "live_shear":
            return ([(xf(k=0.22), mon_d)], [(xf(dx=2.5, k=0.30), dsp_d)])
        if kind == "live_rush":
            return ([(xf(dx=-3.0, k=0.32), mon_d)], [(xf(dx=-8.0, k=0.40), dsp_d)])
        return ([(xf(k=0.20), mon_d)], [(xf(dx=8.0, dy=-6.0, k=0.38), dsp_d)])

    # Per-letter groups (absolute) — counters stay locked to shells
    mons = cluster_letter_groups(split_subpaths_abs(mon_d))
    dsps = cluster_letter_groups(split_subpaths_abs(dsp_d), center_gap=12.0)
    n = max(len(mons) - 1, 1)
    out_m, out_d = [], []

    def emit(groups, maker, bucket):
        for i, g in enumerate(groups):
            tr = maker(i, len(groups))
            for p in g:
                bucket.append((tr, p))

    if kind == "live_stagger":
        def mon_tr(i, total):
            t = i / max(total - 1, 1)
            return xf(dx=t * 7.5, dy=-math.sin(t * math.pi) * 5.5, k=0.08 + 0.22 * t)

        def dsp_tr(i, total):
            t = i / max(total - 1, 1)
            return xf(dx=6.0 + t * 2.5, dy=-1.5, k=0.30 + 0.06 * t)

        emit(mons, mon_tr, out_m)
        emit(dsps, dsp_tr, out_d)
    elif kind == "live_wave":
        def mon_tr(i, total):
            t = i / max(total - 1, 1)
            return xf(
                dx=t * 2.5,
                dy=math.sin(t * math.pi * 2) * 4.8,
                k=0.14 + 0.14 * math.sin(t * math.pi),
            )

        def dsp_tr(i, total):
            t = i / max(total - 1, 1)
            return xf(dx=3.0, dy=1.2 + math.sin((t + 0.25) * math.pi * 2) * 2.0, k=0.28)

        emit(mons, mon_tr, out_m)
        emit(dsps, dsp_tr, out_d)
    elif kind == "live_cascade":
        # Rising scale + lean: M grounded, E lifts and leans hardest
        def mon_tr(i, total):
            t = i / max(total - 1, 1)
            # estimate pivot from group bbox mid
            xs = []
            for p in mons[i]:
                x0, _, x1, _ = path_bbox(p)
                xs.extend([x0, x1])
            px = sum(xs) / len(xs)
            return xf(dx=t * 4.0, dy=-t * 3.5, k=0.10 + 0.26 * t, sx=1.0 + 0.04 * t, sy=1.0 + 0.06 * t, pivot_x=px)

        def dsp_tr(i, total):
            t = i / max(total - 1, 1)
            xs = []
            for p in dsps[i]:
                x0, _, x1, _ = path_bbox(p)
                xs.extend([x0, x1])
            px = sum(xs) / len(xs)
            return xf(dx=5.0 + t * 3.0, dy=-5.0, k=0.36, sx=1.05, sy=1.08, pivot_x=px)

        emit(mons, mon_tr, out_m)
        emit(dsps, dsp_tr, out_d)
    elif kind == "live_pulse":
        # Alternating vertical bounce + shared strong shear
        def mon_tr(i, total):
            t = i / max(total - 1, 1)
            bounce = 4.2 if i % 2 == 0 else -3.4
            return xf(dx=t * 2.0, dy=bounce, k=0.24)

        def dsp_tr(i, total):
            bounce = 2.5 if i % 2 == 0 else -2.0
            return xf(dx=4.0, dy=bounce - 1.0, k=0.32)

        emit(mons, mon_tr, out_m)
        emit(dsps, dsp_tr, out_d)
    else:
        raise ValueError(kind)
    return out_m, out_d


def transform_path_d(d: str, fn) -> str:
    """Apply fn(x,y)->(x,y) to all absolute coords; convert relative to absolute first."""
    tokens = path_tokens(d)
    out = []
    i = 0
    cx = cy = 0.0
    sx = sy = 0.0
    prev = None
    while i < len(tokens):
        t = tokens[i]
        if re.match(r"[A-Za-z]", t) and not re.match(r"^[eE]", t):
            cmd = t
            i += 1
            if cmd in "Zz":
                out.append("Z")
                cx, cy = sx, sy
                prev = cmd
                continue

            def num():
                nonlocal i
                v = float(tokens[i])
                i += 1
                return v

            if cmd == "M":
                cx, cy = num(), num()
                sx, sy = cx, cy
                x, y = fn(cx, cy)
                out.append(f"M{x:.4f},{y:.4f}")
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx, cy = num(), num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "m":
                if prev in (None, "Z", "z"):
                    cx, cy = num(), num()
                else:
                    cx += num()
                    cy += num()
                sx, sy = cx, cy
                x, y = fn(cx, cy)
                out.append(f"M{x:.4f},{y:.4f}")
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx += num()
                    cy += num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "L":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx, cy = num(), num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "l":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx += num()
                    cy += num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "H":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx = num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "h":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx += num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "V":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cy = num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "v":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cy += num()
                    x, y = fn(cx, cy)
                    out.append(f"L{x:.4f},{y:.4f}")
            elif cmd == "Q":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    x1, y1 = fn(num(), num())
                    cx, cy = num(), num()
                    x, y = fn(cx, cy)
                    out.append(f"Q{x1:.4f},{y1:.4f} {x:.4f},{y:.4f}")
            elif cmd == "q":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    dx1, dy1 = num(), num()
                    dx, dy = num(), num()
                    x1, y1 = fn(cx + dx1, cy + dy1)
                    cx, cy = cx + dx, cy + dy
                    x, y = fn(cx, cy)
                    out.append(f"Q{x1:.4f},{y1:.4f} {x:.4f},{y:.4f}")
            elif cmd == "C":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    x1, y1 = fn(num(), num())
                    x2, y2 = fn(num(), num())
                    cx, cy = num(), num()
                    x, y = fn(cx, cy)
                    out.append(f"C{x1:.4f},{y1:.4f} {x2:.4f},{y2:.4f} {x:.4f},{y:.4f}")
            elif cmd == "c":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    dx1, dy1 = num(), num()
                    dx2, dy2 = num(), num()
                    dx, dy = num(), num()
                    x1, y1 = fn(cx + dx1, cy + dy1)
                    x2, y2 = fn(cx + dx2, cy + dy2)
                    cx, cy = cx + dx, cy + dy
                    x, y = fn(cx, cy)
                    out.append(f"C{x1:.4f},{y1:.4f} {x2:.4f},{y2:.4f} {x:.4f},{y:.4f}")
            elif cmd == "T":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx, cy = num(), num()
                    x, y = fn(cx, cy)
                    out.append(f"T{x:.4f},{y:.4f}")
            elif cmd == "t":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    cx += num()
                    cy += num()
                    x, y = fn(cx, cy)
                    out.append(f"T{x:.4f},{y:.4f}")
            elif cmd == "S":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    x2, y2 = fn(num(), num())
                    cx, cy = num(), num()
                    x, y = fn(cx, cy)
                    out.append(f"S{x2:.4f},{y2:.4f} {x:.4f},{y:.4f}")
            elif cmd == "s":
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    dx2, dy2 = num(), num()
                    dx, dy = num(), num()
                    x2, y2 = fn(cx + dx2, cy + dy2)
                    cx, cy = cx + dx, cy + dy
                    x, y = fn(cx, cy)
                    out.append(f"S{x2:.4f},{y2:.4f} {x:.4f},{y:.4f}")
            else:
                # skip unknown with remaining numbers for this cmd
                while i < len(tokens) and not re.match(r"[A-Za-z]", tokens[i]):
                    i += 1
            prev = cmd
        else:
            i += 1
    return "".join(out)


def path_bbox(d: str):
    xs, ys = [], []
    for a, b in re.findall(r"([-+]?(?:\d*\.\d+|\d+))[,\s]+([-+]?(?:\d*\.\d+|\d+))", d):
        xs.append(float(a))
        ys.append(float(b))
    if not xs:
        return 0, 0, 0, 0
    return min(xs), min(ys), max(xs), max(ys)


def shear_fn(k=0.22, pivot_y=BASELINE):
    # SVG y-down: italic leans right as y goes up visually = smaller y
    # x' = x + k*(pivot_y - y)
    def fn(x, y):
        return x + k * (pivot_y - y), y
    return fn


def translate_fn(dx, dy):
    def fn(x, y):
        return x + dx, y + dy
    return fn


def compose(*fns):
    def fn(x, y):
        for f in fns:
            x, y = f(x, y)
        return x, y
    return fn


# --- Roboto variable ------------------------------------------------------

_ROBOTO_CACHE = {}


def roboto_font(wght=700, wdth=75):
    key = (wght, wdth)
    if key not in _ROBOTO_CACHE:
        base = TTFont(str(ROBOTO))
        inst = instantiateVariableFont(base, {"wght": wght, "wdth": wdth})
        _ROBOTO_CACHE[key] = inst
    return _ROBOTO_CACHE[key]


def cap_height(font: TTFont) -> float:
    os2 = font["OS/2"]
    if getattr(os2, "sCapHeight", None):
        return float(os2.sCapHeight)
    return float(font["hhea"].ascent) * 0.72


def draw_roboto_word(text, origin_x, baseline, cap_px, wght, wdth, shear_k,
                     track=0.0, pair_pull=None):
    font = roboto_font(wght, wdth)
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    ch = cap_height(font)
    scale = cap_px / ch
    pair_pull = pair_pull or {}
    x = origin_x
    paths = []
    prev = None
    for c in text:
        if prev:
            x += pair_pull.get(prev + c, 0.0) * cap_px
            x += track * cap_px
        gname = cmap[ord(c)]
        glyph = gs[gname]
        # place then shear around baseline
        t = Transform(1, 0, -shear_k, 1, shear_k * baseline, 0).transform(
            Transform(scale, 0, 0, -scale, x, baseline)
        )
        # Wait: Transform(a,b,c,d,e,f) is [[a,b],[c,d]] + [e,f]
        # For SVG shear italic: x' = x + k*(baseline - y_svg)
        # After font transform: (fx*scale+x, baseline - fy*scale)
        # Better: draw with scale first, then shear in svg space via combined:
        # shear around baseline: x' = x + k*(baseline-y)
        # matrix: x' = 1*x + k*y_term... y_svg = baseline - fy*scale
        # x' = x_placed + k*(baseline - y_svg) = x_placed + k*fy*scale
        # so after scale+flip: add x shear proportional to font y
        # TransformPen order: glyph -> T where T maps font to svg
        # font (fx,fy) -> (x + scale*fx + shear_k*scale*fy, baseline - scale*fy)
        t = Transform(scale, 0, shear_k * scale, -scale, x, baseline)
        pen = SVGPathPen(gs)
        glyph.draw(TransformPen(pen, t))
        d = pen.getCommands()
        if d:
            paths.append(d)
        x += glyph.width * scale
        prev = c
    return paths, x


def roboto_wordmark(kind: str, pal: dict) -> tuple[str, float]:
    pair = {
        "MO": -0.04, "ON": -0.02, "NT": -0.06, "TR": -0.08,
        "RO": -0.02, "NE": -0.03, "DS": -0.02, "SP": -0.03,
    }
    if kind == "roboto_shear":
        mon, mend = draw_roboto_word(
            "MONTRONE", 0.3, BASELINE, CAP, 750, 78, 0.22,
            track=0.004, pair_pull=pair,
        )
        dsp, dend = draw_roboto_word(
            "DSP", mend + 0.10 * CAP, BASELINE, CAP * DSP_RATIO, 650, 80, 0.28,
            track=0.01, pair_pull=pair,
        )
    elif kind == "roboto_rush":
        # stronger shear + crush
        pair2 = {k: v - 0.03 for k, v in pair.items()}
        mon, mend = draw_roboto_word(
            "MONTRONE", 0.3, BASELINE, CAP, 800, 75, 0.30,
            track=-0.01, pair_pull=pair2,
        )
        dsp, dend = draw_roboto_word(
            "DSP", mend + 0.04 * CAP, BASELINE, CAP * 0.62, 700, 75, 0.36,
            track=0.0, pair_pull=pair2,
        )
    elif kind == "roboto_wave":
        font_w, font_wd = 740, 78
        x = 0.3
        mon = []
        for i, c in enumerate("MONTRONE"):
            t = i / 7
            dy = math.sin(t * math.pi * 2) * 5.0
            k = 0.14 + 0.18 * t
            paths, _ = draw_roboto_word(
                c, x, BASELINE + dy, CAP, font_w, font_wd, k,
                track=0, pair_pull={},
            )
            mon.extend(paths)
            pull = pair.get(("MONTRONE"[i - 1] + c) if i else "", 0) if i else 0
            _, end0 = draw_roboto_word(c, 0, BASELINE, CAP, font_w, font_wd, 0, 0, {})
            x += end0 + (0.008 + pull) * CAP
        mend = x
        dsp, dend = draw_roboto_word(
            "DSP", mend + 0.06 * CAP, BASELINE + 1.2, CAP * DSP_RATIO, 680, 78, 0.34,
            track=0.006, pair_pull=pair,
        )
    elif kind == "roboto_track":
        mon, mend = draw_roboto_word(
            "MONTRONE", 0.3, BASELINE, CAP, 700, 85, 0.18,
            track=0.035, pair_pull={k: 0 for k in pair},
        )
        dsp, dend = draw_roboto_word(
            "DSP", mend + 0.16 * CAP, BASELINE, CAP * DSP_RATIO, 600, 85, 0.22,
            track=0.04, pair_pull={},
        )
    elif kind == "roboto_cascade":
        font_w, font_wd = 780, 74
        x = 0.3
        mon = []
        for i, c in enumerate("MONTRONE"):
            t = i / 7
            dy = -t * 4.0
            k = 0.10 + 0.28 * t
            cap_i = CAP * (1.0 + 0.05 * t)
            paths, _ = draw_roboto_word(
                c, x, BASELINE + dy, cap_i, font_w, font_wd, k,
                track=0, pair_pull={},
            )
            mon.extend(paths)
            pull = pair.get(("MONTRONE"[i - 1] + c) if i else "", 0) if i else 0
            _, end0 = draw_roboto_word(c, 0, BASELINE, CAP, font_w, font_wd, 0, 0, {})
            x += end0 + (-0.005 + pull) * CAP
        mend = x
        dsp, dend = draw_roboto_word(
            "DSP", mend + 0.04 * CAP, BASELINE - 5.5, CAP * 0.78, 720, 74, 0.40,
            track=0.0, pair_pull=pair,
        )
    elif kind == "roboto_pulse":
        font_w, font_wd = 760, 76
        x = 0.3
        mon = []
        for i, c in enumerate("MONTRONE"):
            t = i / 7
            dy = 4.5 if i % 2 == 0 else -3.8
            k = 0.26
            paths, _ = draw_roboto_word(
                c, x, BASELINE + dy, CAP, font_w, font_wd, k,
                track=0, pair_pull={},
            )
            mon.extend(paths)
            pull = pair.get(("MONTRONE"[i - 1] + c) if i else "", 0) if i else 0
            _, end0 = draw_roboto_word(c, 0, BASELINE, CAP, font_w, font_wd, 0, 0, {})
            x += end0 + (0.012 + pull) * CAP
        mend = x
        dsp_parts = []
        xd = mend + 0.08 * CAP
        for i, c in enumerate("DSP"):
            dy = 2.8 if i % 2 == 0 else -2.2
            paths, _ = draw_roboto_word(
                c, xd, BASELINE + dy, CAP * DSP_RATIO, 680, 78, 0.34,
                track=0, pair_pull={},
            )
            dsp_parts.extend(paths)
            _, end0 = draw_roboto_word(c, 0, BASELINE, CAP * DSP_RATIO, 680, 78, 0, 0, {})
            xd += end0 + 0.01 * CAP
        dsp, dend = dsp_parts, xd
    else:
        raise ValueError(kind)

    parts = [f'      <path fill="{pal["montrone"]}" d="{d}"/>' for d in mon]
    parts += [f'      <path fill="{pal["dsp"]}" d="{d}"/>' for d in dsp]
    return "\n".join(parts), dend


# --- variants -------------------------------------------------------------

VARIANTS = {
    "m01_live_shear": {
        "title": "Live outline — italic shear (movement)",
        "kind": "live_shear",
        "source": "live",
    },
    "m02_live_stagger": {
        "title": "Live outline — stagger + accelerating lean",
        "kind": "live_stagger",
        "source": "live",
    },
    "m03_live_wave": {
        "title": "Live outline — wave baseline + shear",
        "kind": "live_wave",
        "source": "live",
    },
    "m04_live_rush": {
        "title": "Live outline — forward rush (pack + lean)",
        "kind": "live_rush",
        "source": "live",
    },
    "m05_live_lift_dsp": {
        "title": "Live outline — DSP lifts as trailing energy",
        "kind": "live_lift_dsp",
        "source": "live",
    },
    "m06_roboto_shear": {
        "title": "Roboto condensed bold — optical + shear",
        "kind": "roboto_shear",
        "source": "roboto",
    },
    "m07_roboto_rush": {
        "title": "Roboto — hard crush + strong italic rush",
        "kind": "roboto_rush",
        "source": "roboto",
    },
    "m08_roboto_wave": {
        "title": "Roboto — letter wave + progressive lean",
        "kind": "roboto_wave",
        "source": "roboto",
    },
    "m09_roboto_track": {
        "title": "Roboto — open tracking, light shear (air + motion)",
        "kind": "roboto_track",
        "source": "roboto",
    },
    "m10_live_cascade": {
        "title": "Live outline — cascade lift + accelerating lean",
        "kind": "live_cascade",
        "source": "live",
    },
    "m11_live_pulse": {
        "title": "Live outline — alternating pulse bounce + shear",
        "kind": "live_pulse",
        "source": "live",
    },
    "m12_roboto_cascade": {
        "title": "Roboto — cascade scale-up + hard trailing lean",
        "kind": "roboto_cascade",
        "source": "roboto",
    },
    "m13_roboto_pulse": {
        "title": "Roboto — alternating pulse bounce + shared lean",
        "kind": "roboto_pulse",
        "source": "roboto",
    },
}


def build_wordmark(var: dict, pal: dict) -> tuple[str, float]:
    if var["source"] == "live":
        mons, dsps = live_subpaths_motion(var["kind"])
        parts = []
        for tr, d in mons:
            if tr:
                parts.append(f'      <g transform="{tr}"><path fill="{pal["montrone"]}" d="{d}"/></g>')
            else:
                parts.append(f'      <path fill="{pal["montrone"]}" d="{d}"/>')
        for tr, d in dsps:
            if tr:
                parts.append(f'      <g transform="{tr}"><path fill="{pal["dsp"]}" d="{d}"/></g>')
            else:
                parts.append(f'      <path fill="{pal["dsp"]}" d="{d}"/>')
        return "\n".join(parts), 480.0
    return roboto_wordmark(var["kind"], pal)


def write_lockup(vid: str, var: dict, skin: str, pal: dict):
    wm, _ = build_wordmark(var, pal)
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 15 1000 310" shape-rendering="geometricPrecision">
  <title>MontroneDSP {skin} — {var["title"]}</title>
  <desc>Local motion study only. Does not replace live header files.</desc>
  <g transform="translate(-160.05, 0)">
{facet_group(pal)}
    <g id="wordmark" transform="translate(348.669,129.276) scale(1.14968)">
{wm}
    </g>
  </g>
</svg>
'''
    name = f"montrone_dsp_logo_header_{skin}_wmotion_{vid}.svg"
    (OUT / name).write_text(svg, encoding="utf-8", newline="\n")
    print("wrote", name)


def write_wordmark(vid: str, var: dict):
    pal = {"montrone": "#f2f2f2", "dsp": "#9b4f9e"}
    wm, end = build_wordmark(var, pal)
    pad = 10
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {BASELINE - CAP - 12} {max(end, 420) + 2 * pad} {CAP + 28}" shape-rendering="geometricPrecision">
  <title>{var["title"]}</title>
  <desc>Local motion wordmark study.</desc>
  <g>
{wm}
  </g>
</svg>
'''
    name = f"montrone_dsp_wordmark_wmotion_{vid}.svg"
    (OUT / name).write_text(svg, encoding="utf-8", newline="\n")
    print("wrote", name)


def write_preview(ids):
    rows = []
    for vid in ids:
        title = VARIANTS[vid]["title"]
        src = VARIANTS[vid]["source"]
        rows.append(f"""
  <section id="{vid}">
    <h2>{vid} <span class="tag">{src}</span></h2>
    <p class="note">{title}</p>
    <p class="big"><img src="assets/branding/montrone_dsp_logo_header_aura_wmotion_{vid}.svg" alt=""></p>
    <p class="wm"><img src="assets/branding/montrone_dsp_wordmark_wmotion_{vid}.svg" alt=""></p>
    <p class="hdr">
      <img src="assets/branding/montrone_dsp_logo_header_aura_wmotion_{vid}.svg" alt="">
      <img src="assets/branding/montrone_dsp_logo_header_martello_wmotion_{vid}.svg" alt="">
      <img src="assets/branding/montrone_dsp_logo_header_mono_wmotion_{vid}.svg" alt="">
    </p>
  </section>""")
    nav = " · ".join(f'<a href="#{v}">{v}</a>' for v in ids)
    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>wordmark motion studies</title>
<style>
  body {{ margin:0; background:#0a0a0c; color:#aaa; font:14px/1.45 system-ui,sans-serif; }}
  a {{ color:#c9a0d9; text-decoration:none; }}
  h1,h2 {{ color:#fff; font-weight:600; margin:0 0 8px; }}
  .tag {{ font-size:12px; color:#888; font-weight:500; margin-left:8px; }}
  section {{ padding:32px 40px; border-bottom:1px solid #1c1c22; }}
  .note {{ color:#888; margin:0 0 14px; }}
  .big img {{ height:100px; width:auto; display:block; }}
  .wm img {{ height:52px; width:auto; margin:12px 0; display:block; }}
  .hdr img {{ height:28px; width:auto; margin-right:26px; }}
  .toc {{ padding:20px 40px; border-bottom:1px solid #1c1c22; line-height:1.9; }}
</style></head>
<body>
  <section>
    <h1>Wordmark motion studies</h1>
    <p class="note">Live headers untouched. Sources: live Aura outlines + Roboto Variable (site face).
    Goal: movement and interest — shear, stagger, wave, rush.</p>
  </section>
  <div class="toc">{nav}</div>
  {''.join(rows)}
</body></html>
"""
    (PY / "_wmotion_preview.html").write_text(html, encoding="utf-8", newline="\n")
    print("wrote _wmotion_preview.html")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if not ROBOTO.exists():
        raise SystemExit(f"missing Roboto: {ROBOTO}")
    if not LIVE.exists():
        raise SystemExit(f"missing live aura: {LIVE}")
    for vid, var in VARIANTS.items():
        write_wordmark(vid, var)
        for skin, pal in PALETTES.items():
            write_lockup(vid, var, skin, pal)
    write_preview(list(VARIANTS))


if __name__ == "__main__":
    main()
