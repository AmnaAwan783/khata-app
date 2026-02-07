# Migrate from SQLite to PostgreSQL on Koyeb (If Already Deployed)

If you already deployed your app on Koyeb and data keeps disappearing, follow these steps to switch to PostgreSQL.

---

## ⚠️ Important Note

**Data in SQLite will be LOST when you switch to PostgreSQL** because Koyeb's filesystem is ephemeral. You'll lose all previous customers, items, and sales. Plan accordingly!

---

## What Changed in the Code?

The app now supports both:
- **SQLite** for local development (if `DATABASE_URL` is not set)
- **PostgreSQL** for Koyeb production (when `DATABASE_URL` is set)

You don't need to change any code - just add one environment variable!

---

## Steps to Fix (5 Minutes)

### 1. Add PostgreSQL Service to Koyeb

1. Go to Koyeb Dashboard → Your Khata App
2. Click **"Add-ons"** → **"Create Add-on"**
3. Select **"PostgreSQL"**
4. Name it: `khata-db`
5. Click **"Create"** and wait 2-3 minutes
6. Copy the connection string (it looks like: `postgresql://user:pass@host:port/dbname`)

### 2. Add DATABASE_URL Environment Variable

1. Go to your app → **"Settings"** → **"Environment Variables"**
2. Click **"Add Variable"**
3. Set:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your PostgreSQL connection string from step 1

4. Also ensure you have:
   - **Key**: `SECRET_KEY`
   - **Value**: A random string (use `python -c "import secrets; print(secrets.token_hex(32))"`)

5. Click **"Save"**

### 3. Redeploy

1. Go back to your app main page
2. Click **"Redeploy"** button
3. Wait for deployment (2-5 minutes)

### 4. Test

1. Go to your app URL
2. Add a customer, item, or sale
3. Close the app and reopen it
4. **Data should be there!** ✅
5. Click "Redeploy" again
6. **Data should STILL be there!** ✅

---

## If It Still Doesn't Work

### Check 1: DATABASE_URL is Set
```
Go to Settings → Environment Variables
Make sure DATABASE_URL appears in the list
```

### Check 2: PostgreSQL Connection String Format
It should look like:
```
postgresql://username:password@hostname:5432/databasename
```

NOT like:
```
sqlite:///database.db
```

### Check 3: App Logs
```
Go to Logs tab
Look for "Using sqlite" or "Using postgresql"
Should see: "Using postgresql"
If you see "Using sqlite", then DATABASE_URL is not set
```

---

## After Setup

All the following features now work perfectly:

✅ Customers are saved permanently  
✅ Items are saved permanently  
✅ Sales are saved permanently  
✅ Wholesaler transactions are saved  
✅ Data persists after app restart  
✅ Data persists after Koyeb redeploy  
✅ Category and Unit fields in wholesalers  
✅ Real-time stock display in add sale  

---

## Quick Checklist

- [ ] PostgreSQL add-on created on Koyeb
- [ ] DATABASE_URL environment variable set
- [ ] SECRET_KEY environment variable set
- [ ] App redeployed after setting variables
- [ ] App shows "Running" status (green)
- [ ] Test: Add item → Refresh → Item still exists
- [ ] Test: Add item → Redeploy → Item still exists

---

## Can I Keep My Old Data?

Unfortunately, no. When you switch from SQLite to PostgreSQL:
- Old SQLite data is lost (Koyeb's filesystem is ephemeral)
- New PostgreSQL database starts empty

To avoid losing data, export your important data before switching (if possible).

---

That's it! Your app is now production-ready with persistent storage. 🎉
