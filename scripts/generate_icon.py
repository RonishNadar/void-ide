#!/usr/bin/env python3
"""
generate_icon.py — Creates smooth Void IDE icons for electron-builder
Run once before building: python3 scripts/generate_icon.py

Requires:
    pip install Pillow --break-system-packages
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os

CYAN = (78, 201, 201, 255)
BG   = (8, 10, 13, 255)
DARK = (14, 17, 23, 255)

SIZES = [16, 24, 32, 48, 64, 96, 128, 256, 512]

FONT_PATHS = [
    "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansMono-Bold.ttf",
]

# Draw at this multiple, then downsample.
SUPERSAMPLE = 8


def hex_points(cx, cy, r, flat_top=True):
    pts = []
    angle_offset = 0 if flat_top else 30
    for i in range(6):
        angle = math.radians(60 * i + angle_offset)
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts


def get_font(size):
    for fp in FONT_PATHS:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()


def draw_glow_polygon(base, points, color, blur_radius, alpha):
    """
    Draw a soft glow by rendering the polygon to a separate layer,
    blurring it, then compositing it back.
    """
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow, "RGBA")
    gdraw.polygon(points, fill=(color[0], color[1], color[2], alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    return Image.alpha_composite(base, glow)


def draw_master_icon(size):
    """
    Draw the icon at high resolution for anti-aliased downsampling.
    """
    scale = SUPERSAMPLE
    big = size * scale
    half = big // 2

    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    r_outer = int(big * 0.43)
    r_inner = int(r_outer * 0.93)

    outer_pts = hex_points(half, half, r_outer, flat_top=True)
    inner_pts = hex_points(half, half, r_inner, flat_top=True)

    # Soft outer glow
    img = draw_glow_polygon(
        img,
        outer_pts,
        CYAN,
        blur_radius=max(4, big // 64),
        alpha=70,
    )
    img = draw_glow_polygon(
        img,
        outer_pts,
        CYAN,
        blur_radius=max(8, big // 36),
        alpha=28,
    )

    draw = ImageDraw.Draw(img, "RGBA")

    # Outer background
    draw.polygon(outer_pts, fill=BG)

    # Inner fill
    draw.polygon(inner_pts, fill=DARK)

    # Border
    border_width = max(6, big // 90)
    draw.polygon(outer_pts, outline=CYAN, width=border_width)

    # Text "{}"
    # Slightly smaller than before for better balance and legibility.
    text = "{}"
    font_size = int(big * 0.29)
    font = get_font(font_size)

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    tx = half - text_w / 2 - bbox[0]
    ty = half - text_h / 2 - bbox[1]

    # Text glow on separate blurred layers
    text_glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    tg = ImageDraw.Draw(text_glow, "RGBA")
    tg.text((tx, ty), text, font=font, fill=(CYAN[0], CYAN[1], CYAN[2], 150))
    text_glow = text_glow.filter(ImageFilter.GaussianBlur(radius=max(2, big // 100)))
    img = Image.alpha_composite(img, text_glow)

    text_glow2 = Image.new("RGBA", img.size, (0, 0, 0, 0))
    tg2 = ImageDraw.Draw(text_glow2, "RGBA")
    tg2.text((tx, ty), text, font=font, fill=(CYAN[0], CYAN[1], CYAN[2], 60))
    text_glow2 = text_glow2.filter(ImageFilter.GaussianBlur(radius=max(4, big // 60)))
    img = Image.alpha_composite(img, text_glow2)

    draw = ImageDraw.Draw(img, "RGBA")
    draw.text((tx, ty), text, font=font, fill=CYAN)

    return img


def draw_icon(size):
    """
    Draw at high res and downsample for crisp final output.
    """
    master = draw_master_icon(size)
    return master.resize((size, size), Image.Resampling.LANCZOS)


if __name__ == "__main__":
    os.makedirs("assets", exist_ok=True)
    icons_dir = "assets/icons"
    os.makedirs(icons_dir, exist_ok=True)

    img512 = draw_icon(512)
    img512.save("assets/icon.png", "PNG")
    print("Saved assets/icon.png (512x512)")

    for s in SIZES:
        img = draw_icon(s)
        out = os.path.join(icons_dir, f"{s}x{s}.png")
        img.save(out, "PNG")
        print(f"Saved {out}")

    print("\nAll icons generated. Ready to build.")