#!/usr/bin/env python3
"""
generate_icon.py — Creates Void IDE icons in all sizes required by electron-builder
Run once before building: python3 scripts/generate_icon.py
Requires: pip install Pillow --break-system-packages
"""

from PIL import Image, ImageDraw, ImageFont
import math, os, sys

CYAN = (78, 201, 201)
BG   = (8, 10, 13)
DARK = (14, 17, 23)

def hex_points(cx, cy, r, flat_top=False):
    pts = []
    for i in range(6):
        angle = math.radians(60 * i + (0 if flat_top else 30))
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts

def draw_icon(size):
    half = size // 2
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    r = int(size * 0.43)

    # Glow
    for glow_r in range(r, r - 12, -2):
        alpha = int(40 * (1 - (glow_r - (r - 12)) / 12))
        pts = hex_points(half, half, glow_r, flat_top=True)
        draw.polygon(pts, fill=(*CYAN, alpha))

    # Background hex
    pts = hex_points(half, half, r, flat_top=True)
    draw.polygon(pts, fill=BG)

    # Inner hex
    pts_inner = hex_points(half, half, int(r * 0.95), flat_top=True)
    draw.polygon(pts_inner, fill=DARK)

    # Border
    draw.polygon(pts, outline=CYAN, width=max(2, size // 85))

    # Text "{}"
    text = "{}"
    font = None
    font_size = int(size * 0.33)
    font_paths = [
        "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansMono-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                pass

    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = half - tw // 2 - bbox[0]
    ty = half - th // 2 - bbox[1]

    # Glow passes
    for dx, dy in [(-2,0),(2,0),(0,-2),(0,2)]:
        draw.text((tx+dx, ty+dy), text, font=font, fill=(*CYAN, 80))

    draw.text((tx, ty), text, font=font, fill=CYAN)

    return img

# electron-builder requires icons at these sizes in icons/ subdirectory
SIZES = [16, 24, 32, 48, 64, 96, 128, 256, 512]

if __name__ == "__main__":
    # 1. Save main icon
    os.makedirs("assets", exist_ok=True)
    img512 = draw_icon(512)
    img512.save("assets/icon.png", "PNG")
    print("Saved assets/icon.png (512x512)")

    # 2. Save all sizes for electron-builder linux icon set
    icons_dir = "assets/icons"
    os.makedirs(icons_dir, exist_ok=True)
    for s in SIZES:
        img = draw_icon(s)
        out = os.path.join(icons_dir, f"{s}x{s}.png")
        img.save(out, "PNG")
        print(f"Saved {out}")

    print("\nAll icons generated. Ready to build.")