"""Prepare website Martello page screenshots from release capture PNGs."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SOURCE = Path(r"C:\Users\Cynic Audio\Desktop\FINALRELEASE\screenshots")
OUT = Path(__file__).resolve().parents[1] / "assets" / "screenshots"

X2_HERO_SIZE = (1920, 1258)
TRIPTYCH_PANEL = (404, 560)
TRIPTYCH_SIZE = (1212, 560)
PANEL_BG = (10, 10, 10)

# PluginEditor layout at 2x snapshot scale (820x740 editor, scale 2.0).
HEADER_ROW_PX = (12 + 40 + 6) * 2
VOICE_PANEL_PX = 178 * 2
VOICE_GAP_PX = 8 * 2
VOICE_DROPDOWN_PX = 760


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    print(f"wrote {path.name} {img.size}")


def resize_lanczos(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    return img.resize(size, Image.Resampling.LANCZOS)


def fit_panel(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Scale a crop to fit inside the panel without stretching."""
    target_w, target_h = size
    scale = min(target_w / img.width, target_h / img.height)
    fitted = resize_lanczos(
        img,
        (max(1, int(img.width * scale)), max(1, int(img.height * scale))),
    )
    canvas = Image.new("RGB", size, PANEL_BG)
    offset_x = (target_w - fitted.width) // 2
    offset_y = 0
    canvas.paste(fitted, (offset_x, offset_y))
    return canvas


def voice_band_top(voice_index: int) -> int:
    return HEADER_ROW_PX + voice_index * (VOICE_PANEL_PX + VOICE_GAP_PX)


def crop_voice_band(img: Image.Image, voice_index: int) -> Image.Image:
    """Crop one full-width voice row with its model dropdown from a combo capture."""
    top = max(0, voice_band_top(voice_index) - 20)
    bottom = min(img.height, top + VOICE_DROPDOWN_PX)
    return img.crop((0, top, img.width, bottom))


def build_triptych(voice_combo_paths: list[Path], out_path: Path) -> None:
    panels = [
        fit_panel(crop_voice_band(Image.open(path), index), TRIPTYCH_PANEL)
        for index, path in enumerate(voice_combo_paths)
    ]
    canvas = Image.new("RGB", TRIPTYCH_SIZE, PANEL_BG)
    for index, panel in enumerate(panels):
        canvas.paste(panel, (index * TRIPTYCH_PANEL[0], 0))
    save_png(canvas, out_path)


def main() -> None:
    martello_main = Image.open(SOURCE / "Martello_Dark_Main_Default.png")
    save_png(martello_main, OUT / "editorial_hero_martello_dark.png")

    x2_main = Image.open(SOURCE / "MartelloX2_Dark_Main_Default.png")
    save_png(resize_lanczos(x2_main, X2_HERO_SIZE), OUT / "editorial_hero_x2_dark.png")

    build_triptych(
        [
            SOURCE / "Martello_Dark_ModelCombo_Voice1.png",
            SOURCE / "Martello_Dark_ModelCombo_Voice2.png",
            SOURCE / "Martello_Dark_ModelCombo_Voice3.png",
        ],
        OUT / "editorial_triptych_voices.png",
    )


if __name__ == "__main__":
    main()
