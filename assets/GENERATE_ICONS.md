# Generate PWA Icons

You need to create PWA icons for the app to work properly as a Progressive Web App.

## Quick Method: Use an Icon Generator

1. Create a 512x512 PNG icon with your logo/design
2. Use an online PWA icon generator:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/

3. Upload your 512x512 icon
4. Download the generated icon pack
5. Copy icons to `/assets/icons/` folder

## Required Icon Sizes

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Manual Creation (Photoshop/GIMP/Figma)

1. Create 512x512 design with:
   - App name or logo
   - Background color: #121212 (dark) or #1db954 (accent green)
   - Simple, recognizable design

2. Export in all required sizes

3. Save to `/assets/icons/`

## Placeholder Image

Create a simple placeholder for `/assets/images/placeholder.png`:
- Size: 300x300
- Gray background with music note icon
- Or use: https://via.placeholder.com/300x300/282828/b3b3b3?text=Music

## Temporary Solution

For testing, you can use placeholder images:

```bash
cd assets/icons
# Create simple colored squares (macOS)
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#1db954 icon-${size}x${size}.png
done

cd ../images
convert -size 300x300 xc:#282828 placeholder.png
```

Or just use online placeholders in manifest.json temporarily:
```json
{
  "src": "https://via.placeholder.com/192x192/1db954/ffffff?text=YT",
  "sizes": "192x192",
  "type": "image/png"
}
```
