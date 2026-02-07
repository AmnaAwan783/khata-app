# Data Loss Issue - Root Cause & Fix

## What Was Happening?

When you reopened the app after some time, your items and sales data disappeared because:

### Root Cause: SQLite Database Path Issue
- Your database was stored in `instance/database.db`
- This is a **relative path** that depends on Flask's instance folder
- The instance folder path could change or become inconsistent across app restarts
- There was no guarantee the database file would be found in the same location each time

### Why on Koyeb Specifically?
- Koyeb's filesystem is **ephemeral** (temporary)
- Any files in the instance folder get **deleted when the app restarts or redeploys**
- Your database file was lost permanently with each restart

---

## What's Been Fixed?

### 1. **Absolute Database Path**
   - Changed from relative path: `sqlite:///database.db`
   - To absolute path: `sqlite:////absolute/path/instance/database.db`
   - This ensures the database is always found in the same location

### 2. **Environment-Based Configuration**
   - Added support for `DATABASE_URL` environment variable
   - For **local development**: Uses SQLite (data persists locally)
   - For **Koyeb production**: Uses PostgreSQL (data persists on servers)

### 3. **Automatic Table Creation**
   - `init_db()` function creates all tables automatically on app startup
   - No manual database setup needed

### 4. **PostgreSQL Support Added**
   - Added `psycopg2-binary` to requirements.txt
   - App now supports both SQLite (local) and PostgreSQL (production)

---

## Files Changed

✅ `app.py` - Updated database configuration and path handling  
✅ `requirements.txt` - Added PostgreSQL driver  
✅ `.env.example` - Created template for environment variables  
✅ `KOYEB_DEPLOYMENT_GUIDE.md` - Created step-by-step deployment guide  
✅ `Procfile` - Created for Koyeb deployment  

---

## Your Data Is Safe Now

### Local (Development)
- Data is stored in `instance/database.db`
- Persists across app restarts
- Lost only if you delete the `instance/` folder

### Koyeb (Production)
- Follow the **KOYEB_DEPLOYMENT_GUIDE.md** to set up PostgreSQL
- Data persists across restarts and redeployments
- No more data loss!

---

## Next Steps to Deploy on Koyeb

1. **Read:** `KOYEB_DEPLOYMENT_GUIDE.md` (in your project root)
2. **Set up PostgreSQL** on Koyeb (free tier available)
3. **Add environment variables** to your Koyeb app
4. **Push to GitHub** and redeploy

**Important:** Without PostgreSQL on Koyeb, your data will STILL be lost on each restart. The guide explains why and how to set it up properly.

