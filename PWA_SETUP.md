# PWA Setup Instructions

## Icon Files Required

The PWA manifest references two icon files that need to be created:

1. `static/icon-192.png` (192x192 pixels)
2. `static/icon-512.png` (512x512 pixels)

### Quick Setup Options:

**Option 1: Use the HTML generator**
- Open `static/generate-icons.html` in a browser
- Right-click each canvas and save as PNG files
- Place them in the `static/` folder

**Option 2: Create manually**
- Use any image editor to create square icons
- Recommended colors: Background #2C3E50, Accent #1ABC9C
- Save as PNG format

**Option 3: Use online tools**
- Visit https://realfavicongenerator.net/ or similar
- Upload a logo/image
- Download the generated icons

## Testing PWA Features

1. **Install as PWA:**
   - Open the app in Chrome/Edge
   - Click the install icon in the address bar
   - Or use Menu > Install App

2. **Test Offline Mode:**
   - Open DevTools > Application > Service Workers
   - Check "Offline" checkbox
   - Refresh the page - it should still load

3. **Test IndexedDB:**
   - Open DevTools > Application > IndexedDB
   - Check "StoreBillingDB" database
   - Verify customers, items, and sales are stored

4. **Test Autocomplete:**
   - Go to Add Sale page
   - Select "Credit Sale"
   - Type in customer search field
   - Should show autocomplete dropdown

## Features Implemented

✅ PWA Manifest
✅ Service Worker for offline caching
✅ IndexedDB for offline data storage
✅ Customer search autocomplete
✅ Mobile-first responsive design
✅ Automatic sale calculations
✅ WhatsApp invoice integration
✅ Offline sale recording
✅ Background sync when online
✅ Print-friendly invoice

## Notes

- The app works offline after first load
- Offline sales are synced automatically when connection is restored
- Customer and item data is cached in IndexedDB
- Service worker caches static assets for offline access

