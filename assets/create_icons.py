#!/usr/bin/env python3
"""Generate placeholder icons for YT Lemon String PWA"""

try:
    from PIL import Image, ImageDraw, ImageFont

    # Icon sizes needed
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]

    # Colors
    bg_color = (29, 185, 84)  # Accent green #1db954
    text_color = (255, 255, 255)  # White

    for size in sizes:
        # Create image
        img = Image.new('RGB', (size, size), bg_color)
        draw = ImageDraw.Draw(img)

        # Draw text
        text = "🍋"

        # Try to use a larger font for bigger icons
        try:
            font_size = size // 2
            font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", font_size)
        except:
            font = ImageFont.load_default()

        # Center the text
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2

        draw.text((x, y), text, fill=text_color, font=font)

        # Save
        filename = f"icons/icon-{size}x{size}.png"
        img.save(filename)
        print(f"Created {filename}")

    # Create placeholder image
    placeholder = Image.new('RGB', (300, 300), (40, 40, 40))
    draw = ImageDraw.Draw(placeholder)

    text = "♪"
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 120)
    except:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (300 - text_width) // 2
    y = (300 - text_height) // 2

    draw.text((x, y), text, fill=(179, 179, 179), font=font)
    placeholder.save("images/placeholder.png")
    print("Created images/placeholder.png")

    print("\nAll icons created successfully!")

except ImportError:
    print("PIL/Pillow not installed. Creating simple colored squares...")
    print("Run: pip3 install Pillow")
    print("\nAlternatively, download icons manually from:")
    print("https://www.pwabuilder.com/imageGenerator")
