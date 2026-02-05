#!/usr/bin/env python3
"""
Simple script to create placeholder PWA icons.
Requires Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    
    # Create 192x192 icon
    img192 = Image.new('RGB', (192, 192), color='#2C3E50')
    draw192 = ImageDraw.Draw(img192)
    
    # Draw text (simple approach)
    try:
        # Try to use a larger font
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 40)
        except:
            font = ImageFont.load_default()
    
    # Center text
    text = "STORE"
    bbox = draw192.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((192 - text_width) / 2, (192 - text_height) / 2 - 20)
    
    draw192.text(position, text, fill='#1ABC9C', font=font)
    draw192.text(((192 - text_width) / 2, (192 - text_height) / 2 + 20), "BILLING", fill='#1ABC9C', font=font)
    
    img192.save('icon-192.png')
    print("✓ Created icon-192.png")
    
    # Create 512x512 icon
    img512 = Image.new('RGB', (512, 512), color='#2C3E50')
    draw512 = ImageDraw.Draw(img512)
    
    try:
        font512 = ImageFont.truetype("arial.ttf", 100)
    except:
        try:
            font512 = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 100)
        except:
            font512 = ImageFont.load_default()
    
    text = "STORE"
    bbox = draw512.textbbox((0, 0), text, font=font512)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((512 - text_width) / 2, (512 - text_height) / 2 - 50)
    
    draw512.text(position, text, fill='#1ABC9C', font=font512)
    draw512.text(((512 - text_width) / 2, (512 - text_height) / 2 + 50), "BILLING", fill='#1ABC9C', font=font512)
    
    img512.save('icon-512.png')
    print("✓ Created icon-512.png")
    print("\nIcons created successfully!")
    print("Make sure these files are in the static/icons/ directory")
    
except ImportError:
    print("Pillow not installed. Install it with: pip install Pillow")
    print("\nAlternatively, use one of these methods:")
    print("1. Open static/generate-icons.html in a browser")
    print("2. Use an online icon generator")
    print("3. Create icons manually in an image editor")
except Exception as e:
    print(f"Error creating icons: {e}")
    print("\nPlease create icons manually:")
    print("- icon-192.png (192×192 pixels)")
    print("- icon-512.png (512×512 pixels)")
    print("Place them in static/icons/ directory")

