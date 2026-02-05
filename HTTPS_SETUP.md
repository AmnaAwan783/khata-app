# HTTPS Setup Guide

## ✅ SSL Certificates Generated

Your Flask app is now configured for HTTPS!

## 📁 Files Created

- `cert.pem` - SSL certificate
- `key.pem` - SSL private key
- `generate_cert.py` - Certificate generator script

## 🚀 How to Use

### 1. Start the Flask App

```bash
python app.py
```

The app will automatically detect the SSL certificates and start with HTTPS!

### 2. Access Your App

**On Desktop:**
- Open: `https://localhost:5000`
- Browser will show a security warning (this is normal for self-signed certificates)
- Click "Advanced" → "Proceed to localhost" (or your IP)

**On Mobile Phone:**
- Find your computer's IP address (shown when app starts)
- Open: `https://YOUR_IP:5000` (e.g., `https://192.168.18.64:5000`)
- Chrome/Edge will show a security warning
- Click "Advanced" → "Proceed to [IP address]" (or similar)

## ⚠️ Important Notes

### Security Warning

Since this is a **self-signed certificate** (not from a trusted authority), browsers will show a security warning. This is **normal and safe** for development/testing.

**To proceed:**
- **Desktop Chrome/Edge**: Click "Advanced" → "Proceed to localhost"
- **Mobile Chrome**: Scroll down → "Advanced" → "Proceed to [IP]"

### Why HTTPS?

The **Contact Picker API** requires HTTPS to work. Without HTTPS:
- ❌ Contact picker won't work
- ❌ Some browser features require secure context
- ❌ PWA features may be limited

With HTTPS:
- ✅ Contact picker works!
- ✅ All browser features available
- ✅ Better security

## 🔄 Regenerate Certificates

If you need to regenerate certificates:

```bash
python generate_cert.py
```

Then restart the Flask app.

## 📱 Testing Contact Picker

1. Start Flask app with HTTPS
2. Access from your phone Chrome browser using HTTPS
3. Go to Customers page
4. Click "📱 Pick from Contacts"
5. Contact list should open! ✅

## 🛠️ Troubleshooting

### Certificate Not Found Error

If app starts with HTTP instead of HTTPS:
- Check that `cert.pem` and `key.pem` exist in project folder
- Run `python generate_cert.py` to create them

### Browser Won't Accept Certificate

**Desktop:**
- Click "Advanced" in the security warning
- Click "Proceed anyway" or similar

**Mobile:**
- Scroll down in the warning page
- Look for "Advanced" or "Details"
- Click "Proceed to [IP]" or similar

### Still Getting HTTP

- Make sure you're using `https://` not `http://` in the URL
- Check browser address bar shows padlock icon
- Restart Flask app if needed

---

**Status**: ✅ HTTPS is now enabled!



