# PWA Icons

This directory should contain the following icon files for the Progressive Web App:

## Required Files

1. **icon-192.png** - 192×192 pixels
   - Used for app icons on Android and iOS
   - Should be a square PNG image

2. **icon-512.png** - 512×512 pixels
   - Used for splash screens and high-resolution displays
   - Should be a square PNG image

## Creating Icons

### Option 1: Use the HTML Generator
1. Open `static/generate-icons.html` in a web browser
2. Right-click each canvas and "Save image as..."
3. Save as `icon-192.png` and `icon-512.png` in this directory

### Option 2: Use an Image Editor
1. Create a square image (192×192 or 512×512)
2. Recommended design:
   - Background color: #2C3E50 (dark blue-gray)
   - Accent color: #1ABC9C (teal)
   - Text: "STORE" or store logo
3. Export as PNG format
4. Save in this directory

### Option 3: Online Tools
- Visit https://realfavicongenerator.net/
- Upload your logo/image
- Download the generated icons
- Place the 192×192 and 512×512 icons here

## Icon Requirements

- Format: PNG
- Sizes: Exactly 192×192 and 512×512 pixels
- Purpose: Should work as "any maskable" (transparent or solid background)
- File names: Must be exactly `icon-192.png` and `icon-512.png`

## Testing

After adding icons:
1. Clear browser cache
2. Restart Flask app
3. Open app in Chrome/Edge
4. Check DevTools > Application > Manifest
5. Icons should appear in the manifest preview

