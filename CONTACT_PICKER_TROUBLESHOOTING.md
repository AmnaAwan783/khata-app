# Contact Picker Troubleshooting Guide

## ⚠️ Important: Browser Support

The Contact Picker API has **very limited browser support**:

### ✅ Supported:
- **Chrome 80+ on Android**
- **Edge 80+ on Android**

### ❌ NOT Supported:
- **iOS Safari** (iPhone/iPad)
- **Desktop browsers** (Chrome, Edge, Firefox on Windows/Mac)
- **Samsung Internet**
- **Firefox Mobile**

## 🔍 How to Check if Contact Picker Works

### Step 1: Check Your Browser
1. Open the app on your mobile device
2. Open browser console (if possible) or check the status message
3. Look for: "Tap 'Pick from Contacts' to browse your phone contacts"

### Step 2: Test the Button
1. Go to Customers page or Add Sale → Add Customer
2. Click "📱 Pick from Contacts" button
3. **If supported**: Contact list should open
4. **If not supported**: You'll see an alert explaining why

### Step 3: Check Console (Developer Mode)
Open browser console and look for:
```
Contact Picker API Check: {
  'contacts in navigator': true/false,
  'ContactsManager in window': true/false,
  'select in navigator.contacts': true/false
}
```

## 🛠️ Troubleshooting Steps

### Issue: Button doesn't do anything
**Possible causes:**
1. Script not loaded - Check browser console for errors
2. Button not initialized - Check console for initialization messages
3. API not supported - Check browser and device

**Solution:**
- Refresh the page
- Check browser console for errors
- Make sure you're using Chrome/Edge on Android

### Issue: "Contact picker not available" message
**This means:**
- Your browser/device doesn't support the Contact Picker API
- This is normal for iOS devices and desktop browsers

**Solution:**
- Use Chrome or Edge on Android
- Or enter phone numbers manually (always works)

### Issue: Button is not visible
**Solution:**
- Button should always be visible now
- Check if it's hidden by CSS
- Try refreshing the page

## 📱 Alternative: Manual Entry

If Contact Picker doesn't work:
1. The phone input field still works normally
2. You can type the phone number manually
3. The form will accept any valid phone number

## 🔧 What Was Fixed

1. ✅ Button always visible (never hidden)
2. ✅ Better error messages
3. ✅ Console logging for debugging
4. ✅ Script loaded globally in base.html
5. ✅ Improved initialization checks

## 📝 Testing on Your Device

1. **Open the app** on your Android phone
2. **Use Chrome or Edge browser** (not Samsung Internet)
3. **Go to Customers page**
4. **Click "Pick from Contacts"**
5. **Check what happens:**
   - If contact list opens → ✅ Working!
   - If alert appears → Check the message for details
   - If nothing happens → Check browser console

## 💡 Quick Test

Open browser console and run:
```javascript
console.log('Contacts in navigator:', 'contacts' in navigator);
console.log('ContactsManager:', 'ContactsManager' in window);
if ('contacts' in navigator) {
    console.log('Has select:', 'select' in navigator.contacts);
}
```

If all are `true`, Contact Picker should work!

---

**Note**: If you're on iOS or desktop, Contact Picker will not work. This is a browser limitation, not a bug in the app.

